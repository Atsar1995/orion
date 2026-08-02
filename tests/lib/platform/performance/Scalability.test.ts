import { describe, expect, it } from "vitest";
import { loadTestRunner, scalabilityAnalyzer } from "@/lib/platform/performance";
import { performanceMetrics } from "@/lib/platform/performance/PerformanceMetrics";
import { healthStatusService } from "@/lib/observability/HealthStatusService";

describe("Scalability", () => {
  it("assesses scalability from load and budget data", async () => {
    performanceMetrics.clear();

    const loadResult = await loadTestRunner.run(
      () => {
        healthStatusService.getReport();
      },
      { concurrentUsers: 5, requestsPerUser: 4, category: "apiResponse" },
    );

    const assessment = scalabilityAnalyzer.assess({
      loadResults: [loadResult],
      budgetEvaluations: performanceMetrics.evaluateAllBudgets(),
    });

    expect(assessment.scalabilityScore).toBeGreaterThan(0);
    expect(assessment.dimensions.length).toBe(5);
    expect(assessment.horizontalReadiness).toBeTruthy();
    expect(assessment.recommendations.length).toBeGreaterThan(0);
  });

  it("identifies bottlenecks when budgets fail", () => {
    for (let index = 0; index < 20; index += 1) {
      performanceMetrics.record("apiResponse", 800);
    }

    const assessment = scalabilityAnalyzer.assess({
      loadResults: [],
      budgetEvaluations: performanceMetrics.evaluateAllBudgets(),
    });

    expect(assessment.bottlenecks.length).toBeGreaterThan(0);
    expect(assessment.scalabilityScore).toBeLessThan(90);
  });
});
