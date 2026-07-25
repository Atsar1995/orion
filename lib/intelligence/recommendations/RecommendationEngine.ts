import { buildDashboardAlerts } from "@/lib/intelligence/alerts/AlertEngine";
import { executiveBriefEngine } from "@/lib/intelligence/brief/ExecutiveBriefEngine";
import { mapLegacyCategory, mapProviderIdToCategory } from "@/lib/intelligence/recommendations/RecommendationCategories";
import {
  deduplicateRecommendations,
  rankRecommendations,
  selectTopRecommendations,
} from "@/lib/intelligence/recommendations/RecommendationPrioritizer";
import { evaluateAllRules } from "@/lib/intelligence/recommendations/RecommendationRules";
import { applyScores, priorityToLegacyRank } from "@/lib/intelligence/recommendations/RecommendationScoring";
import { buildRecommendationFromTemplate } from "@/lib/intelligence/recommendations/RecommendationTemplates";
import {
  fetchProviderContributions,
} from "@/lib/providers/dashboard-aggregator";
import type {
  Recommendation,
  RecommendationBundle,
  RecommendationContext,
  RecommendationEvidence,
  RecommendationPriority,
} from "@/types/recommendations";
import type { Recommendation as DashboardRecommendation, BusinessHealth } from "@/types/intelligence";

