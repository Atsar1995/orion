import "@/lib/intelligence/register-executive-providers";

import { USER } from "@/lib/constants";
import { DEMO_ORGANIZATION } from "@/lib/identity/data/demo-organizations";
import {
  mapCrmBriefAlerts,
  mapCrmBriefExecutiveSummary,
  mapCrmBriefOvernightChanges,
  mapCrmBriefRecommendations,
} from "@/lib/crm/mappers/brief-contribution";
import { crmService, defaultCrmRepository } from "@/lib/crm";
import {
  aggregateHealth,
  aggregateRecommendations,
  getProviders,
} from "@/lib/intelligence/provider-registry";
import {
  calculateImpactScore,
  mapRecommendationPriority,
  rankByImpact,
} from "@/lib/intelligence/brief/ExecutiveBriefPrioritizer";
import type { ExecutiveRecommendation as PlatformRecommendation } from "@/lib/intelligence/models";
import type { BriefSource, ExecutiveInsight } from "@/types/brief";
import type {
  AiExecutiveSummary,
  BriefAlert,
  BriefEndSummary,
  BriefGreeting,
  BriefPriority,
  BriefView,
  ExecutiveRecommendation,
  OvernightChange,
} from "@/types/executive";

function resolveExecutiveFirstName(executiveName?: string): string {
  const fullName = executiveName?.trim() || USER.name;
  return fullName.split(" ")[0] ?? fullName;
}

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

function formatSyncTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapFinanceRecommendationToBrief(
  recommendation: PlatformRecommendation,
  index: number,
): ExecutiveRecommendation {
  return {
    id: `finance-rec-${recommendation.priority}-${index}`,
    priority: recommendation.priority,
    priorityLabel: `Priority ${recommendation.priority}`,
    title: recommendation.title,
    description: recommendation.description,
    impact: recommendation.description,
    category: recommendation.category ?? "executive",
    evidence: [
      {
        id: `finance-ev-${index}`,
        type: "metric",
        source: "Finance Executive Provider",
        label: recommendation.title,
      },
    ],
    confidence: { value: 80, label: "high" },
    actions: ["act", "delegate", "snooze", "explain"],
    href: "/finance",
  };
}

function recommendationToInsight(
  recommendation: ExecutiveRecommendation,
  source: BriefSource,
): ExecutiveInsight {
  return {
    id: recommendation.id,
    title: recommendation.title,
    content: recommendation.description,
    category: source === "crm" ? "customer" : "finance",
    priority: mapRecommendationPriority(recommendation.priority),
    severity: recommendation.category === "risk" ? "attention" : "healthy",
    source,
    impactScore: calculateImpactScore(mapRecommendationPriority(recommendation.priority)),
    dedupeKey: `${source}:${recommendation.id}`,
  };
}

function mergeRecommendations(intelligence: ReturnType<typeof crmService.getIntelligence>): ExecutiveRecommendation[] {
  const financeProvider = getProviders().find((provider) => provider.id === "finance");
  const crmRecommendations = mapCrmBriefRecommendations(intelligence);
  const financeRecommendations =
    financeProvider?.getRecommendations().map((item, index) =>
      mapFinanceRecommendationToBrief(item, index),
    ) ?? [];

  const recommendationLookup = new Map<string, ExecutiveRecommendation>(
    [...crmRecommendations, ...financeRecommendations].map((item) => [item.id, item]),
  );

  const insights = [
    ...crmRecommendations.map((item) => recommendationToInsight(item, "crm")),
    ...financeRecommendations.map((item) => recommendationToInsight(item, "finance")),
  ];

  return rankByImpact(insights)
    .map((insight) => recommendationLookup.get(insight.id))
    .filter((item): item is ExecutiveRecommendation => item !== undefined);
}

