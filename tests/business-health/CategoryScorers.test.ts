import { describe, expect, it } from "vitest";
import {
  CustomerScorer,
  MarketingScorer,
  OperationsScorer,
  RevenueScorer,
} from "@/lib/business-health/scorers";
import { WeightedAverageStrategy } from "@/lib/business-health/strategies/WeightedAverageStrategy";
import { finalizeKPI } from "@/lib/business-health/utils/HealthUtils";
import { createTestKPI } from "@/tests/fixtures/business-health";

describe("Category scorers", () => {
  const strategy = new WeightedAverageStrategy();

  it("scores revenue KPIs with confidence and breakdown", () => {
    const result = new RevenueScorer(strategy).score([
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
    ]);

    expect(result.score).toBeGreaterThan(0);
    expect(result.confidence).toBe(100);
    expect(result.breakdown[0]?.explanation).toContain("Revenue");
  });

  it("returns zero confidence for missing category KPIs", () => {
    const result = new MarketingScorer(strategy).score([]);

    expect(result.score).toBe(0);
    expect(result.confidence).toBe(0);
    expect(result.breakdown[0]?.explanation).toContain("No KPI signals");
  });

  it("scores operations KPIs with lower-is-better metrics", () => {
    const result = new OperationsScorer(strategy).score([
      finalizeKPI(
        createTestKPI({
          id: "refunds",
          name: "Refund Value",
          category: "operations",
          currentValue: 500,
          previousValue: 1000,
          targetValue: null,
          valueDirection: "lower_is_better",
          confidence: 100,
        }),
      ),
    ]);

    expect(result.score).toBeGreaterThan(70);
  });

  it("scores customer KPIs independently", () => {
    const result = new CustomerScorer(strategy).score([
      finalizeKPI(
        createTestKPI({
          id: "nps",
          name: "Customer Satisfaction",
          category: "customer",
          currentValue: 88,
          previousValue: 80,
          targetValue: 85,
          confidence: 85,
        }),
      ),
    ]);

    expect(result.categoryId).toBe("customer");
    expect(result.score).toBeGreaterThan(0);
  });
});
