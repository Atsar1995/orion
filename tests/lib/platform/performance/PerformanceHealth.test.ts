import { beforeEach, describe, expect, it } from "vitest";
import { performanceHealthService, performanceMetrics } from "@/lib/platform/performance";

describe("PerformanceHealth", () => {
  beforeEach(() => {
    performanceMetrics.clear();
  });

  it("reports performance health status", () => {
    const report = performanceHealthService.getReport();

    expect(["healthy", "degraded", "unhealthy"]).toContain(report.status);
    expect(report.checks.length).toBeGreaterThan(0);
    expect(report.memory.heapUsedMb).toBeGreaterThan(0);
    expect(report.checkedAt).toBeTruthy();
  });

  it("includes budget evaluations for all categories", () => {
    const report = performanceHealthService.getReport();

    expect(report.budgetEvaluations.length).toBeGreaterThanOrEqual(10);
    expect(report.checks.some((check) => check.name === "connection_pool")).toBe(true);
  });

  it("warns when no benchmark samples recorded", () => {
    const report = performanceHealthService.getReport();
    const warnings = report.budgetEvaluations.filter((evaluation) => evaluation.status === "warn");

    expect(warnings.length).toBeGreaterThan(0);
  });
});