function aggregateBusinessHealth(
  contributions: Awaited<ReturnType<typeof fetchProviderContributions>>,
) {
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

function mapLegacyPriority(priority: number): RecommendationPriority {
  if (priority === 1) {
    return "critical";
  }

  if (priority === 2) {
    return "high";
  }

  if (priority === 3) {
    return "medium";
  }

  return "low";
}

function buildEvidenceFromContext(
  recommendation: Recommendation,
  context: RecommendationContext,
): RecommendationEvidence[] {
  const evidence: RecommendationEvidence[] = [];
  const timestamp = recommendation.generatedAt;
  const titleKey = recommendation.title.toLowerCase();

  for (const alert of context.alerts) {
    const alertKey = alert.message.toLowerCase();
    if (titleKey.includes("guest") && alertKey.includes("guest")) {
      evidence.push({
        id: `evidence-alert-${alert.id}`,
        label: "Alert",
        value: alert.message,
        source: "alert",
        capturedAt: timestamp,
      });
    }

    if (titleKey.includes("payment") && alertKey.includes("payment")) {
      evidence.push({
        id: `evidence-alert-${alert.id}`,
        label: "Alert",
        value: alert.message,
        source: "alert",
        capturedAt: timestamp,
      });
    }

    if (titleKey.includes("contract") && alertKey.includes("contract")) {
      evidence.push({
        id: `evidence-alert-${alert.id}`,
        label: "Alert",
        value: alert.message,
        source: "alert",
        capturedAt: timestamp,
      });
    }

    if (titleKey.includes("occupancy") && alertKey.includes("occupancy")) {
      evidence.push({
        id: `evidence-alert-${alert.id}`,
        label: "Alert",
        value: alert.message,
        source: "alert",
        capturedAt: timestamp,
      });
    }
  }

  for (const trend of context.trends) {
    if (recommendation.category === "marketing" && trend.workspace === "Marketing") {
      evidence.push({
        id: `evidence-trend-${trend.id}`,
        label: trend.label,
        value: `${trend.currentValue} vs ${trend.previousValue} (${trend.period})`,
        source: "trend",
        capturedAt: timestamp,
      });
    }

    if (recommendation.category === "sales" && trend.workspace === "CRM") {
      evidence.push({
        id: `evidence-trend-${trend.id}`,
        label: trend.label,
        value: `${trend.currentValue} vs ${trend.previousValue} (${trend.period})`,
        source: "trend",
        capturedAt: timestamp,
      });
    }

    if (recommendation.category === "revenue" && trend.workspace === "Finance") {
      evidence.push({
        id: `evidence-trend-${trend.id}`,
        label: trend.label,
        value: `${trend.currentValue} vs ${trend.previousValue} (${trend.period})`,
        source: "trend",
        capturedAt: timestamp,
      });
    }
  }

  if (context.businessHealth.status !== "healthy") {
    evidence.push({
      id: "evidence-health-platform",
      label: "Platform Health",
      value: `${context.businessHealth.score}/${context.businessHealth.maxScore} (${context.businessHealth.status})`,
      source: "health",
      capturedAt: timestamp,
    });
  }

  for (const contribution of context.contributions) {
    for (const providerRec of contribution.recommendations ?? []) {
      if (providerRec.title === recommendation.title) {
        evidence.push({
          id: `evidence-provider-${providerRec.id}`,
          label: contribution.workspace ?? contribution.providerId,
          value: providerRec.description,
          source: "provider",
          capturedAt: timestamp,
        });
      }
    }

    if (contribution.metric && mapProviderIdToCategory(contribution.providerId) === recommendation.category) {
      evidence.push({
        id: `evidence-metric-${contribution.providerId}`,
        label: contribution.metric.label,
        value: `${contribution.metric.value}${contribution.metric.change ? ` (${contribution.metric.change})` : ""}`,
        source: "provider",
        capturedAt: timestamp,
      });
    }
  }

  return evidence;
}

function buildFromProviderRecommendations(
  context: RecommendationContext,
  generatedAt: string,
): Recommendation[] {
  return context.contributions.flatMap((contribution) =>
    (contribution.recommendations ?? []).map((providerRec) => {
      const priority = mapLegacyPriority(providerRec.priority);
      const category = mapLegacyCategory(providerRec.category, contribution.workspace);

      const base: Recommendation = {
        id: providerRec.id,
        title: providerRec.title,
        summary: providerRec.description,
        businessReason: providerRec.description,
        evidence: [],
        expectedBenefit: "Improve operational and financial outcomes based on provider signal.",
        estimatedImpact: {
          magnitude: priority === "critical" || priority === "high" ? "high" : "medium",
        },
        priority,
        category,
        confidenceScore: 0,
        suggestedActions: [
          {
            id: `${providerRec.id}-action-0`,
            label: providerRec.title,
            description: providerRec.description,
            priority,
          },
        ],
        source: "provider",
        score: { businessValue: 0, confidence: 0, urgency: 0, total: 0 },
        generatedAt,
      };

      return applyScores(base, buildEvidenceFromContext(base, context));
    }),
  );
}

function buildFromRules(context: RecommendationContext, generatedAt: string): Recommendation[] {
  const matchedRules = evaluateAllRules(context);

  return matchedRules
    .map((rule) => {
      const recommendation = buildRecommendationFromTemplate(rule.templateId, {
        id: `rec-rule-${rule.id}`,
        category: rule.category,
        priority: rule.priority,
        source: "rule",
        generatedAt,
      });

      if (!recommendation) {
        return undefined;
      }

      return applyScores(recommendation, buildEvidenceFromContext(recommendation, context));
    })
    .filter((item): item is Recommendation => Boolean(item));
}

async function buildRecommendationContext(): Promise<RecommendationContext> {
  const contributions = await fetchProviderContributions();

  return {
    contributions,
    businessHealth: aggregateBusinessHealth(contributions),
    alerts: await buildDashboardAlerts(),
    trends: aggregateTrends(contributions),
    metrics: aggregateMetrics(contributions),
    dailyBrief: await executiveBriefEngine.generateDailyBrief(),
  };
}

/**
 * Recommendation Engine (ES-029 · Sprint 4).
 *
 * Consumes intelligence service outputs and provider signals,
 * evaluates configuration-driven rules, and returns ranked recommendations.
 */
export class RecommendationEngine {
  async buildContext(): Promise<RecommendationContext> {
    return buildRecommendationContext();
  }

  async generateRecommendations(limit = 6): Promise<RecommendationBundle> {
    const generatedAt = new Date().toISOString();
    const context = await this.buildContext();

    const fromRules = buildFromRules(context, generatedAt);
    const fromProviders = buildFromProviderRecommendations(context, generatedAt);
    const merged = deduplicateRecommendations([...fromRules, ...fromProviders]);
    const scored = merged.map((rec) =>
      applyScores(rec, buildEvidenceFromContext(rec, context)),
    );
    const ranked = rankRecommendations(scored);

    return {
      generatedAt,
      recommendations: selectTopRecommendations(ranked, limit),
    };
  }
}

export const recommendationEngine = new RecommendationEngine();

export async function buildRecommendationBundle(limit?: number): Promise<RecommendationBundle> {
  return recommendationEngine.generateRecommendations(limit);
}

export function toDashboardRecommendation(
  recommendation: Recommendation,
): DashboardRecommendation {
  return {
    id: recommendation.id,
    priority: priorityToLegacyRank(recommendation.priority),
    title: recommendation.title,
    description: recommendation.summary,
    category: mapDashboardCategory(recommendation.category),
  };
}

function mapDashboardCategory(
  category: Recommendation["category"],
): DashboardRecommendation["category"] {
  const map: Partial<Record<Recommendation["category"], DashboardRecommendation["category"]>> = {
    growth: "growth",
    risk: "risk",
    operations: "executive",
    productivity: "follow-up",
    hospitality: "executive",
    finance: "follow-up",
    marketing: "growth",
    sales: "growth",
    "customer-experience": "risk",
    revenue: "executive",
    commerce: "executive",
    compliance: "follow-up",
  };

  return map[category] ?? "priority";
}

export async function buildDashboardRecommendations(): Promise<DashboardRecommendation[]> {
  const bundle = await buildRecommendationBundle();
  return bundle.recommendations.map(toDashboardRecommendation);
}
