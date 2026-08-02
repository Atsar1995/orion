/**
 * Stress testing framework — breaking point analysis (Mission P-015.9).
 */

import { DEFAULT_STRESS_PROFILE } from "@/lib/platform/performance/PerformanceTypes";
import { loadTestRunner, type LoadTestResult } from "@/lib/platform/performance/LoadTestRunner";

export type StressTestConfig = {
  readonly initialConcurrency: number;
  readonly maxConcurrency: number;
  readonly stepSize: number;
  readonly stepDurationMs: number;
  readonly failureRateThreshold: number;
};

export type StressStepResult = {
  readonly concurrency: number;
  readonly loadResult: LoadTestResult;
  readonly failureRate: number;
  readonly degraded: boolean;
};

export type StressTestReport = {
  readonly executedAt: string;
  readonly config: StressTestConfig;
  readonly steps: readonly StressStepResult[];
  readonly breakingPoint: number | null;
  readonly gracefulDegradation: boolean;
  readonly recoveryVerified: boolean;
  readonly status: "stable" | "degraded" | "failed";
  readonly message: string;
};

/** Increases concurrency until failure thresholds are reached. */
export class StressTestRunner {
  async run(
    operation: () => Promise<void> | void,
    config: Partial<StressTestConfig> = {},
  ): Promise<StressTestReport> {
    const resolved: StressTestConfig = {
      initialConcurrency: config.initialConcurrency ?? DEFAULT_STRESS_PROFILE.initialConcurrency,
      maxConcurrency: config.maxConcurrency ?? DEFAULT_STRESS_PROFILE.maxConcurrency,
      stepSize: config.stepSize ?? DEFAULT_STRESS_PROFILE.stepSize,
      stepDurationMs: config.stepDurationMs ?? DEFAULT_STRESS_PROFILE.stepDurationMs,
      failureRateThreshold: config.failureRateThreshold ?? DEFAULT_STRESS_PROFILE.failureRateThreshold,
    };

    const steps: StressStepResult[] = [];
    let breakingPoint: number | null = null;
    let gracefulDegradation = true;

    for (
      let concurrency = resolved.initialConcurrency;
      concurrency <= resolved.maxConcurrency;
      concurrency += resolved.stepSize
    ) {
      const loadResult = await loadTestRunner.run(operation, {
        concurrentUsers: concurrency,
        requestsPerUser: 2,
        rampUpMs: resolved.stepDurationMs,
        category: "apiResponse",
      });

      const failureRate =
        loadResult.totalRequests > 0 ? loadResult.failedRequests / loadResult.totalRequests : 0;
      const degraded = failureRate > 0 && failureRate <= resolved.failureRateThreshold;
      const failed = failureRate > resolved.failureRateThreshold;

      steps.push({ concurrency, loadResult, failureRate, degraded: degraded || failed });

      if (failed && breakingPoint === null) {
        breakingPoint = concurrency;
        gracefulDegradation = steps.length > 1;
      }

      if (failed) {
        break;
      }
    }

    const recoveryResult = await loadTestRunner.run(operation, {
      concurrentUsers: resolved.initialConcurrency,
      requestsPerUser: 2,
      rampUpMs: 0,
      category: "apiResponse",
    });

    const recoveryVerified = recoveryResult.failedRequests === 0;

    let status: StressTestReport["status"] = "stable";
    let message = "Platform remained stable under stress test range.";

    if (breakingPoint !== null) {
      status = gracefulDegradation && recoveryVerified ? "degraded" : "failed";
      message = gracefulDegradation
        ? `Graceful degradation at concurrency ${breakingPoint}; recovery ${recoveryVerified ? "verified" : "failed"}.`
        : `Failure at concurrency ${breakingPoint} without graceful degradation.`;
    }

    return {
      executedAt: new Date().toISOString(),
      config: resolved,
      steps,
      breakingPoint,
      gracefulDegradation,
      recoveryVerified,
      status,
      message,
    };
  }
}

export const stressTestRunner = new StressTestRunner();
