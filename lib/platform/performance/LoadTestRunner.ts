/**
 * Concurrent load testing framework (Mission P-015.9).
 */

import type { BenchmarkCategory } from "@/lib/platform/performance/PerformanceTypes";
import { DEFAULT_LOAD_PROFILE } from "@/lib/platform/performance/PerformanceTypes";
import { performanceMetrics } from "@/lib/platform/performance/PerformanceMetrics";
import { performanceProfiler, type MemorySnapshot } from "@/lib/platform/performance/PerformanceProfiler";

export type LoadTestConfig = {
  readonly concurrentUsers: number;
  readonly requestsPerUser: number;
  readonly rampUpMs: number;
  readonly category: BenchmarkCategory | string;
};

export type LoadTestResult = {
  readonly config: LoadTestConfig;
  readonly totalRequests: number;
  readonly successfulRequests: number;
  readonly failedRequests: number;
  readonly throughputRps: number;
  readonly averageLatencyMs: number;
  readonly p95LatencyMs: number;
  readonly durationMs: number;
  readonly memoryBefore: MemorySnapshot;
  readonly memoryAfter: MemorySnapshot;
  readonly memoryGrowthMb: number;
  readonly poolUtilizationEstimate: number;
};

/** Executes concurrent load tests against platform operations. */
export class LoadTestRunner {
  async run(
    operation: () => Promise<void> | void,
    config: Partial<LoadTestConfig> = {},
  ): Promise<LoadTestResult> {
    const resolved: LoadTestConfig = {
      concurrentUsers: config.concurrentUsers ?? DEFAULT_LOAD_PROFILE.concurrentUsers,
      requestsPerUser: config.requestsPerUser ?? DEFAULT_LOAD_PROFILE.requestsPerUser,
      rampUpMs: config.rampUpMs ?? DEFAULT_LOAD_PROFILE.rampUpMs,
      category: config.category ?? "apiResponse",
    };

    performanceMetrics.clear();
    const memoryBefore = performanceProfiler.captureMemory();
    const started = performance.now();
    let successfulRequests = 0;
    let failedRequests = 0;

    const userTasks = Array.from({ length: resolved.concurrentUsers }, (_, userIndex) =>
      (async () => {
        if (resolved.rampUpMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, userIndex * (resolved.rampUpMs / resolved.concurrentUsers)));
        }

        for (let request = 0; request < resolved.requestsPerUser; request += 1) {
          try {
            await performanceProfiler.profileAsync(resolved.category, async () => {
              await operation();
            });
            successfulRequests += 1;
          } catch {
            failedRequests += 1;
          }
        }
      })(),
    );

    await Promise.all(userTasks);

    const durationMs = performance.now() - started;
    const memoryAfter = performanceProfiler.captureMemory();
    const stats = performanceMetrics.getStatistics(resolved.category);
    const totalRequests = successfulRequests + failedRequests;

    return {
      config: resolved,
      totalRequests,
      successfulRequests,
      failedRequests,
      throughputRps: durationMs > 0 ? Math.round((totalRequests / durationMs) * 1000 * 100) / 100 : 0,
      averageLatencyMs: stats.averageMs,
      p95LatencyMs: stats.p95Ms,
      durationMs: Math.round(durationMs * 100) / 100,
      memoryBefore,
      memoryAfter,
      memoryGrowthMb: Math.round((memoryAfter.heapUsedMb - memoryBefore.heapUsedMb) * 100) / 100,
      poolUtilizationEstimate: Math.min(1, resolved.concurrentUsers / 20),
    };
  }

  async runConcurrentRbacEvaluations(
    evaluate: () => Promise<void> | void,
    concurrency = 20,
  ): Promise<LoadTestResult> {
    return this.run(evaluate, {
      concurrentUsers: concurrency,
      requestsPerUser: 3,
      rampUpMs: 50,
      category: "authorization",
    });
  }

  async runConcurrentDatabaseOps(
    operation: () => Promise<void> | void,
    concurrency = 10,
  ): Promise<LoadTestResult> {
    return this.run(operation, {
      concurrentUsers: concurrency,
      requestsPerUser: 5,
      rampUpMs: 25,
      category: "databaseRead",
    });
  }
}

export const loadTestRunner = new LoadTestRunner();
