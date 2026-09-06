import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import { DefaultConfidenceScorer } from "@/lib/aurora/knowledge/retrieval/ConfidenceScorer";
import {
  CONFIDENCE_HIGH_MIN_AVERAGE_SCORE,
  CONFIDENCE_HIGH_MIN_VALIDATED,
  CONFIDENCE_LOW_MIN_AVERAGE_SCORE,
  CONFIDENCE_MEDIUM_MIN_AVERAGE_SCORE,
  computeConfidenceMetrics,
  resolveRetrievalConfidence,
  scoreRetrievalConfidence,
} from "@/lib/aurora/knowledge/retrieval/confidenceScoring";
import type { ConfidenceScoringRequest, ScoredEntity } from "@/lib/aurora/knowledge/types/RetrievalTypes";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const TENANT_B = "550e8400-e29b-41d4-a716-446655440002";

function createEntity(
  id: string,
  status: KnowledgeEntity["status"] = "validated",
  tenantId: string = TENANT_A,
): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get("brand.profile");
  if (!definition?.domain) {
    throw new Error("brand.profile domain is required for this test");
  }

  return {
    id,
    tenantId,
    brandId: "770e8400-e29b-41d4-a716-446655440003",
    domain: definition.domain,
    entityType: "brand.profile",
    status,
    classification: "internal",
    title: `Entity ${id.slice(-4)}`,
    content: {},
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  };
}

function scored(entity: KnowledgeEntity, score: number): ScoredEntity {
  return { entity, score, statusMultiplier: entity.status === "provisional" ? 0.7 : 1 };
}

function createValidatedSet(count: number, score: number, status: KnowledgeEntity["status"] = "validated"): ScoredEntity[] {
  return Array.from({ length: count }, (_, index) =>
    scored(createEntity(`knw_${String(index).padStart(8, "0")}-0000-4000-8000-000000000001`, status), score),
  );
}

