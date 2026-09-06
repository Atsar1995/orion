import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  EMBEDDING_VECTOR_DIMENSION,
  KnowledgeEmbeddingAlreadyExistsError,
  PostgresEmbeddingRepository,
  PostgresKnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories";
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
    status: "validated",
    classification: "internal",
    title: "Knowledge entity",
    content: {},
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

function createVector(seed: number): number[] {
  return Array.from({ length: EMBEDDING_VECTOR_DIMENSION }, (_, index) => {
    const value = Math.sin(seed + index * 0.01);
    return Number(value.toFixed(6));
  });
}

function unitVector(dimensionIndex: number): number[] {
  const vector = createVector(0);
  vector[dimensionIndex] = 1;
  return vector;
}

describe.skipIf(!AURORA_LIVE_POSTGRES)("PostgreSQL embedding repository", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;
  let knowledgeRepository: PostgresKnowledgeRepository;
  let embeddingRepository: PostgresEmbeddingRepository;
  let entityId: string;

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
      knowledgeRepository = new PostgresKnowledgeRepository(harness.tenantDbScope);
      embeddingRepository = new PostgresEmbeddingRepository(harness.tenantDbScope);
      entityId = "knw_550e8400-e29b-41d4-a716-446655440000";

      await knowledgeRepository.create(
        harness.tenantAId,
        createKnowledgeEntity(harness.tenantAId, harness.brandAId, {
          id: entityId,
          entityType: "brand.profile",
        }),
      );
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping embedding repository suite:", error);
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

  it("creates, lists, and deletes embedding chunks", async () => {
    const saved = await embeddingRepository.save(harness!.tenantAId, {
      tenantId: harness!.tenantAId,
      brandId: harness!.brandAId,
      entityId,
      chunkIndex: 0,
      embedding: createVector(1),
      contentHash: "hash-chunk-0",
      createdAt: "2026-08-27T01:00:00.000Z",
    });

    await expect(embeddingRepository.getById(harness!.tenantAId, saved.id)).resolves.toMatchObject({
      id: saved.id,
      entityId,
      chunkIndex: 0,
      contentHash: "hash-chunk-0",
    });
    await expect(embeddingRepository.listByEntity(harness!.tenantAId, entityId)).resolves.toHaveLength(
      1,
    );

    await expect(embeddingRepository.deleteByEntity(harness!.tenantAId, entityId)).resolves.toBe(1);
    await expect(embeddingRepository.listByEntity(harness!.tenantAId, entityId)).resolves.toEqual(
      [],
    );
  });

  it("performs tenant-scoped vector similarity search with brand filtering", async () => {
    const brandBEntityId = "knw_660e8400-e29b-41d4-a716-446655440001";
    await knowledgeRepository.create(
      harness!.tenantAId,
      createKnowledgeEntity(harness!.tenantAId, harness!.brandBId, {
        id: brandBEntityId,
        entityType: "brand.profile",
        title: "Brand B profile",
      }),
    );

    const query = unitVector(0);
    await embeddingRepository.save(harness!.tenantAId, {
      tenantId: harness!.tenantAId,
      brandId: harness!.brandAId,
      entityId,
      chunkIndex: 0,
      embedding: query,
      contentHash: "hash-brand-a",
    });
    await embeddingRepository.save(harness!.tenantAId, {
      tenantId: harness!.tenantAId,
      brandId: harness!.brandBId,
      entityId: brandBEntityId,
      chunkIndex: 0,
      embedding: query,
      contentHash: "hash-brand-b",
    });

    const brandMatches = await embeddingRepository.searchSimilar(harness!.tenantAId, query, {
      brandId: harness!.brandAId,
      minSimilarity: 0.99,
      topK: 5,
    });
    expect(brandMatches).toHaveLength(1);
    expect(brandMatches[0]?.embedding.brandId).toBe(harness!.brandAId);
  });

  it("enforces tenant isolation through AuroraTenantDbScope", async () => {
    const tenantBEntityId = "knw_770e8400-e29b-41d4-a716-446655440002";
    await knowledgeRepository.create(
      harness!.tenantBId,
      createKnowledgeEntity(harness!.tenantBId, harness!.brandBId, {
        id: tenantBEntityId,
        entityType: "brand.profile",
      }),
    );

    const tenantBEmbedding = await embeddingRepository.save(harness!.tenantBId, {
      tenantId: harness!.tenantBId,
      brandId: harness!.brandBId,
      entityId: tenantBEntityId,
      chunkIndex: 0,
      embedding: createVector(99),
      contentHash: "hash-tenant-b",
    });

    await expect(
      embeddingRepository.getById(harness!.tenantAId, tenantBEmbedding.id),
    ).resolves.toBeNull();
    await expect(
      embeddingRepository.listByEntity(harness!.tenantAId, tenantBEntityId),
    ).resolves.toEqual([]);
  });

  it("rejects duplicate chunk inserts via database constraint", async () => {
    await embeddingRepository.save(harness!.tenantAId, {
      tenantId: harness!.tenantAId,
      brandId: harness!.brandAId,
      entityId,
      chunkIndex: 1,
      embedding: createVector(2),
      contentHash: "hash-dup-1",
    });

    await expect(
      embeddingRepository.save(harness!.tenantAId, {
        tenantId: harness!.tenantAId,
        brandId: harness!.brandAId,
        entityId,
        chunkIndex: 1,
        embedding: createVector(3),
        contentHash: "hash-dup-1-other",
      }),
    ).rejects.toBeInstanceOf(KnowledgeEmbeddingAlreadyExistsError);
  });

  it("rejects cross-tenant entity references via composite foreign key", async () => {
    await expect(
      embeddingRepository.save(harness!.tenantBId, {
        tenantId: harness!.tenantBId,
        brandId: harness!.brandBId,
        entityId,
        chunkIndex: 0,
        embedding: createVector(4),
        contentHash: "hash-cross-tenant",
      }),
    ).rejects.toMatchObject({ code: "23503" });
  });

  it("respects RLS by hiding tenant B rows from tenant A similarity search", async () => {
    const tenantBEntityId = "knw_880e8400-e29b-41d4-a716-446655440003";
    await knowledgeRepository.create(
      harness!.tenantBId,
      createKnowledgeEntity(harness!.tenantBId, harness!.brandBId, {
        id: tenantBEntityId,
        entityType: "brand.profile",
      }),
    );

    const query = unitVector(1);
    await embeddingRepository.save(harness!.tenantBId, {
      tenantId: harness!.tenantBId,
      brandId: harness!.brandBId,
      entityId: tenantBEntityId,
      chunkIndex: 0,
      embedding: query,
      contentHash: "hash-rls-b",
    });

    await expect(
      embeddingRepository.searchSimilar(harness!.tenantAId, query, {
        minSimilarity: 0,
        topK: 10,
      }),
    ).resolves.toEqual([]);
  });
});
