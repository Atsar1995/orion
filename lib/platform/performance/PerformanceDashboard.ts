/**
 * Performance dashboard aggregation (Mission P-015.9).
 */

import type { BenchmarkSuiteReport } from "@/lib/platform/performance/PerformanceBenchmark";
import type { LoadTestResult } from "@/lib/platform/performance/LoadTestRunner";
import type { StressTestReport } from "@/lib/platform/performance/StressTestRunner";
import type { ScalabilityAssessment } from "@/lib/platform/performance/ScalabilityAnalyzer";
import type { PerformanceHealthReport } from "@/lib/platform/performance/PerformanceHealthService";

export type PerformanceDashboardSnapshot = {
  readonly generatedAt: string;
  readonly health: PerformanceHealthReport;
  readonly benchmark?: BenchmarkSuiteReport;
  readonly loadTests: readonly LoadTestResult[];
  readonly stressTest?: StressTestReport;
  readonly scalability?: ScalabilityAssessment;
  readonly summary: {
    readonly averageApiLatencyMs: number;
    readonly p95ApiLatencyMs: number;
    readonly authorizationLatencyMs: number;
    readonly databaseLatencyMs: number;
    readonly throughputRps: number;
    readonly memoryHeapMb: number;
    readonly cpuUserMs: number;
    readonly scalabilityScore: number;
    readonly performanceReadinessScore: number;
  };
};

/** Aggregates performance data for dashboard and certification views. */
export class PerformanceDashboard {
  build(input: {
    health: PerformanceHealthReport;
    benchmark?: BenchmarkSuiteReport;
    loadTests?: readonly LoadTestResult[];
    stressTest?: StressTestReport;
    scalability?: ScalabilityAssessment;
  }): PerformanceDashboardSnapshot {
    const loadTests = input.loadTests ?? [];
    const apiLoad = loadTests.find((result) => result.config.category === "apiResponse");
    const authLoad = loadTests.find((result) => result.config.category === "authorization");
    const dbLoad = loadTests.find((result) => result.config.category === "databaseRead");

    const benchmarkApi = input.benchmark?.results.find((result) => result.category === "healthEndpoint");
    const benchmarkAuth = input.benchmark?.budgetEvaluations.find(
      (evaluation) => evaluation.category === "authorization",
    );
    const benchmarkDb = input.benchmark?.budgetEvaluations.find(
      (evaluation) => evaluation.category === "databaseRead",
    );

    const averageApiLatencyMs = apiLoad?.averageLatencyMs ?? benchmarkApi?.averageMs ?? 0;
    const p95ApiLatencyMs = apiLoad?.p95LatencyMs ?? benchmarkApi?.p95Ms ?? 0;
    const authorizationLatencyMs =
      authLoad?.averageLatencyMs ?? benchmarkAuth?.statistics.averageMs ?? 0;
    const databaseLatencyMs = dbLoad?.averageLatencyMs ?? benchmarkDb?.statistics.averageMs ?? 0;
    const throughputRps = Math.max(...loadTests.map((result) => result.throughputRps), 0);
    const scalabilityScore = input.scalability?.scalabilityScore ?? 70;
    const performanceReadinessScore = this.computeReadinessScore({
      health: input.health,
      scalabilityScore,
      p95ApiLatencyMs,
    });

    return {
      generatedAt: new Date().toISOString(),
      health: input.health,
      benchmark: input.benchmark,
      loadTests,
      stressTest: input.stressTest,
      scalability: input.scalability,
      summary: {
        averageApiLatencyMs,
        p95ApiLatencyMs,
        authorizationLatencyMs,
        databaseLatencyMs,
        throughputRps,
        memoryHeapMb: input.health.memory.heapUsedMb,
        cpuUserMs: input.health.cpu.userMs,
        scalabilityScore,
        performanceReadinessScore,
      },
    };
  }

  private computeReadinessScore(input: {
    health: PerformanceHealthReport;
    scalabilityScore: number;
    p95ApiLatencyMs: number;
  }): number {
    let score = 78;

    if (input.health.status === "healthy") {
      score += 5;
    } else if (input.health.status === "unhealthy") {
      score -= 15;
    }

    score += Math.round((input.scalabilityScore - 70) * 0.15);

    if (input.p95ApiLatencyMs > 0 && input.p95ApiLatencyMs <= 500) {
      score += 3;
    } else if (input.p95ApiLatencyMs > 500) {
      score -= 10;
    }

    return Math.min(100, Math.max(0, score));
  }
}

export const performanceDashboard = new PerformanceDashboard();
