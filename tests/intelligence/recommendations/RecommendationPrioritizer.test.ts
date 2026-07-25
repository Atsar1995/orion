import { describe, expect, it } from "vitest";
import {
  deduplicateRecommendations,
  rankRecommendations,
  selectTopRecommendations,
} from "@/lib/intelligence/recommendations/RecommendationPrioritizer";
import { createTestRecommendation } from "../../fixtures/recommendations";

describe("RecommendationPrioritizer", () => {
  it("deduplicates recommendations by normalized title", () => {
    const recommendations = [
      createTestRecommendation({ id: "1", title: "Increase Rates" }),
      createTestRecommendation({ id: "2", title: " increase rates " }),
    ];

    expect(deduplicateRecommendations(recommendations)).toHaveLength(1);
  });

  it("ranks recommendations by priority then score", () => {
    const ranked = rankRecommendations([
      createTestRecommendation({
        id: "low",
        priority: "low",
        score: { businessValue: 200, confidence: 100, urgency: 90, total: 999 },
      }),
      createTestRecommendation({
        id: "critical",
        priority: "critical",
        score: { businessValue: 130, confidence: 90, urgency: 100, total: 100 },
      }),
    ]);

    expect(ranked[0]?.id).toBe("critical");
  });

  it("selects top N recommendations", () => {
    const top = selectTopRecommendations(
      [
        createTestRecommendation({ id: "1", priority: "critical" }),
        createTestRecommendation({ id: "2", priority: "high" }),
        createTestRecommendation({ id: "3", priority: "medium" }),
      ],
      2,
    );

    expect(top).toHaveLength(2);
    expect(top[0]?.priority).toBe("critical");
  });
});
