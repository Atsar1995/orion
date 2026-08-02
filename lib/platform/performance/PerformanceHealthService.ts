/**
 * Performance health monitoring against enterprise budgets (Mission P-015.9 · ADR-011).
 */

import { loadStoreConfiguration } from "@/lib/platform/store/StoreConfiguration";
import type { PerformanceStatus } from "@/lib/platform/performance/PerformanceTypes";
import { performanceMetrics, type BudgetEvaluation } from "@/lib/platform/performance/PerformanceMetrics";
import { performanceProfiler } from "@/lib/platform/performance/PerformanceProfiler";

export type PerformanceHealthStatus = "healthy" | "degraded" | "unhealthy";

export type PerformanceHealthCheck = {
  readonly name: string;
  readonly status: PerformanceHealthStatus;
  readonly message: string;
  readonly budgetStatus: PerformanceStatus;
};

export type PerformanceHealthReport = {
  readonly status: PerformanceHealthStatus;
  readonly message: string;
  readonly checks: readonly PerformanceHealthCheck[];
  readonly budgetEvaluations: readonly BudgetEvaluation[];
  readonly memory: ReturnType<typeof performanceProfiler.captureMemory>;
  readonly cpu: ReturnType<typeof performanceProfiler.measureCpuTime>;
  readonly checkedAt: string;
};

function mapBudgetStatus(status: PerformanceStatus): PerformanceHealthStatus {
  if (status === "pass") {
    return "healthy";
  }

  if (status === "warn") {
    return "degraded";
  }

  return "unhealthy";
}

/** Reports platform performance health against documented budgets. */
export class PerformanceHealthService {
  getReport(): PerformanceHealthReport {
    const budgetEvaluations = performanceMetrics.evaluateAllBudgets();
    const checks: PerformanceHealthCheck[] = budgetEvaluations.map((evaluation) => ({
      name: evaluation.category,
      status: mapBudgetStatus(evaluation.status),
      message: evaluation.message,
      budgetStatus: evaluation.status,
    }));

    const storeConfig = loadStoreConfiguration();
    checks.push({
      name: "connection_pool",
      status: storeConfig.databaseUrl ? "healthy" : "degraded",
      message: storeConfig.databaseUrl
        ? "Database connection pool configured."
        : "In-memory mode — pool metrics not applicable.",
      budgetStatus: storeConfig.databaseUrl ? "pass" : "warn",
    });

    const unhealthy = checks.some((check) => check.status === "unhealthy");
    const degraded = checks.some((check) => check.status === "degraded");

    return {
      status: unhealthy ? "unhealthy" : degraded ? "degraded" : "healthy",
      message: unhealthy
        ? "Performance budgets exceeded."
        : degraded
          ? "Performance within tolerance with warnings."
          : "All performance budgets within targets.",
      checks,
      budgetEvaluations,
      memory: performanceProfiler.captureMemory(),
      cpu: performanceProfiler.measureCpuTime(),
      checkedAt: new Date().toISOString(),
    };
  }
}

export const performanceHealthService = new PerformanceHealthService();
