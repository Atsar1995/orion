import { describe, expect, it } from "vitest";
import {
  buildHealthSummary,
  deriveHealthStatusLabel,
  deriveKPIStatus,
  evaluateKPIScore,
  finalizeKPI,
} from "@/lib/business-health/utils/HealthUtils";
import { createTestKPI } from "@/tests/fixtures/business-health";

describe("HealthUtils", () => {
  it("maps overall scores to executive health statuses", () => {
    expect(deriveHealthStatusLabel(95)).toBe("excellent");
    expect(deriveHealthStatusLabel(80)).toBe("healthy");
    expect(deriveHealthStatusLabel(65)).toBe("fair");
    expect(deriveHealthStatusLabel(45)).toBe("poor");
    expect(deriveHealthStatusLabel(20)).toBe("critical");
  });

  it("evaluates KPI scores using targets and trend direction", () => {
    const improving = finalizeKPI(
      createTestKPI({
        id: "rev",
        name: "Revenue",
        category: "revenue",
        currentValue: 120,
        previousValue: 100,
        targetValue: 100,
      }),
    );
    const bounce = finalizeKPI(
      createTestKPI({
        id: "bounce",
        name: "Bounce Rate",
        category: "marketing",
        currentValue: 0.35,
        previousValue: 0.5,
        targetValue: 0.45,
        valueDirection: "lower_is_better",
      }),
    );

    expect(evaluateKPIScore(improving)).toBeGreaterThan(90);
    expect(evaluateKPIScore(bounce)).toBeGreaterThan(70);
    expect(deriveKPIStatus(82)).toBe("healthy");
  });

  it("builds an executive summary from category scores", () => {
    const summary = buildHealthSummary(82, "healthy", [
      { categoryName: "Revenue", score: 90 },
      { categoryName: "Marketing", score: 70 },
    ]);

    expect(summary).toContain("healthy");
    expect(summary).toContain("Revenue");
    expect(summary).toContain("Marketing");
  });
});
