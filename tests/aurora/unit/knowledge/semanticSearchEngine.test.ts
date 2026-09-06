import { describe, expect, it, vi } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  EMBEDDING_VECTOR_DIMENSION,
  InMemoryEmbeddingRepository,
  InMemoryKnowledgeRepository,
  type KnowledgeEmbeddingRecord,
  type ScoredEmbeddingMatch,
} from "@/lib/aurora/knowledge/repositories";
import {
  DefaultSemanticSearchEngine,
  collapseEmbeddingMatches,
  compareScoredEntities,
} from "@/lib/aurora/knowledge/retrieval/SemanticSearchEngine";
import {
  DefaultEmbeddingService,
  DeterministicEmbeddingProvider,
  type EmbeddingService,
} from "@/lib/aurora/knowledge/services";
import { EmbeddingProviderUnavailableError } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { AuroraError } from "@/lib/aurora/errors/AuroraError";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const TENANT_B = "660e8400-e29b-41d4-a716-446655440002";
const BRAND_A = "770e8400-e29b-41d4-a716-446655440003";
const ENTITY_A = "knw_550e8400-e29b-41d4-a716-446655440000";
const ENTITY_B = "knw_660e8400-e29b-41d4-a716-446655440001";
const ENTITY_C = "knw_770e8400-e29b-41d4-a716-446655440002";

