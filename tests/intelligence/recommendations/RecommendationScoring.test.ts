import { describe, expect, it } from "vitest";
import {
  applyScores,
  priorityToLegacyRank,
  scoreRecommendation,
} from "@/lib/intelligence/recommendations/RecommendationScoring";
import { createTestRecommendation } from "../../fixtures/recommendations";

describe("RecommendationScoring", () => {
  it("scores recommendations using priority, impact, evidence, and source", () => {
    const recommendation = createTestRecommendation({
      priority: "critical",
      source: "alert",
      estimatedImpact: { magnitude: "high" },
    });

    const score = scoreRecommendation(recommendation, [
      {
        id: "evidence-1",
        label: "Alert",
        value: "Guest complaint",
        source: "alert",
        capturedAt: recommendation.generatedAt,
      },
    ]);

    expect(score.businessValue).toBeGreaterThan(100);
    expect(score.confidence).toBeGreaterThan(80);
    expect(score.total).toBeGreaterThan(score.businessValue / 2);
  });

  it("applies scores and confidence to recommendation", () => {
    const scored = applyScores(createTestRecommendation(), []);

    expect(scored.confidenceScore).toBeGreaterThan(0);
    expect(scored.score.total).toBeGreaterThan(0);
  });

  it("maps priority tiers to legacy dashboard ranks", () => {
    expect(priorityToLegacyRank("critical")).toBe(1);
    expect(priorityToLegacyRank("high")).toBe(2);
    expect(priorityToLegacyRank("medium")).toBe(3);
    expect(priorityToLegacyRank("low")).toBe(4);
  });
});
