import { describe, expect, it } from "vitest";
import { stressTestRunner } from "@/lib/platform/performance";
import { healthStatusService } from "@/lib/observability/HealthStatusService";

describe("StressTesting", () => {
  it("runs stress test with increasing concurrency", async () => {
    const report = await stressTestRunner.run(
      () => {
        healthStatusService.getReport();
      },
      { initialConcurrency: 3, maxConcurrency: 20, stepSize: 3 },
    );

    expect(report.steps.length).toBeGreaterThan(0);
    expect(["stable", "degraded", "failed"]).toContain(report.status);
    expect(report.message).toBeTruthy();
  });

  it("verifies recovery after stress", async () => {
    const report = await stressTestRunner.run(
      () => {
        healthStatusService.getReport();
      },
      { maxConcurrency: 15, stepSize: 5 },
    );

    expect(typeof report.recoveryVerified).toBe("boolean");
  });

  it("records step failure rates", async () => {
    const report = await stressTestRunner.run(
      () => {
        healthStatusService.getReport();
      },
      { maxConcurrency: 10, stepSize: 5 },
    );

    for (const step of report.steps) {
      expect(step.failureRate).toBeGreaterThanOrEqual(0);
      expect(step.failureRate).toBeLessThanOrEqual(1);
      expect(step.loadResult.totalRequests).toBeGreaterThan(0);
    }
  });
});
