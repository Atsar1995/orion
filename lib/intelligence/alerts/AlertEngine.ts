import { evaluateAlertContext } from "@/lib/intelligence/alerts/AlertEvaluator";
import { alertDispatcher } from "@/lib/intelligence/alerts/AlertDispatcher";
import { alertHistory } from "@/lib/intelligence/alerts/AlertHistory";
import {
  buildAlertBundle as assembleAlertBundle,
  deduplicateAlerts,
  escalateUnresolvedAlerts,
} from "@/lib/intelligence/alerts/AlertPrioritizer";
import {
  aggregateBusinessHealth,
  aggregateMetrics,
  aggregateTrends,
} from "@/lib/intelligence/shared/provider-aggregation";
import { fetchProviderContributions } from "@/lib/providers/provider-data";
import type {
  Alert,
  AlertBundle,
  AlertEvaluationContext,
  AlertPanelSnapshot,
} from "@/types/alerts";
import type { Alert as DashboardAlert } from "@/types/intelligence";
import type { ProviderDashboardContribution } from "@/types/providers";

function buildAlertEvaluationContextFromContributions(
  contributions: ProviderDashboardContribution[],
): AlertEvaluationContext {
  return {
    contributions,
    trends: aggregateTrends(contributions),
    metrics: aggregateMetrics(contributions),
    businessHealth: aggregateBusinessHealth(contributions),
  };
}

async function buildAlertEvaluationContext(): Promise<AlertEvaluationContext> {
  const contributions = await fetchProviderContributions();
  return buildAlertEvaluationContextFromContributions(contributions);
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

function generateAlertBundleFromContext(
  context: AlertEvaluationContext,
  generatedAt: string,
): AlertBundle {
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

/**
 * Alert & Event Engine (ES-030 · Sprint 4).
 *
 * Evaluates provider events against configuration-driven rules,
 * deduplicates, escalates, groups, and maintains alert history.
 */
export class AlertEngine {
  async buildContext(
    contributions?: ProviderDashboardContribution[],
  ): Promise<AlertEvaluationContext> {
    if (contributions) {
      return buildAlertEvaluationContextFromContributions(contributions);
    }

    return buildAlertEvaluationContext();
  }

  async generateAlertBundle(
    contributions?: ProviderDashboardContribution[],
  ): Promise<AlertBundle> {
    const generatedAt = new Date().toISOString();
    const context = await this.buildContext(contributions);
    return generateAlertBundleFromContext(context, generatedAt);
  }

  async getActiveAlerts(
    contributions?: ProviderDashboardContribution[],
  ): Promise<Alert[]> {
    const bundle = await this.generateAlertBundle(contributions);
    return bundle.active;
  }

  async getAlertPanelSnapshot(
    contributions?: ProviderDashboardContribution[],
  ): Promise<AlertPanelSnapshot> {
    const bundle = await this.generateAlertBundle(contributions);

    return {
      critical: bundle.critical.map(toDashboardAlert),
      recent: bundle.recent.map(toDashboardAlert),
      resolved: bundle.resolved.map(toDashboardAlert),
      counts: bundle.counts,
    };
  }
}

export const alertEngine = new AlertEngine();

export async function buildAlertBundle(
  contributions?: ProviderDashboardContribution[],
): Promise<AlertBundle> {
  return alertEngine.generateAlertBundle(contributions);
}

export async function buildDashboardAlerts(
  contributions?: ProviderDashboardContribution[],
): Promise<DashboardAlert[]> {
  const bundle = await buildAlertBundle(contributions);
  return bundle.active.map(toDashboardAlert);
}

export async function buildAlertPanelSnapshot(
  contributions?: ProviderDashboardContribution[],
): Promise<AlertPanelSnapshot> {
  return alertEngine.getAlertPanelSnapshot(contributions);
}

export async function getAlertEvaluationContext(
  contributions?: ProviderDashboardContribution[],
): Promise<AlertEvaluationContext> {
  return alertEngine.buildContext(contributions);
}

export function buildDashboardAlertsFromContributions(
  contributions: ProviderDashboardContribution[],
): DashboardAlert[] {
  const context = buildAlertEvaluationContextFromContributions(contributions);
  return evaluateAlertContext(context).map(toDashboardAlert);
}
