import { beforeEach, describe, expect, it } from "vitest";
import { loadTestRunner, performanceMetrics } from "@/lib/platform/performance";
import { healthStatusService } from "@/lib/observability/HealthStatusService";

describe("LoadTesting", () => {
  beforeEach(() => {
    performanceMetrics.clear();
  });

  it("executes concurrent load test", async () => {
    const result = await loadTestRunner.run(
      () => {
        healthStatusService.getReport();
      },
      { concurrentUsers: 5, requestsPerUser: 3, category: "apiResponse" },
    );

    expect(result.totalRequests).toBe(15);
    expect(result.successfulRequests).toBe(15);
    expect(result.failedRequests).toBe(0);
    expect(result.throughputRps).toBeGreaterThan(0);
  });

  it("measures memory growth under load", async () => {
    const result = await loadTestRunner.run(() => {
      new Array(100).fill(0);
    });

    expect(result.memoryBefore.heapUsedMb).toBeGreaterThan(0);
    expect(result.memoryAfter.heapUsedMb).toBeGreaterThan(0);
  });

  it("runs concurrent RBAC evaluations", async () => {
    const result = await loadTestRunner.runConcurrentRbacEvaluations(() => {
      /* lightweight noop — RBAC benchmarked in PerformanceBenchmark */
    }, 8);

    expect(result.config.category).toBe("authorization");
    expect(result.totalRequests).toBe(24);
  });

  it("estimates connection pool utilization", async () => {
    const result = await loadTestRunner.runConcurrentDatabaseOps(async () => {
      await Promise.resolve();
    }, 10);

    expect(result.poolUtilizationEstimate).toBeGreaterThan(0);
    expect(result.poolUtilizationEstimate).toBeLessThanOrEqual(1);
  });
});
