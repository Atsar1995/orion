import { describe, expect, it } from "vitest";
import {
  buildRecommendationBundle,
  recommendationEngine,
  toDashboardRecommendation,
} from "@/lib/intelligence/recommendations/RecommendationEngine";
import { createTestRecommendation } from "../../fixtures/recommendations";

describe("RecommendationEngine", () => {
  it("generates ranked recommendation bundle from provider signals", async () => {
    const bundle = await buildRecommendationBundle();

    expect(bundle.generatedAt).toBeTruthy();
    expect(bundle.recommendations.length).toBeGreaterThan(0);
    expect(bundle.recommendations[0]?.title).toBeTruthy();
    expect(bundle.recommendations[0]?.confidenceScore).toBeGreaterThan(0);
  });

  it("builds recommendation context with provider and health data", async () => {
    const context = await recommendationEngine.buildContext();

    expect(context.contributions.length).toBeGreaterThan(0);
    expect(context.businessHealth.score).toBeGreaterThan(0);
    expect(context.dailyBrief.topPriorities.length).toBeGreaterThan(0);
  });

  it("maps structured recommendations to dashboard format", () => {
    const dashboard = toDashboardRecommendation(
      createTestRecommendation({
        title: "Increase weekend room rates",
        summary: "Capture demand premium",
        priority: "critical",
        category: "revenue",
      }),
    );

    expect(dashboard.priority).toBe(1);
    expect(dashboard.title).toBe("Increase weekend room rates");
    expect(dashboard.description).toBe("Capture demand premium");
  });
});
