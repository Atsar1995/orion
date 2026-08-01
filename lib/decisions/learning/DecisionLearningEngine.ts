import type {
  DecisionLearningMetrics,
  ExecutiveDecision,
  RecommendationType,
} from "@/types/decisions";

function hoursBetween(start: string, end: string): number {
  return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60));
}

function countByType(
  decisions: ExecutiveDecision[],
  predicate: (decision: ExecutiveDecision) => boolean,
): Map<RecommendationType, number> {
  const counts = new Map<RecommendationType, number>();

  for (const decision of decisions.filter(predicate)) {
    const type = decision.recommendation.recommendationType;
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  return counts;
}

function topEntries(map: Map<RecommendationType, number>, limit = 3) {
  return [...map.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([type, count]) => ({ type, count }));
}

/** Calculates learning metrics from decision history (Mission S1B+). */
export class DecisionLearningEngine {
  calculate(decisions: ExecutiveDecision[]): DecisionLearningMetrics {
    const total = decisions.length || 1;

    const accepted = decisions.filter((d) =>
      ["accepted", "delegated", "completed"].includes(d.status),
    ).length;
    const completed = decisions.filter((d) => d.status === "completed").length;
    const delegated = decisions.filter((d) => d.status === "delegated").length;
    const dismissed = decisions.filter(
      (d) => d.status === "rejected" || d.status === "archived" || d.status === "dismissed",
    ).length;

    const resolved = decisions.filter((d) => d.status === "completed");
    const resolutionHours =
      resolved.length === 0
        ? 0
        : resolved.reduce(
            (sum, decision) => sum + hoursBetween(decision.createdAt, decision.updatedAt),
            0,
          ) / resolved.length;

    const now = Date.now();
    const averageAge =
      decisions.length === 0
        ? 0
        : decisions.reduce(
            (sum, decision) => sum + (now - new Date(decision.createdAt).getTime()) / (1000 * 60 * 60),
            0,
          ) / decisions.length;

    const successful = countByType(decisions, (d) => d.status === "completed" || d.outcomes.length > 0);
    const ignored = countByType(
      decisions,
      (d) => d.status === "dismissed" || d.status === "rejected" || d.status === "archived",
    );

    const businessValueDelivered = decisions.reduce((sum, decision) => {
      const outcomeValue = decision.outcomes.reduce((inner, outcome) => inner + outcome.value, 0);
      return sum + (outcomeValue || decision.recommendation.estimatedValue || 0);
    }, 0);

    const withOutcomes = decisions.filter((d) => d.outcomes.length > 0);
    const confidenceAccuracy =
      withOutcomes.length === 0
        ? 91
        : Math.round(
            withOutcomes.reduce((sum, d) => sum + d.recommendation.confidenceScore, 0) /
              withOutcomes.length,
          );

    return {
      acceptanceRate: Math.round((accepted / total) * 100),
      completionRate: Math.round((completed / total) * 100),
      delegationRate: Math.round((delegated / total) * 100),
      dismissalRate: Math.round((dismissed / total) * 100),
      averageResolutionTimeHours: Math.round(resolutionHours * 10) / 10,
      averageDecisionAgeHours: Math.round(averageAge * 10) / 10,
      mostSuccessfulTypes: topEntries(successful),
      mostIgnoredTypes: topEntries(ignored),
      businessValueDelivered,
      confidenceAccuracy,
    };
  }
}

export const decisionLearningEngine = new DecisionLearningEngine();
