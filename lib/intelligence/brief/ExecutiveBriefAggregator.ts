import {
  calculateImpactScore,
  mapAlertSeverityToPriority,
  mapRecommendationPriority,
} from "@/lib/intelligence/brief/ExecutiveBriefPrioritizer";
import type { ProviderDashboardContribution } from "@/types/providers";
import type {
  BriefCategory,
  BriefSource,
  ExecutiveAction,
  ExecutiveInsight,
} from "@/types/brief";
import type { BusinessHealth } from "@/types/intelligence";

function resolveSource(providerId: string): BriefSource {
  const sources: Record<string, BriefSource> = {
    crm: "crm",
    finance: "finance",
    marketing: "marketing",
    hospitality: "hospitality",
    commerce: "commerce",
    calendar: "calendar",
    email: "email",
  };

  return sources[providerId] ?? "platform";
}

function metricInsight(
  contribution: ProviderDashboardContribution,
  category: BriefCategory,
  title: string,
): ExecutiveInsight | undefined {
  if (!contribution.metric) {
    return undefined;
  }

  const source = resolveSource(contribution.providerId);
  const priority =
    contribution.metric.trend === "down" ? ("high" as const) : ("medium" as const);

  return {
    id: `metric-${contribution.providerId}`,
    title,
    content: `${contribution.metric.label}: ${contribution.metric.value}${
      contribution.metric.change ? ` (${contribution.metric.change})` : ""
    }`,
    category,
    priority,
    severity: contribution.metric.trend === "down" ? "attention" : "healthy",
    source,
    impactScore: calculateImpactScore(priority, undefined, contribution.metric.change),
    dedupeKey: `metric:${contribution.providerId}`,
  };
}

function collectContributionInsights(
  contribution: ProviderDashboardContribution,
): ExecutiveInsight[] {
  const source = resolveSource(contribution.providerId);
  const insights: ExecutiveInsight[] = [];

  for (const segment of contribution.briefSegments ?? []) {
    const category: BriefCategory =
      contribution.workspace === "Finance"
        ? "finance"
        : contribution.workspace === "CRM"
          ? "customer"
          : contribution.workspace === "Marketing"
            ? "marketing"
            : contribution.workspace === "Hospitality"
              ? "operations"
              : "key-highlights";

    insights.push({
      id: `segment-${contribution.providerId}-${insights.length}`,
      title: contribution.workspace ?? "Platform",
      content: segment,
      category,
      priority: "medium",
      severity: "info",
      source,
      impactScore: calculateImpactScore("medium", "info"),
      dedupeKey: `segment:${source}:${segment}`,
    });
  }

  for (const alert of contribution.alerts ?? []) {
    const priority = mapAlertSeverityToPriority(alert.severity);

    insights.push({
      id: alert.id,
      title: alert.message,
      content: alert.message,
      category: "critical-issues",
      priority,
      severity: alert.severity === "critical" ? "critical" : "attention",
      source,
      impactScore: calculateImpactScore(
        priority,
        alert.severity === "critical" ? "critical" : "attention",
      ),
      dedupeKey: `alert:${alert.id}`,
    });
  }

  for (const recommendation of contribution.recommendations ?? []) {
    const priority = mapRecommendationPriority(recommendation.priority);
    const category: BriefCategory =
      recommendation.category === "growth" ? "opportunities" : "opportunities";

    insights.push({
      id: recommendation.id,
      title: recommendation.title,
      content: recommendation.description,
      category,
      priority,
      severity: recommendation.category === "risk" ? "attention" : "info",
      source,
      impactScore: calculateImpactScore(
        priority,
        recommendation.category === "risk" ? "attention" : "info",
      ),
      dedupeKey: `rec:${recommendation.id}`,
    });
  }

  for (const task of contribution.tasks ?? []) {
    insights.push({
      id: task.id,
      title: task.title,
      content: task.title,
      category: "priorities",
      priority: "high",
      severity: "info",
      source,
      impactScore: calculateImpactScore("high", "info"),
      dedupeKey: `task:${task.id}`,
    });
  }

  const workspaceMetricMap: Array<[string, BriefCategory, string]> = [
    ["Finance", "revenue", "Revenue Performance"],
    ["Finance", "finance", "Finance Overview"],
    ["CRM", "customer", "Customer Performance"],
    ["Marketing", "marketing", "Marketing Performance"],
    ["Hospitality", "operations", "Operations Performance"],
  ];

  for (const [workspace, category, title] of workspaceMetricMap) {
    if (contribution.workspace !== workspace) {
      continue;
    }

    const insight = metricInsight(contribution, category, title);

    if (insight) {
      insights.push(insight);
    }
  }

  return insights;
}

function buildPlatformSummaryInsight(health: BusinessHealth): ExecutiveInsight {
  const priority: ExecutiveInsight["priority"] =
    health.status === "critical"
      ? "critical"
      : health.status === "attention"
        ? "high"
        : "medium";

  return {
    id: "platform-health-summary",
    title: "Platform Health",
    content: `${health.summary} Score: ${health.score}/${health.maxScore} (${health.trend}).`,
    category: "executive-summary",
    priority,
    severity: health.status === "healthy" ? "healthy" : health.status,
    source: "platform",
    impactScore: calculateImpactScore(priority, health.status === "healthy" ? "healthy" : health.status),
    dedupeKey: "platform:health-summary",
  };
}

function buildRecommendedActions(insights: ExecutiveInsight[]): ExecutiveAction[] {
  return insights
    .filter(
      (insight) =>
        insight.category === "opportunities" ||
        insight.category === "critical-issues" ||
        insight.category === "priorities",
    )
    .slice(0, 6)
    .map((insight) => ({
      id: `action-${insight.id}`,
      title: insight.title,
      description: insight.content,
      priority: insight.priority,
      source: insight.source,
      category: "actions",
    }));
}

/** Collects raw insights from provider contributions and platform health. */
export function collectInsights(
  contributions: ProviderDashboardContribution[],
  health: BusinessHealth,
): { insights: ExecutiveInsight[]; actions: ExecutiveAction[] } {
  const providerInsights = contributions.flatMap(collectContributionInsights);
  const insights = [buildPlatformSummaryInsight(health), ...providerInsights];

  return {
    insights,
    actions: buildRecommendedActions(providerInsights),
  };
}
