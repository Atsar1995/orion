import {
  buildCriticalChanges,
  buildPrioritiesFromTasks,
} from "@/lib/command-center/snapshot-view";
import { USER } from "@/lib/constants";
import type { DashboardSnapshot } from "@/types/intelligence";
import type {
  AiExecutiveSummary,
  BriefAlert,
  BriefEndSummary,
  BriefGreeting,
  BriefPriority,
  BriefView,
  ExecutiveRecommendation,
  HealthSnapshot,
  OvernightChange,
} from "@/types/executive";

const EXECUTIVE_FIRST_NAME = USER.name.split(" ")[0] ?? USER.name;

function buildGreetingPeriod(date: Date): string {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function formatBriefDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSyncTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapHealth(snapshot: DashboardSnapshot): HealthSnapshot {
  const { businessHealth } = snapshot;

  return {
    score: businessHealth.score,
    maxScore: businessHealth.maxScore,
    trend: businessHealth.trend,
    trendDirection: businessHealth.trend.startsWith("-") ? "down" : "up",
    status: businessHealth.status,
    summary: businessHealth.summary,
    domains: businessHealth.drivers.map((driver, index) => ({
      id: `domain-${index}`,
      label: driver.label,
      status: driver.status,
      summary: driver.label,
    })),
    explanationAvailable: true,
  };
}

function mapAlerts(snapshot: DashboardSnapshot): BriefAlert[] {
  return snapshot.alertPanel.critical.map((alert) => ({
    id: alert.id,
    severity: alert.severity === "critical" ? "critical" : "attention",
    message: alert.message,
    category: alert.category ?? "Operational",
  }));
}

function mapOvernightChanges(snapshot: DashboardSnapshot): OvernightChange[] {
  return snapshot.trends.slice(0, 3).map((trend) => ({
    id: trend.id,
    label: trend.label,
    value: `${trend.currentValue} (${trend.period})`,
    direction: trend.direction,
  }));
}

function mapRecommendations(snapshot: DashboardSnapshot): ExecutiveRecommendation[] {
  return snapshot.recommendations.map((recommendation) => ({
    id: recommendation.id,
    priority: recommendation.priority,
    priorityLabel: `Priority ${recommendation.priority}`,
    title: recommendation.title,
    description: recommendation.description,
    impact: recommendation.description,
    category: recommendation.category ?? "priority",
    evidence: [
      {
        id: `ev-${recommendation.id}`,
        type: "metric",
        source: "ORION Intelligence",
        label: recommendation.title,
      },
    ],
    confidence: { value: 85, label: "high" },
    actions: ["act", "delegate", "snooze", "explain"],
  }));
}

function mapPriorities(snapshot: DashboardSnapshot): BriefPriority[] {
  return buildPrioritiesFromTasks(snapshot.tasks).map((title, index) => ({
    id: `priority-${index + 1}`,
    rank: index + 1,
    title,
  }));
}

function mapAiSummary(snapshot: DashboardSnapshot): AiExecutiveSummary {
  const criticalChanges = buildCriticalChanges(snapshot);
  const narrative =
    criticalChanges.length > 0
      ? `${snapshot.brief.body} ${criticalChanges[0]}.`
      : snapshot.brief.body;

  return {
    narrative,
    sources: ["Finance", "Hospitality", "CRM", "Marketing"],
    confidence: { value: 88, label: "high" },
    generatedAt: snapshot.brief.generatedAt,
  };
}

function mapGreeting(snapshot: DashboardSnapshot): BriefGreeting {
  const generatedAt = new Date(snapshot.brief.generatedAt);

  return {
    period: buildGreetingPeriod(generatedAt),
    executiveName: EXECUTIVE_FIRST_NAME,
    headline: snapshot.brief.headline,
    subheadline: "Review priorities and act on the highest-impact item first.",
    dateLabel: formatBriefDate(generatedAt),
  };
}

function mapEndSummary(snapshot: DashboardSnapshot): BriefEndSummary {
  const topRecommendation = snapshot.recommendations[0];
  const topPriority = buildPrioritiesFromTasks(snapshot.tasks)[0];

  return {
    condition:
      snapshot.businessHealth.status === "healthy"
        ? "Healthy"
        : snapshot.businessHealth.status === "attention"
          ? "Stable"
          : "Under pressure",
    priority: topRecommendation?.title ?? topPriority ?? "No urgent items",
    firstAction: topRecommendation?.title ?? "Review Command Center",
  };
}

/**
 * Maps orchestrator DashboardSnapshot → EC-001 BriefView.
 * Used by future OrchestratorBriefRepository when wiring live integrations.
 */
export function mapDashboardSnapshotToBriefView(
  snapshot: DashboardSnapshot,
): BriefView {
  return {
    id: `brief-${snapshot.brief.generatedAt}`,
    generatedAt: snapshot.brief.generatedAt,
    lastSyncedAt: formatSyncTime(snapshot.brief.generatedAt),
    lifecycle: "fresh",
    greeting: mapGreeting(snapshot),
    businessHealth: mapHealth(snapshot),
    criticalAlerts: mapAlerts(snapshot),
    overnightChanges: mapOvernightChanges(snapshot),
    recommendations: mapRecommendations(snapshot),
    priorities: mapPriorities(snapshot),
    aiSummary: mapAiSummary(snapshot),
    endSummary: mapEndSummary(snapshot),
  };
}
