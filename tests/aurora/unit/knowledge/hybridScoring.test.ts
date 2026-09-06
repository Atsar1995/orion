import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  HYBRID_SEARCH_WEIGHTS,
  PROVISIONAL_STATUS_MULTIPLIER,
  buildHybridScoredEntities,
  computeHybridScore,
  normalizeSignalScores,
  resolveStatusMultiplier,
} from "@/lib/aurora/knowledge/retrieval/hybridScoring";

const ENTITY_A = "knw_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ENTITY_B = "knw_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function createEntity(id: string, status: KnowledgeEntity["status"] = "validated"): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get("brand.profile");
  if (!definition?.domain) {
    throw new Error("brand.profile domain is required for this test");
  }

  return {
    id,
    tenantId: "ten_alpha",
    brandId: "brd_a",
    domain: definition.domain,
    entityType: "brand.profile",
    status,
    classification: "internal",
    title: "Entity",
    content: {},
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  };
}

describe("hybridScoring", () => {
  it("normalizes signal scores with min-max scaling", () => {
    const normalized = normalizeSignalScores(
      new Map([
        [ENTITY_A, 0.2],
        [ENTITY_B, 0.8],
      ]),
    );

    expect(normalized.get(ENTITY_A)).toBe(0);
    expect(normalized.get(ENTITY_B)).toBe(1);
  });

  it("computes the canonical weighted hybrid score", () => {
    const score = computeHybridScore(
      { semantic: 1, keyword: 1, graph: 1, memory: 1 },
      { semantic: true, keyword: true, graph: true, memory: true },
      1,
    );

    expect(score).toBe(
      Number(
        (
          HYBRID_SEARCH_WEIGHTS.semantic +
          HYBRID_SEARCH_WEIGHTS.keyword +
          HYBRID_SEARCH_WEIGHTS.graph +
          HYBRID_SEARCH_WEIGHTS.memory
        ).toFixed(6),
      ),
    );
  });

  it("excludes memory contribution when memory is unavailable", () => {
    const score = computeHybridScore(
      { semantic: 1, keyword: 1, graph: 1, memory: 1 },
      { semantic: true, keyword: true, graph: true, memory: false },
      1,
    );

    expect(score).toBe(
      Number(
        (
          HYBRID_SEARCH_WEIGHTS.semantic +
          HYBRID_SEARCH_WEIGHTS.keyword +
          HYBRID_SEARCH_WEIGHTS.graph
        ).toFixed(6),
      ),
    );
  });

  it("excludes semantic contribution when semantic is unavailable", () => {
    const score = computeHybridScore(
      { semantic: 1, keyword: 1, graph: 1, memory: 0 },
      { semantic: false, keyword: true, graph: true, memory: false },
      1,
    );

    expect(score).toBe(
      Number((HYBRID_SEARCH_WEIGHTS.keyword + HYBRID_SEARCH_WEIGHTS.graph).toFixed(6)),
    );
  });

  it("applies the provisional status multiplier", () => {
    expect(resolveStatusMultiplier(createEntity(ENTITY_A, "provisional"))).toBe(
      PROVISIONAL_STATUS_MULTIPLIER,
    );
    expect(resolveStatusMultiplier(createEntity(ENTITY_A, "validated"))).toBe(1);
  });

  it("builds hybrid entities with preserved raw signal scores", () => {
    const accumulators = new Map([
      [
        ENTITY_A,
        {
          entity: createEntity(ENTITY_A),
          semanticScore: 0.91,
          keywordScore: 2.4,
          graphProximityScore: 0.55,
        },
      ],
    ]);

    const results = buildHybridScoredEntities(accumulators, {
      semantic: true,
      keyword: true,
      graph: true,
      memory: false,
    });

    expect(results[0]?.semanticScore).toBe(0.91);
    expect(results[0]?.keywordScore).toBe(2.4);
    expect(results[0]?.graphProximityScore).toBe(0.55);
    expect(results[0]?.memoryRelevanceScore).toBeUndefined();
  });

  it("ranks provisional entities lower than validated entities with equal signals", () => {
    const accumulators = new Map([
      [
        ENTITY_A,
        {
          entity: createEntity(ENTITY_A, "validated"),
          keywordScore: 1,
        },
      ],
      [
        ENTITY_B,
        {
          entity: createEntity(ENTITY_B, "provisional"),
          keywordScore: 1,
        },
      ],
    ]);

    const built = buildHybridScoredEntities(accumulators, {
      semantic: false,
      keyword: true,
      graph: false,
      memory: false,
    });
    const results = [...built].sort((left, right) => right.score - left.score);

    expect(results[0]?.entity.id).toBe(ENTITY_A);
    expect(results[1]?.score).toBeLessThan(results[0]?.score ?? 0);
  });
});
