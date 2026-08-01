import { createAlertCenterSnapshot } from "@/lib/alerts/engine/AlertEngine";
import type { AlertCenterSnapshot } from "@/lib/alerts/models/Alert";
import type { DashboardState } from "@/lib/dashboard/DashboardState";
import type {
  DashboardAlertItemData,
  DashboardBusinessHealthData,
  DashboardConfidenceData,
  DashboardExecutiveNarrativeData,
  DashboardKPIItem,
  DashboardMorningBriefData,
  DashboardPrioritiesData,
  DashboardRecommendationItem,
} from "@/lib/dashboard/types";
import type { DashboardSnapshot } from "@/types/intelligence";

function mapHealthStatus(
  status: DashboardSnapshot["businessHealth"]["status"],
): DashboardBusinessHealthData["status"] {
  if (status === "critical") {
    return "critical";
  }

  if (status === "attention") {
    return "attention";
  }

  return "healthy";
}

function mapTrend(
  trend?: "up" | "down" | "neutral",
): DashboardKPIItem["trend"] {
  if (trend === "up") {
    return "up";
  }

  if (trend === "down") {
    return "down";
  }

  return "flat";
}

function mapAlertSeverity(
  severity: DashboardSnapshot["alerts"][number]["severity"],
): DashboardAlertItemData["severity"] {
  if (severity === "critical") {
    return "critical";
  }

  return "high";
}

function buildAlertCenter(snapshot: DashboardSnapshot): AlertCenterSnapshot {
  const signals = snapshot.alerts.map((alert, index) => ({
    id: alert.id,
    title: alert.message.slice(0, 64),
    message: alert.message,
    severity: alert.severity === "critical" ? ("critical" as const) : ("high" as const),
    category: (alert.category ?? "operational") as import("@/lib/alerts/models/AlertCategory").AlertCategory,
    source: "platform" as const,
    status: "active" as const,
    workspace: inferWorkspaceFromMessage(alert.message),
    dedupeKey: `dashboard-alert-${index + 1}`,
    createdAt: snapshot.brief.generatedAt,
  }));

  return createAlertCenterSnapshot({
    signals,
    generatedAt: snapshot.brief.generatedAt,
  });
}

function inferWorkspaceFromMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("guest") || normalized.includes("occupancy")) {
    return "Hospitality";
  }

  if (normalized.includes("pipeline") || normalized.includes("customer")) {
    return "CRM";
  }

  if (normalized.includes("revenue") || normalized.includes("finance")) {
    return "Finance";
  }

  if (normalized.includes("campaign") || normalized.includes("roas")) {
    return "Marketing";
  }

  return "Platform";
}

/** Maps orchestrator dashboard snapshot → EP-002 widget state (Mission S1C). */
export function mapSnapshotToDashboardState(snapshot: DashboardSnapshot): DashboardState {
  const generatedAt = snapshot.brief.generatedAt;

  const businessHealth: DashboardBusinessHealthData = {
    score: snapshot.businessHealth.score,
    maxScore: snapshot.businessHealth.maxScore,
    trend: snapshot.businessHealth.trend,
    status: mapHealthStatus(snapshot.businessHealth.status),
    summary: snapshot.businessHealth.summary,
    drivers: snapshot.businessHealth.drivers.map((driver) => ({
      label: driver.label,
      status: mapHealthStatus(driver.status),
    })),
  };

  const confidence: DashboardConfidenceData = {
    score: Math.min(snapshot.businessHealth.score / 100, 1),
    band: snapshot.businessHealth.score >= 80 ? "high" : snapshot.businessHealth.score >= 60 ? "medium" : "low",
    summary: "Signals aggregated from registered workspace providers.",
    factors: snapshot.businessHealth.drivers.map(
      (driver) => `${driver.label}: ${driver.status}`,
    ),
  };

  const morningBrief: DashboardMorningBriefData = {
    headline: snapshot.brief.headline,
    summary: snapshot.brief.body,
    keyPoints: snapshot.recommendations.slice(0, 3).map((item) => item.title),
    generatedAt,
    lifecycle: "fresh",
  };

  const narrative: DashboardExecutiveNarrativeData = {
    title: "Executive Narrative",
    focusArea: snapshot.recommendations[0]?.title ?? "Review platform priorities",
    paragraphs: [
      snapshot.brief.body,
      ...snapshot.trends.slice(0, 2).map(
        (trend) => `${trend.label} is ${trend.direction} at ${trend.currentValue} (${trend.period}).`,
      ),
    ],
  };

  const priorities: DashboardPrioritiesData = {
    items: snapshot.tasks.map((task, index) => ({
      id: task.id,
      rank: index + 1,
      title: task.title,
      workspace: inferWorkspaceFromMessage(task.title),
    })),
  };

  const kpis = {
    items: [
      snapshot.metrics.revenue,
      snapshot.metrics.occupancy,
      snapshot.metrics.customer,
      snapshot.metrics.marketing,
    ].map((metric) => ({
      id: metric.id,
      label: metric.label,
      value: metric.value,
      change: metric.change ?? "—",
      trend: mapTrend(metric.trend),
      workspace: metric.workspace,
    })),
  };

  const recommendations = {
    items: snapshot.recommendations.map((item) => ({
      id: item.id,
      priority: item.priority,
      title: item.title,
      description: item.description,
      workspace: inferWorkspaceFromMessage(item.title),
    })),
  };

  return {
    businessHealth,
    confidence,
    morningBrief,
    alertCenter: buildAlertCenter(snapshot),
    priorities,
    kpis,
    narrative,
    recommendations,
    generatedAt,
    sourceProviders: snapshot.businessHealth.drivers.map((driver) => driver.label),
    lastUpdatedAt: generatedAt,
  };
}
