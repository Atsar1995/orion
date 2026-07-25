import { buildAlertPanelSnapshot, buildDashboardAlerts } from "@/lib/intelligence/alerts/AlertEngine";
import { buildExecutiveBriefForDashboard } from "@/lib/intelligence/brief/ExecutiveBriefEngine";
import { buildDashboardRecommendations } from "@/lib/intelligence/recommendations/RecommendationEngine";
import { providerManager } from "@/lib/providers/ProviderManager";
import type {
  DashboardDataProvider,
  ProviderDashboardContribution,
} from "@/types/providers";
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

function isDashboardDataProvider(provider: unknown): provider is DashboardDataProvider {
  return (
    typeof provider === "object" &&
    provider !== null &&
    "fetchDashboardContribution" in provider &&
    typeof (provider as DashboardDataProvider).fetchDashboardContribution === "function"
  );
}

export async function fetchProviderContributions(): Promise<ProviderDashboardContribution[]> {
  await providerManager.connectAll();

  const providers = providerManager
    .getAllProviders()
    .filter(isDashboardDataProvider);

  const results = await Promise.all(
    providers.map((provider) => provider.fetchDashboardContribution()),
  );

  return results
    .filter((result) => result.success && result.data)
    .map((result) => result.data as ProviderDashboardContribution);
}

function aggregateTrends(contributions: ProviderDashboardContribution[]): Trend[] {
  const seen = new Set<string>();
  return contributions
    .flatMap((item) => item.trends ?? [])
    .filter((trend) => {
      if (seen.has(trend.id)) {
        return false;
      }

      seen.add(trend.id);
      return true;
    });
}

function aggregateTasks(contributions: ProviderDashboardContribution[]): ExecutiveTask[] {
  const seen = new Set<string>();
  return contributions
    .flatMap((item) => item.tasks ?? [])
    .filter((task) => {
      if (seen.has(task.id)) {
        return false;
      }

      seen.add(task.id);
      return true;
    });
}

function aggregateMetrics(
  contributions: ProviderDashboardContribution[],
): ExecutiveMetricsBundle {
  const byWorkspace = new Map<string, ProviderDashboardContribution>();

  for (const contribution of contributions) {
    if (contribution.metric?.workspace) {
      byWorkspace.set(contribution.metric.workspace, contribution);
    }
  }

  const finance = byWorkspace.get("Finance")?.metric;
  const hospitality = byWorkspace.get("Hospitality")?.metric;
  const crm = byWorkspace.get("CRM")?.metric;
  const marketing = byWorkspace.get("Marketing")?.metric;

  if (!finance || !hospitality || !crm || !marketing) {
    throw new Error("Dashboard metrics incomplete — required workspace providers missing");
  }

  return {
    revenue: finance,
    occupancy: hospitality,
    customer: crm,
    marketing,
  };
}

function aggregateBusinessHealth(
  contributions: ProviderDashboardContribution[],
): BusinessHealth {
  const drivers = contributions
    .map((item) => item.healthDriver)
    .filter((driver): driver is NonNullable<typeof driver> => Boolean(driver));

  const healthyCount = drivers.filter((driver) => driver.status === "healthy").length;
  const score = drivers.length
    ? Math.round((healthyCount / drivers.length) * 100)
    : 0;

  const status =
    score >= 85 ? "healthy" : score >= 65 ? ("attention" as const) : ("critical" as const);

  return {
    score,
    maxScore: 100,
    trend: "+3",
    status,
    summary: "Platform health aggregated from registered workspace providers.",
    drivers,
  };
}

export async function buildDashboardSnapshotFromProviders(): Promise<DashboardSnapshot> {
  const contributions = await fetchProviderContributions();
  const alertPanel = await buildAlertPanelSnapshot();

  return {
    businessHealth: aggregateBusinessHealth(contributions),
    metrics: aggregateMetrics(contributions),
    brief: await buildExecutiveBriefForDashboard(),
    recommendations: await buildDashboardRecommendations(),
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
  return buildExecutiveBriefForDashboard();
}

export async function buildRecommendationsFromProviders(): Promise<Recommendation[]> {
  return buildDashboardRecommendations();
}

export async function buildAlertsFromProviders(): Promise<Alert[]> {
  return buildDashboardAlerts();
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