describe("confidenceScoring", () => {
  it("scores high confidence when five validated results exceed the average threshold", () => {
    const result = scoreRetrievalConfidence({
      scoredEntities: createValidatedSet(CONFIDENCE_HIGH_MIN_VALIDATED, 0.91),
    });

    expect(result.confidence).toBe("high");
    expect(result.resultCount).toBe(5);
    expect(result.validatedCount).toBe(5);
    expect(result.averageScore).toBeGreaterThan(CONFIDENCE_HIGH_MIN_AVERAGE_SCORE);
  });

  it("scores medium confidence for three to four results above the medium threshold", () => {
    const result = scoreRetrievalConfidence({
      scoredEntities: createValidatedSet(3, 0.8),
    });

    expect(result.confidence).toBe("medium");
    expect(result.resultCount).toBe(3);
    expect(result.gaps.some((gap) => gap.includes("partial"))).toBe(true);
  });

  it("scores low confidence for one to two results above the low threshold", () => {
    const result = scoreRetrievalConfidence({
      scoredEntities: createValidatedSet(2, 0.72),
    });

    expect(result.confidence).toBe("low");
    expect(result.gaps.some((gap) => gap.includes("low"))).toBe(true);
  });

  it("scores insufficient confidence for zero retrieval results", () => {
    const result = scoreRetrievalConfidence({ scoredEntities: [] });

    expect(result.confidence).toBe("insufficient");
    expect(result.resultCount).toBe(0);
    expect(result.averageScore).toBe(0);
    expect(result.gaps).toContain("No relevant knowledge entities retrieved for the requested context.");
  });

  it("treats the high average threshold as exclusive at exactly 0.85", () => {
    const exact = resolveRetrievalConfidence(
      computeConfidenceMetrics(createValidatedSet(CONFIDENCE_HIGH_MIN_VALIDATED, 0.85)),
    );
    const above = resolveRetrievalConfidence(
      computeConfidenceMetrics(createValidatedSet(CONFIDENCE_HIGH_MIN_VALIDATED, 0.850001)),
    );

    expect(exact).toBe("medium");
    expect(above).toBe("high");
  });

  it("treats the medium average threshold as exclusive at exactly 0.75", () => {
    const exact = resolveRetrievalConfidence(computeConfidenceMetrics(createValidatedSet(3, 0.75)));
    const above = resolveRetrievalConfidence(computeConfidenceMetrics(createValidatedSet(3, 0.750001)));

    expect(exact).toBe("insufficient");
    expect(above).toBe("medium");
  });

  it("treats the low average threshold as exclusive at exactly 0.70", () => {
    const exact = resolveRetrievalConfidence(computeConfidenceMetrics(createValidatedSet(2, 0.7)));
    const above = resolveRetrievalConfidence(computeConfidenceMetrics(createValidatedSet(2, 0.700001)));

    expect(exact).toBe("insufficient");
    expect(above).toBe("low");
  });

  it("does not classify high confidence without five validated entities", () => {
    const provisionalSet = createValidatedSet(5, 0.91, "provisional");

    const result = scoreRetrievalConfidence({ scoredEntities: provisionalSet });

    expect(result.validatedCount).toBe(0);
    expect(result.confidence).toBe("medium");
  });

  it("handles mixed validated and provisional results without reapplying the status multiplier", () => {
    const mixed = [
      ...createValidatedSet(4, 0.9, "validated"),
      scored(createEntity("knw_provisional-0000-4000-8000-000000000001", "provisional"), 0.63),
    ];

    const result = scoreRetrievalConfidence({ scoredEntities: mixed });

    expect(result.validatedCount).toBe(4);
    expect(result.resultCount).toBe(5);
    expect(result.confidence).toBe("medium");
    expect(result.gaps.some((gap) => gap.includes("provisional"))).toBe(true);
    expect(mixed[4]?.score).toBe(0.63);
  });

  it("preserves degraded semantic retrieval metadata without fabricating semantic results", () => {
    const result = scoreRetrievalConfidence({
      scoredEntities: createValidatedSet(2, 0.8),
      semanticDegraded: true,
    });

    expect(result.confidence).toBe("low");
    expect(result.gaps).toContain(
      "Semantic retrieval degraded; confidence reflects keyword and graph results only.",
    );
  });

  it("preserves degraded memory retrieval metadata without fabricating memory results", () => {
    const result = scoreRetrievalConfidence({
      scoredEntities: createValidatedSet(3, 0.8),
      memoryDegraded: true,
    });

    expect(result.confidence).toBe("medium");
    expect(result.gaps).toContain("Memory tier unavailable; memory signals were excluded from retrieval.");
  });

  it("marks sub-threshold averages as insufficient even when results exist", () => {
    const result = scoreRetrievalConfidence({
      scoredEntities: createValidatedSet(3, 0.72),
    });

    expect(result.confidence).toBe("insufficient");
    expect(result.gaps).toContain("Retrieved entities did not meet minimum confidence thresholds.");
  });

  it("produces deterministic output for identical repeated inputs", () => {
    const request: ConfidenceScoringRequest = {
      scoredEntities: createValidatedSet(4, 0.81),
      semanticDegraded: true,
      tenantId: TENANT_A,
    };

    const first = scoreRetrievalConfidence(request);
    const second = scoreRetrievalConfidence(request);

    expect(first).toEqual(second);
  });

  it("supports maximum observed confidence metrics", () => {
    const result = scoreRetrievalConfidence({
      scoredEntities: createValidatedSet(6, 0.99),
    });

    expect(result.confidence).toBe("high");
    expect(result.averageScore).toBe(0.99);
  });

  it("supports minimum non-zero confidence metrics as insufficient", () => {
    const result = scoreRetrievalConfidence({
      scoredEntities: createValidatedSet(1, 0.1),
    });

    expect(result.confidence).toBe("insufficient");
    expect(result.averageScore).toBe(0.1);
  });

  it("filters foreign tenant entities when tenantId is supplied", () => {
    const result = scoreRetrievalConfidence({
      tenantId: TENANT_A,
      scoredEntities: [
        scored(createEntity("knw_local-0000-4000-8000-000000000001", "validated", TENANT_A), 0.9),
        scored(createEntity("knw_foreign-0000-4000-8000-000000000001", "validated", TENANT_B), 0.99),
      ],
    });

    expect(result.resultCount).toBe(1);
    expect(result.confidence).toBe("low");
  });

  it("does not mutate upstream scored entities or request metadata", () => {
    const entities = createValidatedSet(3, 0.8);
    const request: ConfidenceScoringRequest = {
      scoredEntities: entities,
      semanticDegraded: false,
      memoryDegraded: false,
      requestedDomains: ["knowledge.brand"],
    };
    const requestSnapshot = structuredClone(request);
    const entitySnapshot = structuredClone(entities);

    new DefaultConfidenceScorer().score(request);

    expect(request).toEqual(requestSnapshot);
    expect(entities).toEqual(entitySnapshot);
  });

  it("classifies five-result sets below the high average threshold as medium", () => {
    const result = scoreRetrievalConfidence({
      scoredEntities: createValidatedSet(5, 0.8),
    });

    expect(result.confidence).toBe("medium");
  });
});
