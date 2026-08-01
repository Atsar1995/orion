import { decisionLearningEngine } from "@/lib/decisions/learning/DecisionLearningEngine";
import { executiveLearningEngine } from "@/lib/decisions/learning/ExecutiveLearningEngine";
import type { DecisionAnalyticsSnapshot, ExecutiveDecision } from "@/types/decisions";

function groupByDate(decisions: ExecutiveDecision[], field: "createdAt" | "updatedAt") {
  const map = new Map<string, number>();

  for (const decision of decisions) {
    const date = decision[field].slice(0, 10);
    map.set(date, (map.get(date) ?? 0) + 1);
  }

  return [...map.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([date, count]) => ({ date, count }));
}

/** Platform decision analytics (Mission S1B+). */
export class DecisionAnalytics {
  buildSnapshot(
    decisions: ExecutiveDecision[],
    executiveId?: string,
    executiveName?: string,
  ): DecisionAnalyticsSnapshot {
    const learning = decisionLearningEngine.calculate(decisions);
    const executiveLearning = executiveLearningEngine.buildSnapshot(
      decisions,
      executiveId,
      executiveName,
    );
    const decisionTrend = groupByDate(decisions, "createdAt");

    const acceptanceTrend = decisionTrend.map((entry) => {
      const dayDecisions = decisions.filter((d) => d.createdAt.startsWith(entry.date));
      const accepted = dayDecisions.filter((d) =>
        ["accepted", "delegated", "completed"].includes(d.status),
      ).length;
      const rate = dayDecisions.length === 0 ? 0 : Math.round((accepted / dayDecisions.length) * 100);

      return { date: entry.date, rate };
    });

    const outcomeTrend = decisionTrend.map((entry) => {
      const value = decisions
        .filter((d) => d.outcomes.some((o) => o.recordedAt.startsWith(entry.date)))
        .reduce((sum, d) => sum + d.outcomes.reduce((inner, o) => inner + o.value, 0), 0);

      return { date: entry.date, value };
    });

    const businessValueTrend = decisionTrend.map((entry) => ({
      date: entry.date,
      value: decisions
        .filter((d) => d.updatedAt.startsWith(entry.date))
        .reduce(
          (sum, d) =>
            sum +
            (d.recommendation.estimatedValue ??
              d.outcomes.reduce((inner, o) => inner + o.value, 0)),
          0,
        ),
    }));

    const executiveCounts = new Map<string, { name: string; count: number }>();

    for (const decision of decisions) {
      for (const action of decision.actions) {
        const current = executiveCounts.get(action.executiveId) ?? {
          name: action.executiveName,
          count: 0,
        };
        executiveCounts.set(action.executiveId, {
          name: action.executiveName,
          count: current.count + 1,
        });
      }
    }

    const typeCounts = new Map<string, number>();

    for (const decision of decisions) {
      const type = decision.recommendation.recommendationType;
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    }

    const averageConfidence =
      decisions.length === 0
        ? 0
        : Math.round(
            decisions.reduce((sum, d) => sum + d.recommendation.confidenceScore, 0) /
              decisions.length,
          );

    return {
      generatedAt: new Date().toISOString(),
      totalDecisions: decisions.length,
      learning,
      executiveLearning,
      decisionTrend,
      acceptanceTrend,
      outcomeTrend,
      businessValueTrend,
      averageConfidence,
      topExecutives: [...executiveCounts.entries()]
        .map(([executiveId, value]) => ({ executiveId, name: value.name, count: value.count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 5),
      topRecommendationTypes: [...typeCounts.entries()]
        .map(([type, count]) => ({ type: type as DecisionAnalyticsSnapshot["topRecommendationTypes"][number]["type"], count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 5),
    };
  }
}

export const decisionAnalytics = new DecisionAnalytics();
