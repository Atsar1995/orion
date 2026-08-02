/**
 * Performance metrics collection and percentile computation (Mission P-015.9 · ADR-011).
 */

import type { BenchmarkCategory, PerformanceBudget, PerformanceStatus } from "@/lib/platform/performance/PerformanceTypes";
import { PERFORMANCE_BUDGETS } from "@/lib/platform/performance/PerformanceTypes";

export type LatencySample = {
  readonly category: BenchmarkCategory | string;
  readonly durationMs: number;
  readonly timestamp: string;
  readonly labels?: Record<string, string>;
};

export type LatencyStatistics = {
  readonly category: string;
  readonly count: number;
  readonly averageMs: number;
  readonly minMs: number;
  readonly maxMs: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
};

export type BudgetEvaluation = {
  readonly category: string;
  readonly statistics: LatencyStatistics;
  readonly budget: PerformanceBudget;
  readonly status: PerformanceStatus;
  readonly message: string;
};

function percentile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) {
    return 0;
  }

  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))]!;
}

function computeStatistics(category: string, samples: readonly number[]): LatencyStatistics {
  if (samples.length === 0) {
    return {
      category,
      count: 0,
      averageMs: 0,
      minMs: 0,
      maxMs: 0,
      p50Ms: 0,
      p95Ms: 0,
      p99Ms: 0,
    };
  }

  const sorted = [...samples].sort((left, right) => left - right);
  const sum = sorted.reduce((total, value) => total + value, 0);

  return {
    category,
    count: sorted.length,
    averageMs: Math.round((sum / sorted.length) * 100) / 100,
    minMs: sorted[0]!,
    maxMs: sorted[sorted.length - 1]!,
    p50Ms: percentile(sorted, 50),
    p95Ms: percentile(sorted, 95),
    p99Ms: percentile(sorted, 99),
  };
}

/** Collects latency samples and evaluates against performance budgets. */
export class PerformanceMetrics {
  private readonly samples = new Map<string, number[]>();
  private readonly maxSamplesPerCategory = 2000;

  record(category: BenchmarkCategory | string, durationMs: number): LatencySample {
    const bucket = this.samples.get(category) ?? [];
    bucket.push(durationMs);

    if (bucket.length > this.maxSamplesPerCategory) {
      bucket.shift();
    }

    this.samples.set(category, bucket);

    return {
      category,
      durationMs,
      timestamp: new Date().toISOString(),
    };
  }

  getStatistics(category: BenchmarkCategory | string): LatencyStatistics {
    return computeStatistics(category, this.samples.get(category) ?? []);
  }

  getAllStatistics(): readonly LatencyStatistics[] {
    return [...this.samples.keys()].map((category) => this.getStatistics(category));
  }

  evaluateBudget(category: BenchmarkCategory): BudgetEvaluation {
    const budget = PERFORMANCE_BUDGETS[category];
    const statistics = this.getStatistics(category);

    let status: PerformanceStatus = "pass";
    let message = `${category} within budget (p95 ${statistics.p95Ms}ms ≤ ${budget.p95Ms}ms).`;

    if (statistics.count === 0) {
      status = "warn";
      message = `${category} — no samples recorded.`;
    } else if (statistics.p95Ms > budget.p95Ms) {
      status = "fail";
      message = `${category} exceeds p95 budget: ${statistics.p95Ms}ms > ${budget.p95Ms}ms.`;
    } else if (statistics.averageMs > budget.averageMs) {
      status = "warn";
      message = `${category} average elevated: ${statistics.averageMs}ms > ${budget.averageMs}ms.`;
    }

    return { category, statistics, budget, status, message };
  }

  evaluateAllBudgets(): readonly BudgetEvaluation[] {
    return (Object.keys(PERFORMANCE_BUDGETS) as BenchmarkCategory[]).map((category) =>
      this.evaluateBudget(category),
    );
  }

  clear(): void {
    this.samples.clear();
  }
}

export const performanceMetrics = new PerformanceMetrics();

export { computeStatistics, percentile };
