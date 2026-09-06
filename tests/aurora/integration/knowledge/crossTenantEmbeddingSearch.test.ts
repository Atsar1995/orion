import { randomUUID } from "node:crypto";
import {
  EMBEDDING_VECTOR_DIMENSION,
  PostgresEmbeddingRepository,
  PostgresKnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories";
import { DefaultSemanticSearchEngine } from "@/lib/aurora/knowledge/retrieval/SemanticSearchEngine";
import {
  DefaultEmbeddingService,
  DeterministicEmbeddingProvider,
} from "@/lib/aurora/knowledge/services";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import {
  AURORA_LIVE_POSTGRES,
  cleanupPostgresTestHarness,
  setupPostgresTestHarness,
  type PostgresTestHarness,
} from "@/tests/aurora/helpers/postgresTestHarness";
import {
  createHarnessContext,
  createKnowledgeEntity,
} from "@/tests/aurora/helpers/knowledgeSecurityFixtures";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

function unitVector(dimensionIndex: number): number[] {
  const vector = Array.from({ length: EMBEDDING_VECTOR_DIMENSION }, () => 0);
  vector[dimensionIndex] = 1;
  return vector;
}

describe.skipIf(!AURORA_LIVE_POSTGRES)("crossTenantEmbeddingSearch", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;
  let knowledgeRepository: PostgresKnowledgeRepository;
  let embeddingRepository: PostgresEmbeddingRepository;
  let embeddingService: DefaultEmbeddingService;
  let semanticSearchEngine: DefaultSemanticSearchEngine;
  let tenantAEntityId: string;
  let tenantBEntityId: string;
  let queryVector: number[];

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
      knowledgeRepository = new PostgresKnowledgeRepository(harness.tenantDbScope);
      embeddingRepository = new PostgresEmbeddingRepository(harness.tenantDbScope);
      const authorization = new DefaultAuroraAuthorizationService();
      embeddingService = new DefaultEmbeddingService(
        new DeterministicEmbeddingProvider(),
        embeddingRepository,
        knowledgeRepository,
        authorization,
      );
      semanticSearchEngine = new DefaultSemanticSearchEngine(
        embeddingService,
        knowledgeRepository,
      );

      tenantAEntityId = `knw_${randomUUID()}`;
      tenantBEntityId = `knw_${randomUUID()}`;
      queryVector = unitVector(3);

      await knowledgeRepository.create(
        harness.tenantAId,
        createKnowledgeEntity(harness.tenantAId, harness.brandAId, {
          id: tenantAEntityId,
          entityType: "brand.profile",
          title: "Tenant A semantic profile",
        }),
      );
      await knowledgeRepository.create(
        harness.tenantBId,
        createKnowledgeEntity(harness.tenantBId, harness.brandBId, {
          id: tenantBEntityId,
          entityType: "brand.profile",
          title: "Tenant B semantic profile",
        }),
      );

      await embeddingRepository.save(harness.tenantAId, {
        tenantId: harness.tenantAId,
        brandId: harness.brandAId,
        entityId: tenantAEntityId,
        chunkIndex: 0,
        embedding: queryVector,
        contentHash: "hash-tenant-a-semantic",
      });
      await embeddingRepository.save(harness.tenantBId, {
        tenantId: harness.tenantBId,
        brandId: harness.brandBId,
        entityId: tenantBEntityId,
        chunkIndex: 0,
        embedding: queryVector,
        contentHash: "hash-tenant-b-semantic",
      });
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping crossTenantEmbeddingSearch suite:", error);
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

  it("hides tenant B embeddings from tenant A repository reads", async () => {
    const tenantBEmbeddings = await embeddingRepository.listByEntity(
      harness!.tenantBId,
      tenantBEntityId,
    );
    expect(tenantBEmbeddings).toHaveLength(1);

    await expect(
      embeddingRepository.getById(harness!.tenantAId, tenantBEmbeddings[0]!.id),
    ).resolves.toBeNull();
    await expect(
      embeddingRepository.listByEntity(harness!.tenantAId, tenantBEntityId),
    ).resolves.toEqual([]);
  });

  it("returns only tenant A entities from tenant-scoped vector similarity search", async () => {
    const matches = await embeddingRepository.searchSimilar(harness!.tenantAId, queryVector, {
      minSimilarity: 0,
      topK: 10,
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((match) => match.embedding.tenantId === harness!.tenantAId)).toBe(true);
    expect(matches.some((match) => match.embedding.entityId === tenantBEntityId)).toBe(false);
  });

  it("returns only tenant A entities from EmbeddingService semanticSearch", async () => {
    const tenantACtx = createHarnessContext(harness!, "A", {
      auroraPermissions: ["aurora.knowledge.read"],
    });
    const matches = await embeddingService.semanticSearch(tenantACtx, queryVector, {
      minSimilarity: 0,
      topK: 10,
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((match) => match.embedding.tenantId === harness!.tenantAId)).toBe(true);
    expect(matches.some((match) => match.embedding.entityId === tenantBEntityId)).toBe(false);
  });

  it("returns only tenant A entities from SemanticSearchEngine", async () => {
    const tenantACtx = createHarnessContext(harness!, "A", {
      auroraPermissions: ["aurora.knowledge.read"],
    });
    const result = await semanticSearchEngine.search(
      tenantACtx,
      { query: "semantic profile" },
      queryVector,
    );

    expect(result.entities.length).toBeGreaterThan(0);
    expect(result.entities.every((entry) => entry.entity.tenantId === harness!.tenantAId)).toBe(
      true,
    );
    expect(result.entities.some((entry) => entry.entity.id === tenantBEntityId)).toBe(false);
  });

  it("does not leak tenant B rows through tenant A similarity search despite identical vectors", async () => {
    await expect(
      embeddingRepository.searchSimilar(harness!.tenantAId, queryVector, {
        minSimilarity: 0,
        topK: 10,
      }),
    ).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          embedding: expect.objectContaining({ entityId: tenantAEntityId }),
        }),
      ]),
    );

    const tenantAMatches = await embeddingRepository.searchSimilar(harness!.tenantAId, queryVector, {
      minSimilarity: 0,
      topK: 10,
    });
    expect(tenantAMatches.some((match) => match.embedding.entityId === tenantBEntityId)).toBe(
      false,
    );
  });
});

describe("crossTenantEmbeddingSearch availability marker", () => {
  it("reports whether live PostgreSQL verification is configured", () => {
    if (!AURORA_LIVE_POSTGRES) {
      expect(process.env.AURORA_LIVE_POSTGRES).not.toBe("1");
    } else {
      expect(process.env.ORION_DATABASE_URL).toBeTruthy();
      expect(process.env.AURORA_APP_DATABASE_URL).toBeTruthy();
    }
  });
});
