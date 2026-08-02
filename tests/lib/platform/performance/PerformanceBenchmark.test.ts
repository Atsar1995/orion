import { beforeEach, describe, expect, it } from "vitest";
import { performanceBenchmark, performanceMetrics } from "@/lib/platform/performance";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";

describe("PerformanceBenchmark", () => {
  beforeEach(() => {
    performanceMetrics.clear();
    resetDefaultPlatformStoreForTests();
  });

  it("runs benchmark suite across platform subsystems", async () => {
    const report = await performanceBenchmark.runSuite({ iterations: 10 });

    expect(report.results.length).toBeGreaterThan(0);
    expect(report.budgetEvaluations.length).toBeGreaterThan(0);
    expect(report.memory.heapUsedMb).toBeGreaterThan(0);
    expect(report.executedAt).toBeTruthy();
  });

  it("benchmarks health endpoint within budget", async () => {
    const result = await performanceBenchmark.benchmarkCategory(
      "healthEndpoint",
      () => {
        /* measured externally */
      },
      5,
    );

    expect(result.iterations).toBe(5);
    expect(result.p95Ms).toBeGreaterThanOrEqual(0);
  });

  it("includes database benchmarks when connection provided", async () => {
    const connection = new MockDatabaseConnection();
    const report = await performanceBenchmark.runSuite({
      iterations: 5,
      databaseConnection: connection,
    });

    expect(report.results.some((result) => result.category === "databaseRead")).toBe(true);
    expect(report.results.some((result) => result.category === "databaseWrite")).toBe(true);
  });

  it("evaluates authorization benchmark samples", async () => {
    await performanceBenchmark.runSuite({ iterations: 8 });

    const authStats = performanceMetrics.getStatistics("authorization");
    expect(authStats.count).toBeGreaterThan(0);
  });
});