function mergeAlerts(intelligence: ReturnType<typeof crmService.getIntelligence>): BriefAlert[] {
  const crmAlerts = mapCrmBriefAlerts(defaultCrmRepository, intelligence);
  const bundle = aggregateRecommendations();

  const platformAlerts: BriefAlert[] = bundle.criticalAlerts.map((alert, index) => ({
    id: `platform-alert-${index + 1}`,
    severity: alert.severity === "critical" ? "critical" : "attention",
    message: alert.message,
    category: alert.category ?? "Platform",
  }));

  const seen = new Set<string>();

  return [...crmAlerts, ...platformAlerts].filter((alert) => {
    const key = alert.message.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function mapPriorities(): BriefPriority[] {
  const bundle = aggregateRecommendations();

  return bundle.priorities.map((priority, index) => ({
    id: `priority-${priority.rank}-${index}`,
    rank: priority.rank,
    title: priority.title,
    href:
      priority.title.toLowerCase().includes("retail") ||
      priority.title.toLowerCase().includes("customer")
        ? "/crm/customers"
        : priority.title.toLowerCase().includes("pipeline") ||
            priority.title.toLowerCase().includes("forecast")
          ? "/crm/opportunities"
          : undefined,
  }));
}

/**
 * Maps Intelligence Bus provider outputs → EC-001 BriefView.
 * CRM contributes via crmExecutiveProvider and brief-contribution mappers (Mission 16A.7).
 */
export function mapIntelligenceBusToBriefView(executiveName?: string): BriefView {
  const generatedAt = new Date();
  const executiveFirstName = resolveExecutiveFirstName(executiveName);
  const intelligence = crmService.getIntelligence();
  const platformHealth = aggregateHealth();
  const recommendations = mergeRecommendations(intelligence);
  const alerts = mergeAlerts(intelligence);
  const overnightChanges: OvernightChange[] = mapCrmBriefOvernightChanges(intelligence);
  const priorities = mapPriorities();
  const executiveSummary = mapCrmBriefExecutiveSummary(intelligence);
  const providers = getProviders();

  const greeting: BriefGreeting = {
    period: buildGreetingPeriod(generatedAt),
    executiveName: executiveFirstName,
    headline: "Morning Executive Brief",
    subheadline: executiveSummary,
    dateLabel: formatBriefDate(generatedAt),
    organizationName: DEMO_ORGANIZATION.name,
    profileLabel: "Executive",
    operatingMode: "standard",
  };

  const aiSummary: AiExecutiveSummary = {
    narrative: [executiveSummary, ...providers.map((provider) => provider.getBriefingLine())].join(
      " ",
    ),
    sources: providers.map((provider) => provider.workspace),
    confidence: { value: 86, label: "high" },
    generatedAt: generatedAt.toISOString(),
  };

  const endSummary: BriefEndSummary = {
    condition:
      platformHealth.platformStatus === "healthy"
        ? "Healthy"
        : platformHealth.platformStatus === "attention"
          ? "Stable"
          : "Under pressure",
    priority: recommendations[0]?.title ?? priorities[0]?.title ?? "Review CRM insights",
    firstAction: recommendations[0]?.title ?? "Open CRM insights",
  };

  return {
    id: `brief-${generatedAt.toISOString()}`,
    generatedAt: generatedAt.toISOString(),
    lastSyncedAt: formatSyncTime(generatedAt),
    lifecycle: "fresh",
    greeting,
    businessHealth: {
      score: platformHealth.platformScore,
      maxScore: 100,
      trend: intelligence.signals.customerHealthScore.trend,
      trendDirection: intelligence.signals.customerHealthScore.trend.startsWith("-")
        ? "down"
        : "up",
      status: platformHealth.platformStatus,
      summary: platformHealth.summary,
      domains: platformHealth.workspaceHealth.map((entry) => ({
        id: entry.workspaceId,
        label: entry.workspaceLabel,
        status: entry.health.status,
        summary: entry.health.summary,
        href: entry.workspaceId === "crm" ? "/crm/insights" : `/${entry.workspaceId}`,
      })),
      explanationAvailable: true,
      majorRisks: [],
      majorOpportunities: [],
    },
    criticalAlerts: alerts,
    overnightChanges,
    recommendations,
    priorities,
    priorityDecisions: [],
    executiveDecisions: {
      pending: [],
      delegated: [],
      awaitingReview: [],
      recentlyCompleted: [],
    },
    crossWorkspaceSignals: [],
    executiveMemory: [],
    businessTrends: [],
    morningSummary: {
      todaySummary: "",
      criticalDecisions: [],
      businessHealthHeadline: platformHealth.summary,
      priorityActions: [],
      executiveNotes: [],
    },
    aiSummary,
    endSummary,
  };
}
