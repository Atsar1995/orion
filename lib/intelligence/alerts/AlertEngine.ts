import { evaluateAlertContext } from "@/lib/intelligence/alerts/AlertEvaluator";
import { alertDispatcher } from "@/lib/intelligence/alerts/AlertDispatcher";
import { alertHistory } from "@/lib/intelligence/alerts/AlertHistory";
import {
  buildAlertBundle as assembleAlertBundle,
  deduplicateAlerts,
  escalateUnresolvedAlerts,
} from "@/lib/intelligence/alerts/AlertPrioritizer";
import { fetchProviderContributions } from "@/lib/providers/dashboard-aggregator";
import type {
  Alert,
  AlertBundle,
  AlertEvaluationContext,
  AlertPanelSnapshot,
} from "@/types/alerts";
import type { Alert as DashboardAlert, BusinessHealth } from "@/types/intelligence";

function aggregateBusinessHealth(
  contributions: Awaited<ReturnType<typeof fetchProviderContributions>>,
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

function aggregateMetrics(contributions: Awaited<ReturnType<typeof fetchProviderContributions>>) {
  const byWorkspace = new Map<string, (typeof contributions)[number]>();

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

  return { revenue: finance, occupancy: hospitality, customer: crm, marketing };
}

function aggregateTrends(contributions: Awaited<ReturnType<typeof fetchProviderContributions>>) {
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

async function buildAlertEvaluationContext(): Promise<AlertEvaluationContext> {
  const contributions = await fetchProviderContributions();

  return {
    contributions,
    trends: aggregateTrends(contributions),
    metrics: aggregateMetrics(contributions),
    businessHealth: aggregateBusinessHealth(contributions),
  };
}

function mapSeverityToDashboard(severity: Alert["severity"]): DashboardAlert["severity"] {
  if (severity === "critical") {
    return "critical";
  }

  if (severity === "high" || severity === "medium") {
    return "attention";
  }

  return "healthy";
}

function mapCategoryToDashboard(category: Alert["category"]): DashboardAlert["category"] {
  const map: Partial<Record<Alert["category"], DashboardAlert["category"]>> = {
    revenue: "risk",
    finance: "follow-up",
    operations: "operational",
    hospitality: "operational",
    crm: "risk",
    marketing: "opportunity",
    commerce: "operational",
    compliance: "follow-up",
    infrastructure: "risk",
    security: "risk",
  };

  return map[category] ?? "operational";
}

export function toDashboardAlert(alert: Alert): DashboardAlert {
  return {
    id: alert.id,
    severity: mapSeverityToDashboard(alert.severity),
    message: alert.message,
    category: mapCategoryToDashboard(alert.category),
  };
}

/**
 * Alert & Event Engine (ES-030 · Sprint 4).
 *
 * Evaluates provider events against configuration-driven rules,
 * deduplicates, escalates, groups, and maintains alert history.
 */
export class AlertEngine {
  async buildContext(): Promise<AlertEvaluationContext> {
    return buildAlertEvaluationContext();
  }

  async generateAlertBundle(): Promise<AlertBundle> {
    const generatedAt = new Date().toISOString();
    const context = await this.buildContext();
    const evaluated = evaluateAlertContext(context);
    const deduped = deduplicateAlerts(evaluated);
    const withNotifications = alertDispatcher.attachNotifications(deduped);
    const escalated = escalateUnresolvedAlerts(withNotifications);

    for (const alert of escalated) {
      alertHistory.record(alert);
    }

    const resolved = alertHistory.getResolved();
    return assembleAlertBundle(escalated, resolved, generatedAt);
  }

  async getActiveAlerts(): Promise<Alert[]> {
    const bundle = await this.generateAlertBundle();
    return bundle.active;
  }

  async getAlertPanelSnapshot(): Promise<AlertPanelSnapshot> {
    const bundle = await this.generateAlertBundle();

    return {
      critical: bundle.critical.map(toDashboardAlert),
      recent: bundle.recent.map(toDashboardAlert),
      resolved: bundle.resolved.map(toDashboardAlert),
      counts: bundle.counts,
    };
  }
}

export const alertEngine = new AlertEngine();

export async function buildAlertBundle(): Promise<AlertBundle> {
  return alertEngine.generateAlertBundle();
}

export async function buildDashboardAlerts(): Promise<DashboardAlert[]> {
  const bundle = await buildAlertBundle();
  return bundle.active.map(toDashboardAlert);
}

export async function buildAlertPanelSnapshot(): Promise<AlertPanelSnapshot> {
  return alertEngine.getAlertPanelSnapshot();
}

export async function getAlertEvaluationContext(): Promise<AlertEvaluationContext> {
  return alertEngine.buildContext();
}
