import { describe, expect, it } from "vitest";
import { WeightedAverageStrategy } from "@/lib/business-health/strategies/WeightedAverageStrategy";
import { finalizeKPI } from "@/lib/business-health/utils/HealthUtils";
import { createTestKPI } from "@/tests/fixtures/business-health";

describe("WeightedAverageStrategy", () => {
  const strategy = new WeightedAverageStrategy();

  it("calculates KPI scores deterministically", () => {
    const kpi = finalizeKPI(
      createTestKPI({
        id: "rev",
        name: "Revenue",
        category: "revenue",
        currentValue: 120,
        previousValue: 100,
        targetValue: 100,
      }),
    );

    expect(strategy.calculateKPIScore(kpi)).toBeGreaterThan(90);
    expect(strategy.calculateKPIScore(kpi)).toBe(strategy.calculateKPIScore(kpi));
  });

  it("calculates category scores with explainable breakdown", () => {
    const result = strategy.calculateCategoryScore([
      finalizeKPI(
        createTestKPI({
          id: "rev",
          name: "Revenue",
          category: "revenue",
          currentValue: 120,
          previousValue: 100,
          targetValue: 100,
          confidence: 100,
        }),
      ),
      finalizeKPI(
        createTestKPI({
          id: "orders",
          name: "Orders",
          category: "revenue",
          currentValue: 80,
          previousValue: 100,
          targetValue: 100,
          confidence: 90,
        }),
      ),
    ]);

    expect(result.score).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.breakdown).toHaveLength(2);
  });

  it("calculates overall scores with weighted category contributions", () => {
    const result = strategy.calculateOverallScore(
      [
        {
          categoryId: "revenue",
          categoryName: "Revenue",
          score: 90,
          confidence: 100,
          weight: 0.5,
          breakdown: [{ category: "Revenue KPI", contribution: 5, explanation: "Strong revenue" }],
        },
        {
          categoryId: "marketing",
          categoryName: "Marketing",
          score: 70,
          confidence: 90,
          weight: 0.5,
          breakdown: [{ category: "Sessions", contribution: -3, explanation: "Soft traffic" }],
        },
      ],
      [
        { id: "revenue", name: "Revenue", weight: 0.5 },
        { id: "marketing", name: "Marketing", weight: 0.5 },
      ],
    );

    expect(result.overallScore).toBe(80);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.breakdown).toHaveLength(2);
  });

  it("returns zero scores for empty category input", () => {
    expect(strategy.calculateCategoryScore([])).toEqual({
      score: 0,
      confidence: 0,
      breakdown: [],
    });
  });

  it("ignores invalid KPI weights during category scoring", () => {
    const result = strategy.calculateCategoryScore([
      finalizeKPI(
        createTestKPI({
          id: "valid",
          name: "Valid KPI",
          category: "revenue",
          weight: 1,
          confidence: 100,
        }),
      ),
      finalizeKPI(
        createTestKPI({
          id: "invalid",
          name: "Invalid KPI",
          category: "revenue",
          weight: 0,
          confidence: 0,
        }),
      ),
    ]);

    expect(result.score).toBeGreaterThan(0);
  });

  it("returns zero overall score when no categories are present", () => {
    expect(strategy.calculateOverallScore([], [])).toEqual({
      overallScore: 0,
      confidence: 0,
      breakdown: [],
    });
  });
});
