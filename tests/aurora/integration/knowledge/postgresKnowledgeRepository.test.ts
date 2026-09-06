import { AuroraMigrationRegistry } from "@/lib/aurora/persistence/AuroraMigrationRegistry";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  KnowledgeEntityAlreadyExistsError,
  KnowledgeEntityNotFoundError,
  PostgresKnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories";
import { PostgresKnowledgeRepositoryUnsafe } from "@/tests/aurora/integration/knowledge/postgresKnowledgeRepositoryUnsafe";
import {
  AURORA_LIVE_POSTGRES,
  cleanupPostgresTestHarness,
  setupPostgresTestHarness,
  type PostgresTestHarness,
} from "@/tests/aurora/helpers/postgresTestHarness";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

function createKnowledgeEntity(
  tenantId: string,
  brandId: string,
  overrides: Partial<KnowledgeEntity> & Pick<KnowledgeEntity, "id" | "entityType">,
): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get(overrides.entityType);
  if (!definition?.domain) {
    throw new Error(`Unknown entity type: ${overrides.entityType}`);
  }

  return {
    tenantId,
    brandId,
    domain: definition.domain,
    status: "acquired",
    classification: "internal",
    title: "Knowledge entity",
    content: { note: "initial" },
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

describe.skipIf(!AURORA_LIVE_POSTGRES)("PostgreSQL knowledge repository", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;
  let repository: PostgresKnowledgeRepository;
  let unsafeRepository: PostgresKnowledgeRepositoryUnsafe;
  let entityId: string;

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
      repository = new PostgresKnowledgeRepository(harness.tenantDbScope);
      unsafeRepository = new PostgresKnowledgeRepositoryUnsafe(harness.tenantDbScope);
      entityId = "knw_550e8400-e29b-41d4-a716-446655440000";
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping knowledge repository suite:", error);
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

  it("registers migration version 7", () => {
    const registry = new AuroraMigrationRegistry();
    expect(registry.getByVersion(7)?.id).toBe("007_knowledge_memory");
  });

  it("creates knowledge tables after migration", async () => {
    const result = await harness!.privilegedConnection.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN ('aurora_knowledge_entity', 'aurora_knowledge_entity_version')
       ORDER BY table_name ASC`,
    );
    expect(result.rows.map((row) => row.table_name)).toEqual([
      "aurora_knowledge_entity",
      "aurora_knowledge_entity_version",
    ]);
  });

  it("creates and retrieves an entity", async () => {
    const entity = createKnowledgeEntity(harness!.tenantAId, harness!.brandAId, {
      id: entityId,
      entityType: "brand.profile",
      title: "Brand profile",
    });

    await repository.create(harness!.tenantAId, entity);
    await expect(repository.getById(harness!.tenantAId, entityId)).resolves.toEqual(entity);
  });

  it("rejects duplicate entity IDs", async () => {
    const duplicate = createKnowledgeEntity(harness!.tenantAId, harness!.brandAId, {
      id: entityId,
      entityType: "brand.profile",
    });

    await expect(repository.create(harness!.tenantAId, duplicate)).rejects.toBeInstanceOf(
      KnowledgeEntityAlreadyExistsError,
    );
  });

  it("updates create version 2 while preserving version 1", async () => {
    const original = await repository.getById(harness!.tenantAId, entityId);
    expect(original?.version).toBe(1);

    const updated = {
      ...original!,
      status: "provisional" as const,
      classification: "confidential" as const,
      sourceType: "source.agent.analysis" as const,
      sourceTrust: 0.6,
      title: "Updated brand profile",
      content: { note: "updated" },
      version: 2,
      updatedAt: "2026-08-27T01:00:00.000Z",
    };

    await repository.update(harness!.tenantAId, entityId, {
      entity: updated,
      changedBy: "usr_001",
      changeReason: "Validation pass",
      versionCreatedAt: "2026-08-27T01:00:00.000Z",
    });

    const history = await repository.getVersionHistory(harness!.tenantAId, entityId);
    expect(history).toHaveLength(2);
    expect(history[0]?.snapshot).toEqual(original);
    expect(history[1]?.snapshot).toEqual(updated);
    expect(await repository.getById(harness!.tenantAId, entityId)).toEqual(updated);
  });

  it("returns deterministic version ordering", async () => {
    const current = await repository.getById(harness!.tenantAId, entityId);
    const versionThree = {
      ...current!,
      status: "validated" as const,
      version: 3,
      updatedAt: "2026-08-27T02:00:00.000Z",
    };

    await repository.update(harness!.tenantAId, entityId, {
      entity: versionThree,
      changedBy: "usr_approver",
    });

    const history = await repository.getVersionHistory(harness!.tenantAId, entityId);
    expect(history.map((record) => record.version)).toEqual([1, 2, 3]);
  });

  it("persists lifecycle, classification, and source metadata", async () => {
    const entity = await repository.getById(harness!.tenantAId, entityId);
    expect(entity).toMatchObject({
      status: "validated",
      classification: "confidential",
      sourceType: "source.agent.analysis",
      sourceTrust: 0.6,
    });
  });

  it("blocks cross-tenant reads", async () => {
    await expect(repository.getById(harness!.tenantBId, entityId)).resolves.toBeNull();
  });

  it("blocks cross-tenant updates", async () => {
    const current = await repository.getById(harness!.tenantAId, entityId);
    await expect(
      repository.update(harness!.tenantBId, entityId, {
        entity: {
          ...current!,
          tenantId: harness!.tenantBId,
          brandId: harness!.brandBId,
          version: 4,
          updatedAt: "2026-08-27T03:00:00.000Z",
        },
        changedBy: "usr_intruder",
      }),
    ).rejects.toBeInstanceOf(KnowledgeEntityNotFoundError);
  });

  it("blocks cross-tenant list visibility", async () => {
    const tenantAList = await repository.list(harness!.tenantAId);
    const tenantBList = await repository.list(harness!.tenantBId);

    expect(tenantAList.some((entry) => entry.id === entityId)).toBe(true);
    expect(tenantBList.some((entry) => entry.id === entityId)).toBe(false);
  });

  it("blocks cross-tenant version history access", async () => {
    await expect(repository.getVersionHistory(harness!.tenantBId, entityId)).rejects.toBeInstanceOf(
      KnowledgeEntityNotFoundError,
    );
  });

  it("enforces database-level RLS when tenant predicates are bypassed", async () => {
    await expect(
      unsafeRepository.getByIdWithoutTenantPredicate(harness!.tenantAId, entityId),
    ).resolves.toEqual(await repository.getById(harness!.tenantAId, entityId));

    await expect(
      unsafeRepository.countEntitiesForForeignTenantWithoutPredicate(
        harness!.tenantAId,
        harness!.tenantBId,
      ),
    ).resolves.toBe(0);

    await expect(
      unsafeRepository.countVersionHistoryForForeignTenantWithoutPredicate(
        harness!.tenantAId,
        harness!.tenantBId,
        entityId,
      ),
    ).resolves.toBe(0);
  });

  it("enforces composite tenant/entity foreign key on version records", async () => {
    const entity = await repository.getById(harness!.tenantAId, entityId);
    expect(entity).toBeTruthy();

    const constraint = await harness!.privilegedConnection.query<{ constraint_name: string }>(
      `SELECT tc.constraint_name
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
       WHERE tc.table_schema = 'public'
         AND tc.table_name = 'aurora_knowledge_entity_version'
         AND tc.constraint_type = 'FOREIGN KEY'
         AND tc.constraint_name = 'aurora_knowledge_entity_version_entity_fk'
       GROUP BY tc.constraint_name
       HAVING array_agg(kcu.column_name ORDER BY kcu.ordinal_position) = ARRAY['tenant_id', 'entity_id']::name[]`,
    );
    expect(constraint.rows[0]?.constraint_name).toBe("aurora_knowledge_entity_version_entity_fk");

    await expect(
      harness!.systemDbScope.run(async (client) => {
        await client.query(
          `INSERT INTO aurora_knowledge_entity_version (
             tenant_id, entity_id, version, snapshot, changed_by, change_reason, created_at
           ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
          [
            harness!.tenantBId,
            entityId,
            99,
            JSON.stringify(entity),
            "usr_intruder",
            "Cross-tenant version injection",
            "2026-08-27T04:00:00.000Z",
          ],
        );
      }),
    ).rejects.toMatchObject({ code: "23503" });
  });
});

describe("PostgreSQL knowledge repository availability marker", () => {
  it("reports whether live PostgreSQL verification is configured", () => {
    if (!AURORA_LIVE_POSTGRES) {
      expect(process.env.AURORA_LIVE_POSTGRES).not.toBe("1");
    } else {
      expect(process.env.ORION_DATABASE_URL).toBeTruthy();
      expect(process.env.AURORA_APP_DATABASE_URL).toBeTruthy();
    }
  });
});
