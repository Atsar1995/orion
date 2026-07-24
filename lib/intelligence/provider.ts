import type {
  BusinessAlert,
  ExecutiveMetric,
  ExecutiveRecommendation,
  ExecutiveSummary,
  HealthScore,
} from "@/lib/intelligence/models";

/**
 * Executive Intelligence Provider contract (ADR-006 · Mission 17A).
 *
 * Every Business Workspace publishes executive intelligence through this interface.
 * Contract only — no implementation.
 */
export interface ExecutiveProvider {
  readonly id: string;
  readonly workspace: string;
  readonly version: string;
  getHealth(): HealthScore;
  getAlerts(): BusinessAlert[];
  getRecommendations(): ExecutiveRecommendation[];
  getExecutiveSummary(): ExecutiveSummary;
  getMetrics(): ExecutiveMetric[];
}
