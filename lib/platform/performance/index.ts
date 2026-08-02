/**
 * ORION Platform Performance — public API (Mission P-015.9 · ADR-011).
 *
 * @see docs/Platform/Performance/Enterprise-Performance-Certification.md
 */

export type {
  PerformanceStatus,
  PerformanceBudget,
  BenchmarkCategory,
} from "@/lib/platform/performance/PerformanceTypes";
export {
  PERFORMANCE_BUDGETS,
  DEFAULT_LOAD_PROFILE,
  DEFAULT_STRESS_PROFILE,
} from "@/lib/platform/performance/PerformanceTypes";

export type {
  LatencySample,
  LatencyStatistics,
  BudgetEvaluation,
} from "@/lib/platform/performance/PerformanceMetrics";
export {
  PerformanceMetrics,
  performanceMetrics,
  computeStatistics,
  percentile,
} from "@/lib/platform/performance/PerformanceMetrics";

export type { ProfileResult, MemorySnapshot } from "@/lib/platform/performance/PerformanceProfiler";
export { PerformanceProfiler, performanceProfiler } from "@/lib/platform/performance/PerformanceProfiler";

export type { BenchmarkResult, BenchmarkSuiteReport } from "@/lib/platform/performance/PerformanceBenchmark";
export { PerformanceBenchmark, performanceBenchmark } from "@/lib/platform/performance/PerformanceBenchmark";

export type { LoadTestConfig, LoadTestResult } from "@/lib/platform/performance/LoadTestRunner";
export { LoadTestRunner, loadTestRunner } from "@/lib/platform/performance/LoadTestRunner";

export type { StressTestConfig, StressStepResult, StressTestReport } from "@/lib/platform/performance/StressTestRunner";
export { StressTestRunner, stressTestRunner } from "@/lib/platform/performance/StressTestRunner";

export type { ScalabilityDimension, ScalabilityAssessment } from "@/lib/platform/performance/ScalabilityAnalyzer";
export { ScalabilityAnalyzer, scalabilityAnalyzer } from "@/lib/platform/performance/ScalabilityAnalyzer";

export type {
  PerformanceHealthStatus,
  PerformanceHealthCheck,
  PerformanceHealthReport,
} from "@/lib/platform/performance/PerformanceHealthService";
export { PerformanceHealthService, performanceHealthService } from "@/lib/platform/performance/PerformanceHealthService";

export type { PerformanceDashboardSnapshot } from "@/lib/platform/performance/PerformanceDashboard";
export { PerformanceDashboard, performanceDashboard } from "@/lib/platform/performance/PerformanceDashboard";

export type {
  CertificationVerdict,
  PerformanceCertificationReport,
} from "@/lib/platform/performance/PerformanceCertification";
export { PerformanceCertification, performanceCertification } from "@/lib/platform/performance/PerformanceCertification";
