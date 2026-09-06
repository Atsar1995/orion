import { describe, expect, it, vi } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import { DefaultHybridSearchEngine } from "@/lib/aurora/knowledge/retrieval/HybridSearchEngine";
import {
  HYBRID_SEARCH_WEIGHTS,
  PROVISIONAL_STATUS_MULTIPLIER,
} from "@/lib/aurora/knowledge/retrieval/hybridScoring";
import type { GraphSearchEngine } from "@/lib/aurora/knowledge/retrieval/GraphSearchEngine";
import { KeywordInvalidQueryError } from "@/lib/aurora/knowledge/retrieval/KeywordSearchEngine";
import type { KeywordSearchEngine } from "@/lib/aurora/knowledge/retrieval/KeywordSearchEngine";
import type { MemorySearchEngine } from "@/lib/aurora/knowledge/retrieval/MemorySearchEngine";
import type {
  SemanticSearchEngine,
  SemanticSearchResult,
} from "@/lib/aurora/knowledge/retrieval/SemanticSearchEngine";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { AuroraError } from "@/lib/aurora/errors/AuroraError";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const ENTITY_A = "knw_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ENTITY_B = "knw_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ENTITY_C = "knw_cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const VECTOR = Array.from({ length: 1536 }, (_, index) => Number((index * 0.001).toFixed(6)));

