import { buildAlertPanelSnapshot, buildDashboardAlerts } from "@/lib/intelligence/alerts/AlertEngine";
import { buildExecutiveBriefForDashboard } from "@/lib/intelligence/brief/ExecutiveBriefEngine";
import {
  aggregateBusinessHealth,
  aggregateMetrics,
  aggregateTasks,
  aggregateTrends,
} from "@/lib/intelligence/shared/provider-aggregation";
import { buildDashboardRecommendations } from "@/lib/intelligence/recommendations/RecommendationEngine";
import { fetchProviderContributions } from "@/lib/providers/provider-data";
import type {
  Alert,
  BusinessHealth,
  DashboardSnapshot,
  ExecutiveBrief,
  ExecutiveMetricsBundle,
  ExecutiveTask,
  Recommendation,
  Trend,
} from "@/types/intelligence";

export { fetchProviderContributions } from "@/lib/providers/provider-data";

export async function buildDashboardSnapshotFromProviders(): Promise<DashboardSnapshot> {
  const contributions = await fetchProviderContributions();
  const alertPanel = await buildAlertPanelSnapshot(contributions);

  return {
    businessHealth: aggregateBusinessHealth(contributions),
    metrics: aggregateMetrics(contributions),
    brief: await buildExecutiveBriefForDashboard(undefined, contributions),
    recommendations: await buildDashboardRecommendations(contributions),
    alerts: alertPanel.recent,
    alertPanel,
    tasks: aggregateTasks(contributions),
    trends: aggregateTrends(contributions),
  };
}

export async function buildExecutiveMetricsFromProviders(): Promise<ExecutiveMetricsBundle> {
  const contributions = await fetchProviderContributions();
  return aggregateMetrics(contributions);
}

export async function buildExecutiveBriefFromProviders(): Promise<ExecutiveBrief> {
  const contributions = await fetchProviderContributions();
  return buildExecutiveBriefForDashboard(undefined, contributions);
}

export async function buildRecommendationsFromProviders(): Promise<Recommendation[]> {
  const contributions = await fetchProviderContributions();
  return buildDashboardRecommendations(contributions);
}

export async function buildAlertsFromProviders(): Promise<Alert[]> {
  const contributions = await fetchProviderContributions();
  return buildDashboardAlerts(contributions);
}

export async function buildTrendsFromProviders(): Promise<Trend[]> {
  const contributions = await fetchProviderContributions();
  return aggregateTrends(contributions);
}

export async function buildBusinessHealthFromProviders(): Promise<BusinessHealth> {
  const contributions = await fetchProviderContributions();
  return aggregateBusinessHealth(contributions);
}

export async function buildExecutiveTasksFromProviders(): Promise<ExecutiveTask[]> {
  const contributions = await fetchProviderContributions();
  return aggregateTasks(contributions);
}
