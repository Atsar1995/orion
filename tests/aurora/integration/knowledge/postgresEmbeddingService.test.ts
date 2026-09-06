import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  PostgresEmbeddingRepository,
  PostgresKnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories";
import {
  DefaultEmbeddingService,
  DeterministicEmbeddingProvider,
} from "@/lib/aurora/knowledge/services";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
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
    content: { note: "embedding integration" },
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

describe.skipIf(!AURORA_LIVE_POSTGRES)("PostgreSQL embedding service", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;
  let service: DefaultEmbeddingService;
  let entityId: string;

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
      entityId = "knw_550e8400-e29b-41d4-a716-446655440000";
      const knowledgeRepository = new PostgresKnowledgeRepository(harness.tenantDbScope);
      const embeddingRepository = new PostgresEmbeddingRepository(harness.tenantDbScope);
      service = new DefaultEmbeddingService(
        new DeterministicEmbeddingProvider(),
        embeddingRepository,
        knowledgeRepository,
        new DefaultAuroraAuthorizationService(),
      );

      await knowledgeRepository.create(
        harness.tenantAId,
        createKnowledgeEntity(harness.tenantAId, harness.brandAId, {
          id: entityId,
          entityType: "brand.profile",
          title: "Brand profile for embedding service",
        }),
      );
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping embedding service suite:", error);
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

  it("indexes embeddings through PostgreSQL", async () => {
    const ctx = createTestAuroraRuntimeContext({
      tenantId: harness!.tenantAId,
      userId: harness!.userAId,
      brandId: harness!.brandAId,
    });

    const first = await service.indexEntity(ctx, entityId);
    expect(first.chunksIndexed).toBeGreaterThan(0);

    const second = await service.indexEntity(ctx, entityId);
    expect(second.chunksIndexed).toBe(0);
    expect(second.chunksSkipped).toBe(first.chunksIndexed);
  });

  it("retrieves indexed embeddings through semanticSearch", async () => {
    const ctx = createTestAuroraRuntimeContext({
      tenantId: harness!.tenantAId,
      userId: harness!.userAId,
      brandId: harness!.brandAId,
    });
    const query = await service.embed(ctx, "Brand profile for embedding service brand.profile {}");

    const matches = await service.semanticSearch(ctx, query, {
      brandId: harness!.brandAId,
      minSimilarity: 0.5,
      topK: 5,
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]?.embedding.entityId).toBe(entityId);
  });

  it("enforces tenant isolation for service operations", async () => {
    const tenantBCtx = createTestAuroraRuntimeContext({
      tenantId: harness!.tenantBId,
      userId: harness!.userBId,
      brandId: harness!.brandBId,
    });

    await expect(service.removeFromIndex(tenantBCtx, entityId)).rejects.toMatchObject({
      name: "KnowledgeEntityNotFoundError",
    });
  });
});
