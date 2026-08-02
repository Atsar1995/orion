/**
 * Shared performance engineering types and budgets (Mission P-015.9).
 */

export type PerformanceStatus = "pass" | "warn" | "fail";

export type PerformanceBudget = {
  readonly name: string;
  readonly averageMs: number;
  readonly p95Ms: number;
  readonly p99Ms?: number;
};

/** Enterprise performance budgets — Wave 3 certification targets. */
export const PERFORMANCE_BUDGETS = {
  apiResponse: { name: "api_response", averageMs: 200, p95Ms: 500, p99Ms: 1000 },
  repositoryRead: { name: "repository_read", averageMs: 25, p95Ms: 50 },
  repositoryWrite: { name: "repository_write", averageMs: 50, p95Ms: 100 },
  platformStoreTransaction: { name: "platform_store_tx", averageMs: 75, p95Ms: 150 },
  databaseRead: { name: "database_read", averageMs: 30, p95Ms: 50 },
  databaseWrite: { name: "database_write", averageMs: 60, p95Ms: 100 },
  authentication: { name: "authentication", averageMs: 5, p95Ms: 15 },
  authorization: { name: "authorization", averageMs: 10, p95Ms: 25 },
  healthEndpoint: { name: "health_endpoint", averageMs: 50, p95Ms: 100 },
  workflowExecution: { name: "workflow_execution", averageMs: 100, p95Ms: 250 },
  eventPublishing: { name: "event_publishing", averageMs: 20, p95Ms: 50 },
} as const satisfies Record<string, PerformanceBudget>;

export type BenchmarkCategory = keyof typeof PERFORMANCE_BUDGETS;

export const DEFAULT_LOAD_PROFILE = {
  concurrentUsers: 10,
  requestsPerUser: 5,
  rampUpMs: 100,
} as const;

export const DEFAULT_STRESS_PROFILE = {
  initialConcurrency: 5,
  maxConcurrency: 100,
  stepSize: 5,
  stepDurationMs: 50,
  failureRateThreshold: 0.1,
} as const;
