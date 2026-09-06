import { AuroraMigrationRegistry } from "@/lib/aurora/persistence/AuroraMigrationRegistry";
import {
  AURORA_LIVE_POSTGRES,
  cleanupPostgresTestHarness,
  setupPostgresTestHarness,
  type PostgresTestHarness,
} from "@/tests/aurora/helpers/postgresTestHarness";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const REQUIRED_EMBEDDING_COLUMNS = [
  "id",
  "tenant_id",
  "brand_id",
  "entity_id",
  "chunk_index",
  "embedding",
  "content_hash",
  "created_at",
] as const;

describe("migration 009 registry", () => {
  it("registers migration version 9", () => {
    const registry = new AuroraMigrationRegistry();
    expect(registry.getLatestVersion()).toBe(9);
    expect(registry.getByVersion(9)?.id).toBe("009_knowledge_embedding");
  });
});

describe.skipIf(!AURORA_LIVE_POSTGRES)("PostgreSQL knowledge embedding migration", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping knowledge embedding migration suite:", error);
    }
  });

  afterAll(async () => {
    if (harness && postgresAvailable) {
      await cleanupPostgresTestHarness(harness);
    }
  });

  it("runs only when live PostgreSQL is reachable", () => {
    expect(postgresAvailable).toBe(true);
  });

  it("installs the pgvector extension", async () => {
    const result = await harness!.privilegedConnection.query<{ extname: string }>(
      `SELECT extname FROM pg_extension WHERE extname = 'vector'`,
    );
    expect(result.rows.map((row) => row.extname)).toContain("vector");
  });

  it("creates the aurora_knowledge_embedding table with required columns", async () => {
    const columns = await harness!.privilegedConnection.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'aurora_knowledge_embedding'
       ORDER BY ordinal_position ASC`,
    );
    expect(columns.rows.map((row) => row.column_name)).toEqual([...REQUIRED_EMBEDDING_COLUMNS]);
  });

  it("defines composite tenant/entity integrity and chunk uniqueness constraints", async () => {
    const constraints = await harness!.privilegedConnection.query<{
      conname: string;
      contype: string;
    }>(
      `SELECT conname, contype::text AS contype
       FROM pg_constraint
       WHERE conrelid = 'aurora_knowledge_embedding'::regclass
       ORDER BY conname ASC`,
    );
    const names = constraints.rows.map((row) => row.conname);
    expect(names).toContain("aurora_knowledge_embedding_entity_fk");
    expect(names).toContain("aurora_knowledge_embedding_chunk_index_nonnegative");
    expect(names).toContain("aurora_knowledge_embedding_tenant_id_entity_id_chunk_index_key");
  });

  it("creates tenant lookup and HNSW vector indexes", async () => {
    const indexes = await harness!.privilegedConnection.query<{ indexname: string; indexdef: string }>(
      `SELECT indexname, indexdef
       FROM pg_indexes
       WHERE schemaname = 'public'
         AND tablename = 'aurora_knowledge_embedding'
       ORDER BY indexname ASC`,
    );
    const indexNames = indexes.rows.map((row) => row.indexname);
    expect(indexNames).toContain("idx_aurora_knowledge_embedding_tenant_entity");
    expect(indexNames).toContain("idx_aurora_knowledge_embedding_tenant_brand");
    expect(indexNames).toContain("idx_aurora_knowledge_embedding_vector");

    const vectorIndex = indexes.rows.find(
      (row) => row.indexname === "idx_aurora_knowledge_embedding_vector",
    );
    expect(vectorIndex?.indexdef.toLowerCase()).toContain("hnsw");
    expect(vectorIndex?.indexdef.toLowerCase()).toContain("vector_cosine_ops");
  });

  it("enables RLS and FORCE RLS on aurora_knowledge_embedding", async () => {
    const result = await harness!.privilegedConnection.query<{
      relrowsecurity: boolean;
      relforcerowsecurity: boolean;
    }>(
      `SELECT relrowsecurity, relforcerowsecurity
       FROM pg_class
       WHERE relname = 'aurora_knowledge_embedding'`,
    );
    expect(result.rows[0]?.relrowsecurity).toBe(true);
    expect(result.rows[0]?.relforcerowsecurity).toBe(true);
  });

  it("defines tenant isolation policy on aurora_knowledge_embedding", async () => {
    const policies = await harness!.privilegedConnection.query<{
      policyname: string;
      cmd: string;
    }>(
      `SELECT policyname, cmd
       FROM pg_policies
       WHERE schemaname = 'public'
         AND tablename = 'aurora_knowledge_embedding'
       ORDER BY policyname ASC`,
    );
    expect(policies.rows.map((row) => row.policyname)).toContain(
      "aurora_knowledge_embedding_tenant_isolation",
    );
    expect(policies.rows[0]?.cmd).toBe("ALL");
  });

  it("adds entity FTS foundation for keyword search", async () => {
    const columns = await harness!.privilegedConnection.query<{ column_name: string; data_type: string }>(
      `SELECT column_name, udt_name AS data_type
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'aurora_knowledge_entity'
         AND column_name = 'search_fts'`,
    );
    expect(columns.rows[0]?.column_name).toBe("search_fts");
    expect(columns.rows[0]?.data_type).toBe("tsvector");

    const indexes = await harness!.privilegedConnection.query<{ indexname: string }>(
      `SELECT indexname
       FROM pg_indexes
       WHERE schemaname = 'public'
         AND tablename = 'aurora_knowledge_entity'
         AND indexname = 'idx_aurora_knowledge_entity_search_fts'`,
    );
    expect(indexes.rows).toHaveLength(1);
  });

  it("rejects cross-tenant embedding entity references at the database layer", async () => {
    const entityId = "knw_770e8400-e29b-41d4-a716-446655440002";
    await harness!.systemDbScope.run(async (client) => {
      await client.query(
        `INSERT INTO aurora_knowledge_entity (
           id, tenant_id, brand_id, domain, entity_type, status, classification,
           title, content, source_type, source_trust, version, curator_agent,
           created_at, updated_at
         ) VALUES (
           $1, $2, $3, 'knowledge.brand', 'brand.profile', 'validated', 'internal',
           'Tenant A profile', '{}', 'source.human.brand_manager', 1, 1,
           'knowledge-manager', '2026-08-27T00:00:00.000Z', '2026-08-27T00:00:00.000Z'
         )`,
        [entityId, harness!.tenantAId, harness!.brandAId],
      );
    });

    const zeroVector = `[${Array.from({ length: 1536 }, () => 0).join(",")}]`;
    await expect(
      harness!.systemDbScope.run(async (client) => {
        await client.query(
          `INSERT INTO aurora_knowledge_embedding (
             tenant_id, brand_id, entity_id, chunk_index, embedding, content_hash
           ) VALUES ($1, $2, $3, 0, $4::vector, $5)`,
          [harness!.tenantBId, harness!.brandBId, entityId, zeroVector, "hash-cross-tenant"],
        );
      }),
    ).rejects.toMatchObject({ code: "23503" });
  });
});
