import { describe, expect, it } from "vitest";
import { GA4Normalizer } from "@/lib/business-health/normalizers/GA4Normalizer";
import { HealthScoreService } from "@/lib/business-health/services/HealthScoreService";
import { finalizeKPI } from "@/lib/business-health/utils/HealthUtils";
import { createTestKPI, sampleGA4Signals } from "@/tests/fixtures/business-health";

describe("HealthScoreService", () => {
  it("delegates KPI scoring to the business health engine", () => {
    const service = new HealthScoreService();
    const result = service.calculateFromKPIs([
      finalizeKPI(
        createTestKPI({
          id: "rev",
          name: "Revenue",
          category: "revenue",
          currentValue: 110,
          previousValue: 100,
          targetValue: 100,
        }),
      ),
    ]);

    expect(result.success).toBe(true);
  });

  it("returns undefined from tryCalculate when scoring fails", () => {
    const service = new HealthScoreService();
    expect(service.tryCalculateFromKPIs([])).toBeUndefined();
  });

  it("calculates from a single provider normalizer", () => {
    const service = new HealthScoreService();
    const result = service.calculateFromProvider(new GA4Normalizer(), sampleGA4Signals);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.overallScore).toBeGreaterThan(0);
    }
  });
});