function createEntity(
  tenantId: string,
  overrides: Partial<KnowledgeEntity> & Pick<KnowledgeEntity, "id" | "entityType">,
): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get(overrides.entityType);
  if (!definition?.domain) {
    throw new Error(`Unknown entity type: ${overrides.entityType}`);
  }

  return {
    tenantId,
    brandId: BRAND_A,
    domain: definition.domain,
    status: "validated",
    classification: "internal",
    title: "Test entity",
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

function createContext(tenantId: string) {
  return createTestAuroraRuntimeContext({
    tenantId,
    userId: "usr_test",
    brandId: BRAND_A,
  });
}

function createVector(seed: number): number[] {
  return Array.from({ length: EMBEDDING_VECTOR_DIMENSION }, (_, index) => {
    const value = Math.sin(seed + index * 0.01);
    return Number(value.toFixed(6));
  });
}

function createEmbeddingRecord(
  tenantId: string,
  entityId: string,
  chunkIndex: number,
  overrides: Partial<KnowledgeEmbeddingRecord> = {},
): KnowledgeEmbeddingRecord {
  return {
    id: `emb_${entityId}_${chunkIndex}`,
    tenantId,
    brandId: BRAND_A,
    entityId,
    chunkIndex,
    embedding: createVector(chunkIndex + 1),
    contentHash: `hash_${entityId}_${chunkIndex}`,
    createdAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

function createMatch(
  entityId: string,
  chunkIndex: number,
  similarity: number,
  tenantId = TENANT_A,
): ScoredEmbeddingMatch {
  return {
    embedding: createEmbeddingRecord(tenantId, entityId, chunkIndex),
    similarity,
  };
}

function createEngine(
  embeddingService: EmbeddingService,
  knowledgeRepository = new InMemoryKnowledgeRepository(),
) {
  return {
    engine: new DefaultSemanticSearchEngine(embeddingService, knowledgeRepository),
    knowledgeRepository,
  };
}

describe("SemanticSearchEngine", () => {
  it("delegates semantic search to EmbeddingService", async () => {
    const embeddingService = {
      semanticSearch: vi.fn().mockResolvedValue([]),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService);
    const ctx = createContext(TENANT_A);
    const vector = createVector(1);

    await engine.search(ctx, { query: "brand voice", brandId: BRAND_A, topK: 3 }, vector);

    expect(embeddingService.semanticSearch).toHaveBeenCalledWith(ctx, vector, {
      brandId: BRAND_A,
      topK: 24,
      validatedOnly: undefined,
      domains: undefined,
    });
  });

  it("resolves embedding matches to knowledge entities", async () => {
    const knowledgeRepository = new InMemoryKnowledgeRepository();
    const entity = createEntity(TENANT_A, { id: ENTITY_A, entityType: "brand.profile" });
    await knowledgeRepository.create(TENANT_A, entity);

    const embeddingService = {
      semanticSearch: vi.fn().mockResolvedValue([createMatch(ENTITY_A, 0, 0.91)]),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService, knowledgeRepository);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "brand profile" },
      createVector(2),
    );

    expect(result.entities).toHaveLength(1);
    expect(result.entities[0]?.entity.id).toBe(ENTITY_A);
    expect(result.degraded).toBe(false);
  });

  it("maps vector similarity to semantic score and overall score", async () => {
    const entity = createEntity(TENANT_A, { id: ENTITY_A, entityType: "brand.profile" });
    const knowledgeRepository = new InMemoryKnowledgeRepository();
    await knowledgeRepository.create(TENANT_A, entity);

    const embeddingService = {
      semanticSearch: vi.fn().mockResolvedValue([createMatch(ENTITY_A, 0, 0.88)]),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService, knowledgeRepository);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "semantic mapping" },
      createVector(3),
    );

    expect(result.entities[0]?.semanticScore).toBe(0.88);
    expect(result.entities[0]?.score).toBe(0.88);
    expect(result.entities[0]?.keywordScore).toBeUndefined();
  });

  it("collapses multiple chunks from the same entity", async () => {
    const entity = createEntity(TENANT_A, { id: ENTITY_A, entityType: "brand.profile" });
    const knowledgeRepository = new InMemoryKnowledgeRepository();
    await knowledgeRepository.create(TENANT_A, entity);

    const embeddingService = {
      semanticSearch: vi
        .fn()
        .mockResolvedValue([
          createMatch(ENTITY_A, 0, 0.9),
          createMatch(ENTITY_A, 1, 0.82),
        ]),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService, knowledgeRepository);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "collapse chunks" },
      createVector(4),
    );

    expect(result.entities).toHaveLength(1);
  });

  it("uses the strongest chunk similarity for entity ranking", () => {
    const entity = createEntity(TENANT_A, { id: ENTITY_A, entityType: "brand.profile" });
    const collapsed = collapseEmbeddingMatches(
      [createMatch(ENTITY_A, 0, 0.81), createMatch(ENTITY_A, 1, 0.93)],
      new Map([[ENTITY_A, entity]]),
      { query: "strongest chunk" },
      TENANT_A,
    );

    expect(collapsed).toHaveLength(1);
    expect(collapsed[0]?.semanticScore).toBe(0.93);
  });

  it("respects entity-level topK after collapse", async () => {
    const knowledgeRepository = new InMemoryKnowledgeRepository();
    await knowledgeRepository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: ENTITY_A, entityType: "brand.profile" }),
    );
    await knowledgeRepository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: ENTITY_B, entityType: "campaign.record" }),
    );
    await knowledgeRepository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: ENTITY_C, entityType: "campaign.record" }),
    );

    const embeddingService = {
      semanticSearch: vi.fn().mockResolvedValue([
        createMatch(ENTITY_A, 0, 0.95),
        createMatch(ENTITY_B, 0, 0.9),
        createMatch(ENTITY_C, 0, 0.85),
      ]),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService, knowledgeRepository);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "top k", topK: 2 },
      createVector(5),
    );

    expect(result.entities).toHaveLength(2);
    expect(result.entities.map((entry) => entry.entity.id)).toEqual([ENTITY_A, ENTITY_B]);
  });

  it("requests expanded chunk topK before entity collapse", async () => {
    const embeddingService = {
      semanticSearch: vi.fn().mockResolvedValue([]),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService);

    await engine.search(
      createContext(TENANT_A),
      { query: "threshold", topK: 10 },
      createVector(6),
    );

    expect(embeddingService.semanticSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ topK: 80 }),
    );
  });

  it("does not apply its own minimum similarity threshold", async () => {
    const knowledgeRepository = new InMemoryKnowledgeRepository();
    await knowledgeRepository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: ENTITY_A, entityType: "brand.profile" }),
    );

    const embeddingService = {
      semanticSearch: vi.fn().mockResolvedValue([createMatch(ENTITY_A, 0, 0.76)]),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService, knowledgeRepository);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "already filtered by embedding layer" },
      createVector(6),
    );

    expect(result.entities).toHaveLength(1);
    expect(embeddingService.semanticSearch).toHaveBeenCalledOnce();
  });

  it("returns no entities when EmbeddingService finds no matches above threshold", async () => {
    const embeddingService = {
      semanticSearch: vi.fn().mockResolvedValue([]),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "below threshold" },
      createVector(99),
    );

    expect(result.entities).toEqual([]);
    expect(result.degraded).toBe(false);
  });

  it("preserves brand filtering in vector search and entity resolution", async () => {
    const knowledgeRepository = new InMemoryKnowledgeRepository();
    await knowledgeRepository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        brandId: BRAND_A,
      }),
    );
    await knowledgeRepository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_B,
        entityType: "brand.profile",
        brandId: "880e8400-e29b-41d4-a716-446655440004",
      }),
    );

    const embeddingService = {
      semanticSearch: vi.fn().mockResolvedValue([
        createMatch(ENTITY_A, 0, 0.91),
        createMatch(ENTITY_B, 0, 0.92),
      ]),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService, knowledgeRepository);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "brand scoped", brandId: BRAND_A },
      createVector(7),
    );

    expect(embeddingService.semanticSearch).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ brandId: BRAND_A }),
    );
    expect(result.entities).toHaveLength(1);
    expect(result.entities[0]?.entity.id).toBe(ENTITY_A);
  });

  it("returns deterministic ordering with score and entity-id tie-breaking", () => {
    const entityA = createEntity(TENANT_A, { id: ENTITY_A, entityType: "brand.profile" });
    const entityB = createEntity(TENANT_A, { id: ENTITY_B, entityType: "campaign.record" });
    const entityC = createEntity(TENANT_A, { id: ENTITY_C, entityType: "campaign.record" });

    const ordered = [
      { entity: entityB, score: 0.8, semanticScore: 0.8 },
      { entity: entityA, score: 0.9, semanticScore: 0.9 },
      { entity: entityC, score: 0.8, semanticScore: 0.8 },
    ].sort(compareScoredEntities);

    expect(ordered.map((entry) => entry.entity.id)).toEqual([ENTITY_A, ENTITY_B, ENTITY_C]);
  });

  it("never exposes entities outside the runtime tenant", async () => {
    const knowledgeRepository = new InMemoryKnowledgeRepository();
    await knowledgeRepository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: ENTITY_A, entityType: "brand.profile" }),
    );

    const embeddingService = {
      semanticSearch: vi
        .fn()
        .mockResolvedValue([createMatch(ENTITY_A, 0, 0.9, TENANT_B)]),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService, knowledgeRepository);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "tenant isolation" },
      createVector(8),
    );

    expect(result.entities).toEqual([]);
  });

  it("propagates read authorization failures from EmbeddingService", async () => {
    const embeddingService = new DefaultEmbeddingService(
      new DeterministicEmbeddingProvider(),
      new InMemoryEmbeddingRepository(),
      new InMemoryKnowledgeRepository(),
      new DefaultAuroraAuthorizationService(),
    );
    const engine = new DefaultSemanticSearchEngine(
      embeddingService,
      new InMemoryKnowledgeRepository(),
    );
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      roles: ["aurora.viewer"],
      auroraPermissions: ["aurora.knowledge.write"],
    });

    await expect(
      engine.search(ctx, { query: "unauthorized read" }, createVector(9)),
    ).rejects.toBeInstanceOf(AuroraError);
  });

  it("returns keyword degradation when embedding search fails", async () => {
    const embeddingService = {
      semanticSearch: vi.fn().mockRejectedValue(
        new EmbeddingProviderUnavailableError("provider unavailable"),
      ),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "degraded" },
      createVector(10),
    );

    expect(result.entities).toEqual([]);
    expect(result.degraded).toBe(true);
    expect(result.degradeToKeywordSearch).toBe(true);
    expect(result.degradationReason).toContain("provider unavailable");
  });

  it("skips embedding matches whose entities are missing", async () => {
    const embeddingService = {
      semanticSearch: vi.fn().mockResolvedValue([
        createMatch(ENTITY_A, 0, 0.91),
        createMatch(ENTITY_B, 0, 0.89),
      ]),
    } as unknown as EmbeddingService;
    const knowledgeRepository = new InMemoryKnowledgeRepository();
    await knowledgeRepository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: ENTITY_A, entityType: "brand.profile" }),
    );
    const { engine } = createEngine(embeddingService, knowledgeRepository);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "missing entity" },
      createVector(11),
    );

    expect(result.entities).toHaveLength(1);
    expect(result.entities[0]?.entity.id).toBe(ENTITY_A);
  });

  it("requires tenant context", async () => {
    const embeddingService = {
      semanticSearch: vi.fn(),
    } as unknown as EmbeddingService;
    const { engine } = createEngine(embeddingService);

    await expect(
      engine.search(
        createTestAuroraRuntimeContext({ tenantId: "", userId: "usr_test" }),
        { query: "missing tenant" },
        createVector(12),
      ),
    ).rejects.toBeInstanceOf(KnowledgeInvalidTenantContextError);
  });
});
