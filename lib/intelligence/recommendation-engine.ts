import type { RecommendationBundle } from "@/lib/intelligence/engine-models";
import type { RecommendationEngine } from "@/lib/intelligence/engine-interfaces";
import type {
  BusinessAlert,
  ExecutivePriority,
  ExecutiveRecommendation,
  RiskIndicator,
} from "@/lib/intelligence/models";
import type { RegisteredExecutiveProvider } from "@/lib/intelligence/provider-registry";
import type {
  RecommendationInput,
  RecommendationOutput,
} from "@/lib/intelligence/engine-models";

const IMPACT_WEIGHT = { high: 0, medium: 1, low: 2 } as const;

const SEVERITY_WEIGHT = { critical: 0, attention: 1, healthy: 2 } as const;

/** Sorts recommendations by priority ascending. */
export function sortRecommendations(
  recommendations: ExecutiveRecommendation[],
): ExecutiveRecommendation[] {
  return [...recommendations].sort((left, right) => left.priority - right.priority);
}

/** Sorts executive priorities by rank then business impact. */
export function sortExecutivePriorities(
  priorities: ExecutivePriority[],
): ExecutivePriority[] {
  return [...priorities].sort((left, right) => {
    const rankDelta = left.rank - right.rank;

    if (rankDelta !== 0) {
      return rankDelta;
    }

    return IMPACT_WEIGHT[left.impact] - IMPACT_WEIGHT[right.impact];
  });
}

/** Sorts alerts by severity then message. */
export function sortAlerts(alerts: BusinessAlert[]): BusinessAlert[] {
  return [...alerts].sort((left, right) => {
    const severityDelta =
      SEVERITY_WEIGHT[left.severity] - SEVERITY_WEIGHT[right.severity];

    if (severityDelta !== 0) {
      return severityDelta;
    }

    return left.message.localeCompare(right.message);
  });
}

/** Aggregates recommendations, priorities, and alerts from all providers. */
export function aggregateProviderRecommendations(
  providers: RegisteredExecutiveProvider[],
): RecommendationBundle {
  const recommendations = sortRecommendations(
    providers.flatMap((provider) => provider.getRecommendations()),
  );
  const priorities = sortExecutivePriorities(
    providers.flatMap((provider) => provider.getPriorities()),
  );
  const criticalAlerts = sortAlerts(providers.flatMap((provider) => provider.getAlerts()));
  const opportunities = sortRecommendations(
    recommendations.filter((item) => item.category === "growth"),
  );
  const executiveActions = sortRecommendations(
    recommendations.filter(
      (item) => item.category === "executive" || item.category === "priority",
    ),
  );

  return {
    recommendations,
    priorities,
    opportunities,
    executiveActions,
    criticalAlerts,
  };
}

/** Default Recommendation Engine implementation (Mission 17B). */
export const recommendationEngine: RecommendationEngine = {
  aggregate: aggregateProviderRecommendations,
};

// --- Workspace pipeline builders (used by workspace-specific pipelines, not platform engine) ---

/** Converts risk indicators to standard business alerts. */
export function mapRiskIndicatorsToAlerts(risks: RiskIndicator[]): BusinessAlert[] {
  return risks.map((risk) => ({
    severity: risk.severity,
    message: risk.message,
    category: "risk",
  }));
}

/** Generates recommendation output from structured workspace intelligence input. */
export function generateRecommendations(input: RecommendationInput): RecommendationOutput {
  return {
    executiveRecommendations: sortRecommendations(input.insights),
    followUpRecommendations: sortRecommendations(input.followUps),
    riskAlerts: mapRiskIndicatorsToAlerts(input.riskAlerts),
    growthOpportunities: sortRecommendations(input.growthOpportunities),
    executivePriorities: sortExecutivePriorities(input.executivePriorities),
  };
}

/** Builds follow-up recommendations from relationship action data. */
export function buildFollowUpRecommendations(
  actions: Array<{ priority: number; action: string; customer: string; description: string }>,
): ExecutiveRecommendation[] {
  return actions.map((item) => ({
    priority: item.priority,
    title: `${item.action} — ${item.customer}`,
    description: item.description,
    category: "follow-up",
  }));
}

/** Selects the top N executive recommendations by priority. */
export function selectTopRecommendations(
  recommendations: ExecutiveRecommendation[],
  count: number,
): ExecutiveRecommendation[] {
  return sortRecommendations(recommendations).slice(0, count);
}

/** Selects the highest-impact executive priority. */
export function selectTopExecutivePriority(
  priorities: ExecutivePriority[],
): ExecutivePriority | undefined {
  return sortExecutivePriorities(priorities).find(
    (priority) => priority.impact === "high",
  );
}
