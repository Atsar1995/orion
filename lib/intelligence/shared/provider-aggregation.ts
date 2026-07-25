import type { ProviderDashboardContribution } from "@/types/providers";
import type {
  BusinessHealth,
  ExecutiveMetricsBundle,
  ExecutiveTask,
  Trend,
} from "@/types/intelligence";

export function normalizeContributions(
  contributions: ProviderDashboardContribution[],
): ProviderDashboardContribution[] {
  const byProvider = new Map<string, ProviderDashboardContribution>();

  for (const contribution of contributions) {
    byProvider.set(contribution.providerId, contribution);
  }

  return Array.from(byProvider.values());
}

export function aggregateTrends(contributions: ProviderDashboardContribution[]): Trend[] {
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

export function aggregateTasks(contributions: ProviderDashboardContribution[]): ExecutiveTask[] {
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

export function aggregateMetrics(
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

export function aggregateBusinessHealth(
  contributions: ProviderDashboardContribution[],
): BusinessHealth {
  const drivers = contributions
    .map((item) => item.healthDriver)
    .filter((driver): driver is NonNullable<typeof driver> => Boolean(driver));

  const healthyCount = drivers.filter((driver) => driver.status === "healthy").length;
  const score = drivers.length ? Math.round((healthyCount / drivers.length) * 100) : 0;
  const status: BusinessHealth["status"] =
    score >= 85 ? "healthy" : score >= 65 ? "attention" : "critical";

  return {
    score,
    maxScore: 100,
    trend: "+3",
    status,
    summary: "Platform health aggregated from registered workspace providers.",
    drivers,
  };
}
