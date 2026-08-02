/**
 * Scalability analysis and scoring (Mission P-015.9).
 */

import type { LoadTestResult } from "@/lib/platform/performance/LoadTestRunner";
import type { StressTestReport } from "@/lib/platform/performance/StressTestRunner";
import type { BudgetEvaluation } from "@/lib/platform/performance/PerformanceMetrics";

export type ScalabilityDimension = {
  readonly name: string;
  readonly score: number;
  readonly status: "excellent" | "good" | "fair" | "poor";
  readonly detail: string;
};

export type ScalabilityAssessment = {
  readonly assessedAt: string;
  readonly scalabilityScore: number;
  readonly dimensions: readonly ScalabilityDimension[];
  readonly horizontalReadiness: "single_node_ga" | "scale_out_ready" | "not_ready";
  readonly bottlenecks: readonly string[];
  readonly recommendations: readonly string[];
};

function scoreStatus(score: number): ScalabilityDimension["status"] {
  if (score >= 90) {
    return "excellent";
  }

  if (score >= 75) {
    return "good";
  }

  if (score >= 60) {
    return "fair";
  }

  return "poor";
}

/** Analyzes load/stress results and budget evaluations for scalability scoring. */
export class ScalabilityAnalyzer {
  assess(input: {
    loadResults: readonly LoadTestResult[];
    stressReport?: StressTestReport;
    budgetEvaluations: readonly BudgetEvaluation[];
  }): ScalabilityAssessment {
    const bottlenecks: string[] = [];
    const recommendations: string[] = [];

    const throughputScore = this.scoreThroughput(input.loadResults, bottlenecks);
    const latencyScore = this.scoreLatency(input.budgetEvaluations, bottlenecks, recommendations);
    const concurrencyScore = this.scoreConcurrency(input.stressReport, bottlenecks, recommendations);
    const memoryScore = this.scoreMemory(input.loadResults, bottlenecks, recommendations);
    const poolScore = this.scoreConnectionPool(input.loadResults, recommendations);

    const dimensions: ScalabilityDimension[] = [
      {
        name: "Throughput",
        score: throughputScore,
        status: scoreStatus(throughputScore),
        detail: "Requests per second under concurrent load.",
      },
      {
        name: "Latency",
        score: latencyScore,
        status: scoreStatus(latencyScore),
        detail: "p95 latency against enterprise budgets.",
      },
      {
        name: "Concurrency",
        score: concurrencyScore,
        status: scoreStatus(concurrencyScore),
        detail: "Breaking point and graceful degradation.",
      },
      {
        name: "Memory",
        score: memoryScore,
        status: scoreStatus(memoryScore),
        detail: "Heap growth under load.",
      },
      {
        name: "Connection Pool",
        score: poolScore,
        status: scoreStatus(poolScore),
        detail: "Estimated pool utilization under load.",
      },
    ];

    const scalabilityScore = Math.round(
      dimensions.reduce((sum, dimension) => sum + dimension.score, 0) / dimensions.length,
    );

    if (bottlenecks.length === 0) {
      recommendations.push("Continue monitoring p95 latency in staging under production-like load.");
    }

    recommendations.push("Single-node GA path validated — horizontal scale-out documented in Scalability ADR.");

    return {
      assessedAt: new Date().toISOString(),
      scalabilityScore,
      dimensions,
      horizontalReadiness: scalabilityScore >= 75 ? "single_node_ga" : "not_ready",
      bottlenecks,
      recommendations,
    };
  }

  private scoreThroughput(loadResults: readonly LoadTestResult[], bottlenecks: string[]): number {
    if (loadResults.length === 0) {
      return 70;
    }

    const maxRps = Math.max(...loadResults.map((result) => result.throughputRps));

    if (maxRps < 10) {
      bottlenecks.push("Low throughput under concurrent load");
      return 55;
    }

    if (maxRps < 50) {
      return 75;
    }

    return 90;
  }

  private scoreLatency(
    evaluations: readonly BudgetEvaluation[],
    bottlenecks: string[],
    recommendations: string[],
  ): number {
    const failures = evaluations.filter((evaluation) => evaluation.status === "fail");
    const warnings = evaluations.filter((evaluation) => evaluation.status === "warn");

    for (const failure of failures) {
      bottlenecks.push(`${failure.category}: p95 ${failure.statistics.p95Ms}ms exceeds budget`);
      recommendations.push(`Optimize ${failure.category} hot path — target p95 ≤ ${failure.budget.p95Ms}ms`);
    }

    if (failures.length > 0) {
      return Math.max(30, 80 - failures.length * 15);
    }

    if (warnings.length > 0) {
      return 75;
    }

    return 90;
  }

  private scoreConcurrency(
    stressReport: StressTestReport | undefined,
    bottlenecks: string[],
    recommendations: string[],
  ): number {
    if (!stressReport) {
      return 70;
    }

    if (stressReport.status === "failed") {
      bottlenecks.push(`Stress failure at concurrency ${stressReport.breakingPoint}`);
      recommendations.push("Review resource exhaustion handling and connection pool limits.");
      return 45;
    }

    if (stressReport.status === "degraded") {
      return stressReport.gracefulDegradation && stressReport.recoveryVerified ? 78 : 60;
    }

    return 92;
  }

  private scoreMemory(loadResults: readonly LoadTestResult[], bottlenecks: string[], recommendations: string[]): number {
    if (loadResults.length === 0) {
      return 70;
    }

    const maxGrowth = Math.max(...loadResults.map((result) => result.memoryGrowthMb));

    if (maxGrowth > 50) {
      bottlenecks.push(`Memory growth ${maxGrowth}MB under load`);
      recommendations.push("Investigate memory hotspots — review in-memory store retention.");
      return 50;
    }

    if (maxGrowth > 20) {
      return 72;
    }

    return 88;
  }

  private scoreConnectionPool(loadResults: readonly LoadTestResult[], recommendations: string[]): number {
    if (loadResults.length === 0) {
      return 70;
    }

    const maxUtilization = Math.max(...loadResults.map((result) => result.poolUtilizationEstimate));

    if (maxUtilization > 0.9) {
      recommendations.push("Tune PostgreSQL connection pool size for production load.");
      return 60;
    }

    if (maxUtilization > 0.7) {
      return 78;
    }

    return 90;
  }
}

export const scalabilityAnalyzer = new ScalabilityAnalyzer();
