import type { HealthStatus } from "@/lib/command-center-data";
import { DEFAULT_HEALTH_THRESHOLDS } from "@/lib/intelligence/constants";
import type { PlatformHealthSnapshot, WorkspaceHealthSnapshot } from "@/lib/intelligence/engine-models";
import type { HealthEngine } from "@/lib/intelligence/engine-interfaces";
import type { HealthDriver, HealthScore } from "@/lib/intelligence/models";
import type { RegisteredExecutiveProvider } from "@/lib/intelligence/provider-registry";

/** Builds a standard HealthScore from scored inputs. */
export function buildHealthScore(input: {
  score: number;
  maxScore?: number;
  trend: string;
  status: HealthStatus;
  summary: string;
  drivers?: HealthDriver[];
}): HealthScore {
  return {
    score: input.score,
    maxScore: input.maxScore ?? 100,
    trend: input.trend,
    status: input.status,
    summary: input.summary,
    drivers: input.drivers ?? [],
  };
}

/** Computes a weighted composite score from individual health scores. */
export function calculateCompositeHealthScore(
  scores: number[],
  weights?: number[],
): number {
  if (scores.length === 0) {
    return 0;
  }

  const effectiveWeights = weights ?? scores.map(() => 1 / scores.length);
  const weightSum = effectiveWeights.reduce((sum, weight) => sum + weight, 0);

  const weightedTotal = scores.reduce(
    (sum, score, index) => sum + score * (effectiveWeights[index] ?? 0),
    0,
  );

  return Math.round(weightedTotal / weightSum);
}

/** Derives aggregate status using configurable thresholds. */
export function deriveHealthStatus(
  score: number,
  drivers?: HealthDriver[],
): HealthStatus {
  if (drivers?.some((driver) => driver.status === "critical")) {
    return "critical";
  }

  if (drivers?.some((driver) => driver.status === "attention")) {
    return "attention";
  }

  if (score < DEFAULT_HEALTH_THRESHOLDS.attention) {
    return "critical";
  }

  if (score < DEFAULT_HEALTH_THRESHOLDS.healthy) {
    return "attention";
  }

  return "healthy";
}

function buildWorkspaceHealth(provider: RegisteredExecutiveProvider): WorkspaceHealthSnapshot {
  return {
    workspaceId: provider.id,
    workspaceLabel: provider.workspace,
    health: provider.getHealth(),
  };
}

/** Aggregates health from all registered providers into a platform snapshot. */
export function aggregateProviderHealth(
  providers: RegisteredExecutiveProvider[],
): PlatformHealthSnapshot {
  const workspaceHealth = providers.map(buildWorkspaceHealth);
  const scores = workspaceHealth.map((entry) => entry.health.score);
  const platformScore = calculateCompositeHealthScore(scores);
  const healthyProviderCount = workspaceHealth.filter(
    (entry) => entry.health.status === "healthy",
  ).length;

  const trends = workspaceHealth.map((entry) => entry.health.trend);
  const trend =
    trends.length > 0
      ? trends.reduce((mostCommon, current) => current, trends[0])
      : "—";

  return {
    platformScore,
    platformStatus: deriveHealthStatus(platformScore),
    trend,
    summary: `${healthyProviderCount} of ${providers.length} workspaces reporting healthy status.`,
    workspaceHealth,
    healthyProviderCount,
    totalProviderCount: providers.length,
  };
}

/** Default Health Engine implementation (Mission 17B). */
export const healthEngine: HealthEngine = {
  aggregate: aggregateProviderHealth,
};
