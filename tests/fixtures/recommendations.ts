import type { Recommendation } from "@/types/recommendations";

export function createTestRecommendation(
  overrides: Partial<Recommendation> = {},
): Recommendation {
  const timestamp = "2026-07-25T10:00:00.000Z";

  return {
    id: "rec-test-1",
    title: "Test recommendation",
    summary: "Test summary",
    businessReason: "Test reason",
    evidence: [],
    expectedBenefit: "Test benefit",
    estimatedImpact: { magnitude: "medium" },
    priority: "high",
    category: "finance",
    confidenceScore: 85,
    suggestedActions: [],
    source: "rule",
    score: {
      businessValue: 105,
      confidence: 85,
      urgency: 80,
      total: 90,
    },
    generatedAt: timestamp,
    ...overrides,
  };
}
