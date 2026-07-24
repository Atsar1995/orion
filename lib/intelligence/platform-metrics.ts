import type { PlatformHealthSnapshot } from "@/lib/intelligence/engine-models";
import { runIntelligencePipeline } from "@/lib/intelligence/pipeline";
import { getProviders } from "@/lib/intelligence/provider-registry";

/** Collects platform metrics from registered providers and engine execution. */
export function collectPlatformMetrics() {
  const providers = getProviders();
  const pipeline = runIntelligencePipeline(providers);
  const criticalAlerts = pipeline.recommendations.criticalAlerts.filter(
    (alert) => alert.severity === "critical",
  );

  return {
    registeredProviders: providers.length,
    healthyProviders: pipeline.health.healthyProviderCount,
    platformHealth: pipeline.health,
    criticalAlerts,
    criticalAlertCount: criticalAlerts.length,
    recommendationCount: pipeline.recommendations.recommendations.length,
    engineExecutionTimeMs: pipeline.statistics.totalMs,
    engineStatistics: pipeline.statistics,
    platformStatistics: {
      providerCount: providers.length,
      healthyProviderCount: pipeline.health.healthyProviderCount,
      platformScore: pipeline.health.platformScore,
      platformStatus: pipeline.health.platformStatus,
      priorityCount: pipeline.recommendations.priorities.length,
      opportunityCount: pipeline.recommendations.opportunities.length,
      executiveActionCount: pipeline.recommendations.executiveActions.length,
    },
  };
}

/** Returns registered provider count. */
export function getRegisteredProviderCount(): number {
  return getProviders().length;
}

/** Returns healthy provider count from the latest health aggregation. */
export function getHealthyProviderCount(): number {
  return runIntelligencePipeline(getProviders()).health.healthyProviderCount;
}

/** Returns platform health snapshot. */
export function getPlatformHealth(): PlatformHealthSnapshot {
  return runIntelligencePipeline(getProviders()).health;
}

/** Returns critical alert count. */
export function getCriticalAlertCount(): number {
  return runIntelligencePipeline(getProviders()).recommendations.criticalAlerts.filter(
    (alert) => alert.severity === "critical",
  ).length;
}

/** Returns total recommendation count. */
export function getRecommendationCount(): number {
  return runIntelligencePipeline(getProviders()).recommendations.recommendations.length;
}

/** Returns total engine execution time in milliseconds. */
export function getEngineExecutionTimeMs(): number {
  return runIntelligencePipeline(getProviders()).statistics.totalMs;
}

/** Returns full platform statistics bundle. */
export function getPlatformStatistics() {
  return collectPlatformMetrics().platformStatistics;
}
