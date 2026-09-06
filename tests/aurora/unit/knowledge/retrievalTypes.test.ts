import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import {
  CONTEXT_LAYER_KEYS,
  CONTEXT_LAYER_TOKEN_LIMITS,
  DEFAULT_RETRIEVAL_TOP_K,
  MIN_EMBEDDING_SIMILARITY,
  RETRIEVAL_CONFIDENCE_LEVELS,
  RETRIEVAL_MAX_CONTEXT_TOKENS,
  RETRIEVAL_TASK_TYPES,
  type ContextPackage,
  type KnowledgeCitation,
  type RetrievalQuery,
  type RetrievalRequest,
  type RetrievalResult,
  type ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";

function createEntityFixture(): KnowledgeEntity {
  return {
    id: "knw_550e8400-e29b-41d4-a716-446655440000",
    tenantId: "ten_001",
    brandId: "brd_001",
    domain: "knowledge.brand",
    entityType: "brand.profile",
    status: "validated",
    classification: "internal",
    title: "Brand profile",
    content: { voice: "professional" },
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  };
}

describe("retrieval domain types", () => {
  it("defines retrieval task types from ES-AURORA-007 Appendix D", () => {
    expect(RETRIEVAL_TASK_TYPES).toEqual([
      "content_generation",
      "seo_analysis",
      "ad_campaign",
      "social_posting",
      "analytics_report",
      "executive_briefing",
      "competitive_analysis",
      "kb_curation",
    ]);
    expect(RETRIEVAL_TASK_TYPES).toHaveLength(8);
  });

  it("defines confidence levels from ES-AURORA-007 §4.5", () => {
    expect(RETRIEVAL_CONFIDENCE_LEVELS).toEqual([
      "high",
      "medium",
      "low",
      "insufficient",
    ]);
  });

  it("defines context token budget constants from ES-AURORA-007 §4.6", () => {
    expect(RETRIEVAL_MAX_CONTEXT_TOKENS).toBe(3_000);
    expect(DEFAULT_RETRIEVAL_TOP_K).toBe(10);
    expect(MIN_EMBEDDING_SIMILARITY).toBe(0.75);

    const layerTotal = CONTEXT_LAYER_KEYS.reduce(
      (sum, key) => sum + CONTEXT_LAYER_TOKEN_LIMITS[key],
      0,
    );
    expect(layerTotal).toBe(RETRIEVAL_MAX_CONTEXT_TOKENS);
  });

  it("models retrieval request and query contracts with optional fields omitted", () => {
    const request: RetrievalRequest = {
      taskType: "content_generation",
      query: "brand voice guidelines",
    };
    const query: RetrievalQuery = {
      query: "brand voice guidelines",
    };

    expect(request.domains).toBeUndefined();
    expect(query.topK).toBeUndefined();
  });

  it("models scored entities, citations, and retrieval results", () => {
    const entity = createEntityFixture();
    const scored: ScoredEntity = {
      entity,
      score: 0.91,
      semanticScore: 0.88,
      keywordScore: 0.72,
      statusMultiplier: 1,
    };
    const citation: KnowledgeCitation = {
      entityId: entity.id,
      domain: entity.domain,
      entityType: entity.entityType,
      title: entity.title,
      excerpt: "professional voice",
      confidence: scored.score,
      sourceType: entity.sourceType,
      retrievedAt: "2026-09-04T00:00:00.000Z",
    };
    const contextPackage: ContextPackage = {
      layers: [
        {
          key: "brand",
          content: "Brand context",
          tokenCount: 120,
          maxTokens: CONTEXT_LAYER_TOKEN_LIMITS.brand,
        },
      ],
      totalTokens: 120,
      maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
      entities: [entity],
      assembledAt: "2026-09-04T00:00:00.000Z",
    };
    const result: RetrievalResult = {
      confidence: "high",
      contextPackage,
      citations: [citation],
      gaps: [],
      latencyMs: 42,
    };

    expect(result.confidence).toBe("high");
    expect(result.citations[0]?.entityId).toBe(entity.id);
    expect(result.contextPackage.totalTokens).toBeLessThanOrEqual(
      result.contextPackage.maxTokens,
    );
  });

  it("supports insufficient-confidence outcomes with populated gaps", () => {
    const result: RetrievalResult = {
      confidence: "insufficient",
      contextPackage: {
        layers: [],
        totalTokens: 0,
        maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
        entities: [],
        assembledAt: "2026-09-04T00:00:00.000Z",
      },
      citations: [],
      gaps: ["No validated brand knowledge found for requested domains."],
      latencyMs: 15,
    };

    expect(result.confidence).toBe("insufficient");
    expect(result.gaps).toHaveLength(1);
  });
});