function createEntity(
  overrides: Partial<KnowledgeEntity> & Pick<KnowledgeEntity, "id" | "entityType">,
): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get(overrides.entityType);
  if (!definition?.domain) {
    throw new Error(`Unknown entity type: ${overrides.entityType}`);
  }

  return {
    tenantId: TENANT_A,
    brandId: "770e8400-e29b-41d4-a716-446655440003",
    domain: definition.domain,
    status: "validated",
    classification: "internal",
    title: "Entity",
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

function scored(
  entity: KnowledgeEntity,
  scores: {
    score?: number;
    semanticScore?: number;
    keywordScore?: number;
    graphProximityScore?: number;
    memoryRelevanceScore?: number;
  },
) {
  return {
    entity,
    score: scores.score ?? scores.semanticScore ?? scores.keywordScore ?? 0,
    ...scores,
  };
}

function createEngine(mocks: {
  semantic?: SemanticSearchEngine;
  keyword?: KeywordSearchEngine;
  graph?: GraphSearchEngine;
  memory?: MemorySearchEngine;
}) {
  return new DefaultHybridSearchEngine(
    mocks.semantic ??
      ({
        search: vi.fn().mockResolvedValue({ entities: [], degraded: false }),
      } as unknown as SemanticSearchEngine),
    mocks.keyword ??
      ({
        search: vi.fn().mockResolvedValue([]),
      } as unknown as KeywordSearchEngine),
    mocks.graph ??
      ({
        search: vi.fn().mockResolvedValue([]),
      } as unknown as GraphSearchEngine),
    mocks.memory ??
      ({
        search: vi.fn().mockResolvedValue({
          entities: [],
          degraded: true,
          excludeMemoryScore: true,
        }),
      } as unknown as MemorySearchEngine),
    new DefaultAuroraAuthorizationService(),
  );
}

function createContext(tenantId = TENANT_A) {
  return createTestAuroraRuntimeContext({
    tenantId,
    userId: "usr_test",
  });
}

describe("HybridSearchEngine", () => {
  it("combines semantic, keyword, and graph results", async () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const semantic = { search: vi.fn().mockResolvedValue({ entities: [scored(entity, { semanticScore: 0.9 })], degraded: false }) };
    const keyword = { search: vi.fn().mockResolvedValue([scored(entity, { keywordScore: 2 })]) };
    const graph = { search: vi.fn().mockResolvedValue([scored(entity, { graphProximityScore: 0.6 })]) };
    const engine = createEngine({ semantic, keyword, graph });

    const result = await engine.search(
      createContext(),
      { query: "brand voice" },
      { queryVector: VECTOR, graphStartEntityId: ENTITY_A },
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.semanticScore).toBe(0.9);
    expect(result[0]?.keywordScore).toBe(2);
    expect(result[0]?.graphProximityScore).toBe(0.6);
  });

  it("invokes all four retrieval engines", async () => {
    const semantic = { search: vi.fn().mockResolvedValue({ entities: [], degraded: false }) };
    const keyword = { search: vi.fn().mockResolvedValue([]) };
    const graph = { search: vi.fn().mockResolvedValue([]) };
    const memory = {
      search: vi.fn().mockResolvedValue({ entities: [], degraded: true, excludeMemoryScore: true }),
    };
    const engine = createEngine({ semantic, keyword, graph, memory });
    const ctx = createContext();
    const query = { query: "hybrid" };

    await engine.search(ctx, query, { queryVector: VECTOR, graphStartEntityId: ENTITY_A });

    expect(semantic.search).toHaveBeenCalledWith(ctx, query, VECTOR);
    expect(keyword.search).toHaveBeenCalledWith(ctx, query, "hybrid");
    expect(graph.search).toHaveBeenCalledWith(ctx, query, ENTITY_A);
    expect(memory.search).toHaveBeenCalledWith(ctx, query);
  });

  it("merges duplicate entity IDs into one ScoredEntity", async () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const engine = createEngine({
      semantic: {
        search: vi.fn().mockResolvedValue({ entities: [scored(entity, { semanticScore: 0.7 })], degraded: false }),
      } as unknown as SemanticSearchEngine,
      keyword: {
        search: vi.fn().mockResolvedValue([scored(entity, { keywordScore: 1.5 })]),
      } as unknown as KeywordSearchEngine,
    });

    const result = await engine.search(createContext(), { query: "merge" }, { queryVector: VECTOR });
    expect(result).toHaveLength(1);
  });

  it("calculates canonical hybrid score from available signals", async () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const engine = createEngine({
      semantic: {
        search: vi.fn().mockResolvedValue({ entities: [scored(entity, { semanticScore: 0.8 })], degraded: false }),
      } as unknown as SemanticSearchEngine,
      keyword: {
        search: vi.fn().mockResolvedValue([scored(entity, { keywordScore: 1.2 })]),
      } as unknown as KeywordSearchEngine,
      graph: {
        search: vi.fn().mockResolvedValue([scored(entity, { graphProximityScore: 0.4 })]),
      } as unknown as GraphSearchEngine,
    });

    const result = await engine.search(createContext(), { query: "score" }, { queryVector: VECTOR });
    const expected =
      (HYBRID_SEARCH_WEIGHTS.semantic +
        HYBRID_SEARCH_WEIGHTS.keyword +
        HYBRID_SEARCH_WEIGHTS.graph) *
      1;

    expect(result[0]?.score).toBe(Number(expected.toFixed(6)));
  });

  it("returns semantic-only results when other engines are empty", async () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const engine = createEngine({
      semantic: {
        search: vi.fn().mockResolvedValue({ entities: [scored(entity, { semanticScore: 0.85 })], degraded: false }),
      } as unknown as SemanticSearchEngine,
    });

    const result = await engine.search(createContext(), { query: "semantic only" }, { queryVector: VECTOR });
    expect(result[0]?.semanticScore).toBe(0.85);
    expect(result[0]?.keywordScore).toBeUndefined();
  });

  it("returns keyword-only results when semantic is degraded", async () => {
    const entity = createEntity({ id: ENTITY_B, entityType: "campaign.record" });
    const engine = createEngine({
      semantic: {
        search: vi.fn().mockResolvedValue({
          entities: [],
          degraded: true,
          degradeToKeywordSearch: true,
        } satisfies SemanticSearchResult),
      } as unknown as SemanticSearchEngine,
      keyword: {
        search: vi.fn().mockResolvedValue([scored(entity, { keywordScore: 1.8 })]),
      } as unknown as KeywordSearchEngine,
    });

    const result = await engine.search(createContext(), { query: "keyword only" }, { queryVector: VECTOR });
    expect(result[0]?.entity.id).toBe(ENTITY_B);
    expect(result[0]?.score).toBe(Number(HYBRID_SEARCH_WEIGHTS.keyword.toFixed(6)));
  });

  it("returns graph-only results", async () => {
    const entity = createEntity({ id: ENTITY_C, entityType: "brand.profile" });
    const engine = createEngine({
      graph: {
        search: vi.fn().mockResolvedValue([scored(entity, { graphProximityScore: 0.75 })]),
      } as unknown as GraphSearchEngine,
    });

    const result = await engine.search(createContext(), { query: "graph only" }, { graphStartEntityId: ENTITY_C });
    expect(result[0]?.graphProximityScore).toBe(0.75);
  });

  it("includes memory contribution when memory is available", async () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const engine = createEngine({
      memory: {
        search: vi.fn().mockResolvedValue({
          entities: [scored(entity, { memoryRelevanceScore: 0.66 })],
          degraded: false,
          excludeMemoryScore: false,
        }),
      } as unknown as MemorySearchEngine,
    });

    const result = await engine.search(createContext(), { query: "memory available" });
    expect(result[0]?.memoryRelevanceScore).toBe(0.66);
    expect(result[0]?.score).toBe(Number(HYBRID_SEARCH_WEIGHTS.memory.toFixed(6)));
  });

  it("handles ERR-3 memory degradation without fabricating memory scores", async () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const engine = createEngine({
      keyword: {
        search: vi.fn().mockResolvedValue([scored(entity, { keywordScore: 1 })]),
      } as unknown as KeywordSearchEngine,
      memory: {
        search: vi.fn().mockResolvedValue({
          entities: [],
          degraded: true,
          excludeMemoryScore: true,
        }),
      } as unknown as MemorySearchEngine,
    });

    const result = await engine.search(createContext(), { query: "memory degraded" });
    expect(result[0]?.memoryRelevanceScore).toBeUndefined();
    expect(result[0]?.score).toBe(Number(HYBRID_SEARCH_WEIGHTS.keyword.toFixed(6)));
  });

  it("handles ERR-2 semantic degradation when query vector is missing", async () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const semantic = { search: vi.fn() };
    const keyword = {
      search: vi.fn().mockResolvedValue([scored(entity, { keywordScore: 1.1 })]),
    };
    const engine = createEngine({ semantic, keyword });

    const result = await engine.search(createContext(), { query: "semantic degraded" });

    expect(semantic.search).not.toHaveBeenCalled();
    expect(result[0]?.semanticScore).toBeUndefined();
    expect(result[0]?.score).toBe(Number(HYBRID_SEARCH_WEIGHTS.keyword.toFixed(6)));
  });

  it("down-ranks provisional entities at the hybrid stage", async () => {
    const validated = createEntity({ id: ENTITY_A, entityType: "brand.profile", status: "validated" });
    const provisional = createEntity({ id: ENTITY_B, entityType: "brand.profile", status: "provisional" });
    const engine = createEngine({
      keyword: {
        search: vi.fn().mockResolvedValue([
          scored(validated, { keywordScore: 1 }),
          scored(provisional, { keywordScore: 1 }),
        ]),
      } as unknown as KeywordSearchEngine,
    });

    const result = await engine.search(createContext(), { query: "provisional downrank" });
    expect(result[0]?.entity.id).toBe(ENTITY_A);
    expect(result[1]?.statusMultiplier).toBe(PROVISIONAL_STATUS_MULTIPLIER);
  });

  it("respects validatedOnly on merged results", async () => {
    const validated = createEntity({ id: ENTITY_A, entityType: "brand.profile", status: "validated" });
    const provisional = createEntity({ id: ENTITY_B, entityType: "brand.profile", status: "provisional" });
    const engine = createEngine({
      keyword: {
        search: vi.fn().mockResolvedValue([
          scored(validated, { keywordScore: 1 }),
          scored(provisional, { keywordScore: 2 }),
        ]),
      } as unknown as KeywordSearchEngine,
    });

    const result = await engine.search(createContext(), {
      query: "validated only",
      validatedOnly: true,
    });

    expect(result.every((entry) => entry.entity.status === "validated")).toBe(true);
  });

  it("respects brand filtering on merged results", async () => {
    const brandA = "770e8400-e29b-41d4-a716-446655440003";
    const brandB = "880e8400-e29b-41d4-a716-446655440004";
    const engine = createEngine({
      keyword: {
        search: vi.fn().mockResolvedValue([
          scored(createEntity({ id: ENTITY_A, entityType: "brand.profile", brandId: brandA }), {
            keywordScore: 1,
          }),
          scored(createEntity({ id: ENTITY_B, entityType: "brand.profile", brandId: brandB }), {
            keywordScore: 2,
          }),
        ]),
      } as unknown as KeywordSearchEngine,
    });

    const result = await engine.search(createContext(), { query: "brand", brandId: brandA });
    expect(result).toHaveLength(1);
    expect(result[0]?.entity.brandId).toBe(brandA);
  });

  it("respects domain filtering on merged results", async () => {
    const brandDefinition = knowledgeEntityRegistry.get("brand.profile");
    if (!brandDefinition?.domain) {
      throw new Error("brand.profile domain is required for this test");
    }
    const engine = createEngine({
      keyword: {
        search: vi.fn().mockResolvedValue([
          scored(createEntity({ id: ENTITY_A, entityType: "brand.profile" }), { keywordScore: 1 }),
          scored(createEntity({ id: ENTITY_B, entityType: "campaign.record" }), { keywordScore: 2 }),
        ]),
      } as unknown as KeywordSearchEngine,
    });

    const result = await engine.search(createContext(), {
      query: "domain",
      domains: [brandDefinition.domain],
    });

    expect(result.every((entry) => entry.entity.domain === brandDefinition.domain)).toBe(true);
  });

  it("respects entityType filtering on merged results", async () => {
    const engine = createEngine({
      keyword: {
        search: vi.fn().mockResolvedValue([
          scored(createEntity({ id: ENTITY_A, entityType: "brand.profile" }), { keywordScore: 1 }),
          scored(createEntity({ id: ENTITY_B, entityType: "campaign.record" }), { keywordScore: 2 }),
        ]),
      } as unknown as KeywordSearchEngine,
    });

    const result = await engine.search(createContext(), {
      query: "entity type",
      entityType: "brand.profile",
    });

    expect(result.every((entry) => entry.entity.entityType === "brand.profile")).toBe(true);
  });

  it("enforces topK on merged results", async () => {
    const engine = createEngine({
      keyword: {
        search: vi.fn().mockResolvedValue([
          scored(createEntity({ id: ENTITY_A, entityType: "brand.profile" }), { keywordScore: 3 }),
          scored(createEntity({ id: ENTITY_B, entityType: "brand.profile" }), { keywordScore: 2 }),
          scored(createEntity({ id: ENTITY_C, entityType: "brand.profile" }), { keywordScore: 1 }),
        ]),
      } as unknown as KeywordSearchEngine,
    });

    const result = await engine.search(createContext(), { query: "topk", topK: 2 });
    expect(result).toHaveLength(2);
  });

  it("orders merged results by score desc then entity id asc", async () => {
    const engine = createEngine({
      keyword: {
        search: vi.fn().mockResolvedValue([
          scored(createEntity({ id: ENTITY_B, entityType: "brand.profile" }), { keywordScore: 1 }),
          scored(createEntity({ id: ENTITY_A, entityType: "brand.profile" }), { keywordScore: 1 }),
        ]),
      } as unknown as KeywordSearchEngine,
    });

    const result = await engine.search(createContext(), { query: "ordering" });
    expect(result.map((entry) => entry.entity.id)).toEqual([ENTITY_A, ENTITY_B]);
  });

  it("uses ctx.tenantId as tenant authority", async () => {
    const authorization = new DefaultAuroraAuthorizationService();
    const assertTenantAccess = vi.spyOn(authorization, "assertTenantAccess");
    const engine = new DefaultHybridSearchEngine(
      { search: vi.fn().mockResolvedValue({ entities: [], degraded: false }) } as never,
      { search: vi.fn().mockResolvedValue([]) } as never,
      { search: vi.fn().mockResolvedValue([]) } as never,
      {
        search: vi.fn().mockResolvedValue({ entities: [], degraded: true, excludeMemoryScore: true }),
      } as never,
      authorization,
    );
    const ctx = createContext();

    await engine.search(ctx, { query: "tenant" });

    expect(assertTenantAccess).toHaveBeenCalledWith(ctx, TENANT_A, expect.any(Object));
  });

  it("rejects unauthorized hybrid reads", async () => {
    const engine = createEngine({});
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      roles: ["aurora.viewer"],
      auroraPermissions: ["aurora.knowledge.write"],
    });

    await expect(engine.search(ctx, { query: "blocked" })).rejects.toBeInstanceOf(AuroraError);
  });

  it("does not fabricate memory scores when memory is unavailable", async () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const engine = createEngine({
      keyword: {
        search: vi.fn().mockResolvedValue([scored(entity, { keywordScore: 1 })]),
      } as unknown as KeywordSearchEngine,
    });

    const result = await engine.search(createContext(), { query: "no memory score" });
    expect(result[0]?.memoryRelevanceScore).toBeUndefined();
  });

  it("does not return duplicate entities", async () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const engine = createEngine({
      semantic: {
        search: vi.fn().mockResolvedValue({ entities: [scored(entity, { semanticScore: 0.5 })], degraded: false }),
      } as unknown as SemanticSearchEngine,
      keyword: {
        search: vi.fn().mockResolvedValue([scored(entity, { keywordScore: 1 })]),
      } as unknown as KeywordSearchEngine,
      graph: {
        search: vi.fn().mockResolvedValue([scored(entity, { graphProximityScore: 0.3 })]),
      } as unknown as GraphSearchEngine,
    });

    const result = await engine.search(createContext(), { query: "dedupe" }, { queryVector: VECTOR });
    expect(result).toHaveLength(1);
  });

  it("propagates underlying infrastructure failures", async () => {
    const engine = createEngine({
      keyword: {
        search: vi.fn().mockRejectedValue(new Error("keyword backend unavailable")),
      } as unknown as KeywordSearchEngine,
    });

    await expect(engine.search(createContext(), { query: "fail" })).rejects.toThrow(
      "keyword backend unavailable",
    );
  });

  it("returns empty results when all engines return nothing", async () => {
    const engine = createEngine({});
    const result = await engine.search(createContext(), { query: "empty" });
    expect(result).toEqual([]);
  });

  it("requires tenant context", async () => {
    const engine = createEngine({});
    await expect(
      engine.search(createTestAuroraRuntimeContext({ tenantId: "", userId: "usr_test" }), {
        query: "tenant",
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidTenantContextError);
  });

  it("does not call semantic search as a graph fallback", async () => {
    const semantic = { search: vi.fn().mockResolvedValue({ entities: [], degraded: false }) };
    const graph = { search: vi.fn().mockResolvedValue([]) };
    const engine = createEngine({ semantic, graph });

    await engine.search(createContext(), { query: "no graph fallback" });

    expect(graph.search).toHaveBeenCalled();
    expect(semantic.search).not.toHaveBeenCalled();
  });

  it("does not call keyword search as a semantic fallback", async () => {
    const keyword = { search: vi.fn().mockRejectedValue(new KeywordInvalidQueryError("empty")) };
    const semantic = {
      search: vi.fn().mockResolvedValue({ entities: [], degraded: true, degradeToKeywordSearch: true }),
    };
    const engine = createEngine({ semantic, keyword });

    await expect(
      engine.search(createContext(), { query: "   " }, { queryVector: VECTOR }),
    ).rejects.toBeInstanceOf(KeywordInvalidQueryError);
  });
});
