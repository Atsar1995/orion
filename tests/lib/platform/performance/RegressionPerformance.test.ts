import { beforeEach, describe, expect, it } from "vitest";
import {
  performanceCertification,
  performanceMetrics,
  PERFORMANCE_BUDGETS,
} from "@/lib/platform/performance";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";

describe("RegressionPerformance", () => {
  beforeEach(() => {
    performanceMetrics.clear();
    resetDefaultPlatformStoreForTests();
  });

  it("runs full performance certification", async () => {
    const report = await performanceCertification.certify({ iterations: 8 });

    expect(report.mission).toBe("P-015.9");
    expect(["GO", "CONDITIONAL GO", "NO-GO"]).toContain(report.verdict);
    expect(report.dashboard.summary.performanceReadinessScore).toBeGreaterThan(0);
    expect(report.wave3ExitCriteria.length).toBeGreaterThan(0);
  });

  it("includes database regression when connection available", async () => {
    const connection = new MockDatabaseConnection();
    const report = await performanceCertification.certify({
      iterations: 5,
      databaseConnection: connection,
    });

    expect(report.benchmark.results.some((result) => result.category === "databaseRead")).toBe(true);
  });

  it("maintains documented performance budgets", () => {
    expect(PERFORMANCE_BUDGETS.apiResponse.p95Ms).toBe(500);
    expect(PERFORMANCE_BUDGETS.authorization.p95Ms).toBe(25);
    expect(PERFORMANCE_BUDGETS.healthEndpoint.p95Ms).toBe(100);
  });

  it("does not regress benchmark suite structure", async () => {
    const report = await performanceCertification.certify({ iterations: 5 });

    const categories = report.benchmark.results.map((result) => result.category);
    expect(categories).toContain("healthEndpoint");
    expect(categories).toContain("authorization");
    expect(categories).toContain("platformStoreTransaction");
  });
});
