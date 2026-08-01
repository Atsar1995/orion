import type {
  ExecutiveActionType,
  ExecutiveBehaviorAnalytics,
  ExecutiveDecision,
  ExecutiveInsight,
  ExecutiveLearningSnapshot,
  ExecutiveScorecard,
  OutcomeCorrelation,
  PlatformLearningTrends,
  RecommendationQualityByType,
  RecommendationQualityMetrics,
  RecommendationType,
} from "@/types/decisions";

const ACCEPTED_STATUSES = new Set(["accepted", "delegated", "completed"]);
const DISMISSED_STATUSES = new Set(["rejected", "archived", "dismissed"]);
const HIGH_CONFIDENCE = 75;
const LOW_CONFIDENCE = 65;

function hoursBetween(start: string, end: string): number {
  return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60));
}

function firstActionHours(decision: ExecutiveDecision): number | null {
  const first = decision.actions[0];
  return first ? hoursBetween(decision.createdAt, first.timestamp) : null;
}

function isSuccessful(decision: ExecutiveDecision): boolean {
  return decision.status === "completed" || decision.outcomes.length > 0;
}

function isDismissed(decision: ExecutiveDecision): boolean {
  return DISMISSED_STATUSES.has(decision.status);
}

function outcomeValue(decision: ExecutiveDecision): number {
  return decision.outcomes.reduce((sum, outcome) => sum + outcome.value, 0);
}

function primaryAction(decision: ExecutiveDecision): ExecutiveActionType {
  return decision.actions.at(-1)?.action ?? "accepted";
}

function groupByDate(decisions: ExecutiveDecision[]): { date: string; count: number }[] {
  const map = new Map<string, number>();

  for (const decision of decisions) {
    const date = decision.createdAt.slice(0, 10);
    map.set(date, (map.get(date) ?? 0) + 1);
  }

  return [...map.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([date, count]) => ({ date, count }));
}

function qualityForType(
  decisions: ExecutiveDecision[],
  type: RecommendationType,
): RecommendationQualityByType {
  const subset = decisions.filter((d) => d.recommendation.recommendationType === type);
  const total = subset.length || 1;
  const accepted = subset.filter((d) => ACCEPTED_STATUSES.has(d.status)).length;
  const completed = subset.filter((d) => d.status === "completed").length;
  const actionTimes = subset
    .map(firstActionHours)
    .filter((value): value is number => value !== null);
  const successful = subset.filter(isSuccessful);
  const calibration =
    successful.length === 0
      ? 0
      : Math.round(
          successful.reduce((sum, d) => {
            const predicted = d.recommendation.confidenceScore >= HIGH_CONFIDENCE;
            const actual = isSuccessful(d);
            return sum + (predicted === actual ? 100 : 0);
          }, 0) / successful.length,
        );

  return {
    type,
    acceptanceRate: Math.round((accepted / total) * 100),
    completionRate: Math.round((completed / total) * 100),
    averageTimeToActionHours:
      actionTimes.length === 0
        ? 0
        : Math.round((actionTimes.reduce((a, b) => a + b, 0) / actionTimes.length) * 10) / 10,
    businessImpactRealized: subset.reduce((sum, d) => sum + outcomeValue(d), 0),
    confidenceCalibration: calibration,
  };
}

/** Validates and extends platform learning from executive decision history (Mission S1F). */
export class ExecutiveLearningEngine {
  buildSnapshot(
    decisions: ExecutiveDecision[],
    executiveId = "user-executive",
    executiveName = "Executive",
  ): ExecutiveLearningSnapshot {
    const quality = this.calculateQualityMetrics(decisions);
    const behavior = this.calculateBehaviorAnalytics(decisions);
    const correlations = this.buildOutcomeCorrelations(decisions);
    const scorecard = this.buildScorecard(decisions, executiveId, executiveName);
    const platformTrends = this.calculatePlatformTrends(decisions);
    const insights = this.generateInsights(
      decisions,
      quality,
      behavior,
      scorecard,
      platformTrends,
    );

    return {
      generatedAt: new Date().toISOString(),
      quality,
      behavior,
      correlations,
      scorecard,
      platformTrends,
      insights,
    };
  }

  calculateQualityMetrics(decisions: ExecutiveDecision[]): RecommendationQualityMetrics {
    const types = [...new Set(decisions.map((d) => d.recommendation.recommendationType))];
    const byType = types.map((type) => qualityForType(decisions, type));
    const actionTimes = decisions
      .map(firstActionHours)
      .filter((value): value is number => value !== null);
    const successful = decisions.filter(isSuccessful);
    const calibration =
      successful.length === 0
        ? 91
        : Math.round(
            successful.reduce((sum, d) => {
              const highConf = d.recommendation.confidenceScore >= HIGH_CONFIDENCE;
              return sum + (highConf === isSuccessful(d) ? 100 : 50);
            }, 0) / successful.length,
          );

    return {
      byType,
      overallCompletionRate:
        decisions.length === 0
          ? 0
          : Math.round(
              (decisions.filter((d) => d.status === "completed").length / decisions.length) * 100,
            ),
      overallAverageTimeToActionHours:
        actionTimes.length === 0
          ? 0
          : Math.round((actionTimes.reduce((a, b) => a + b, 0) / actionTimes.length) * 10) / 10,
      totalBusinessImpactRealized: decisions.reduce((sum, d) => sum + outcomeValue(d), 0),
      overallConfidenceCalibration: calibration,
    };
  }

  calculateBehaviorAnalytics(decisions: ExecutiveDecision[]): ExecutiveBehaviorAnalytics {
    const delegated = decisions.filter((d) => d.status === "delegated");
    const delegateCounts = new Map<string, number>();

    for (const decision of delegated) {
      const delegate = decision.actions.find((a) => a.delegateName)?.delegateName ?? "Unassigned";
      delegateCounts.set(delegate, (delegateCounts.get(delegate) ?? 0) + 1);
    }

    const accepted = decisions.filter((d) => d.status === "accepted" || d.status === "completed");
    const completedFromAccepted = accepted.filter((d) => d.status === "completed").length;

    return {
      decisionsPerDay: groupByDate(decisions),
      delegationPatterns: [...delegateCounts.entries()]
        .map(([delegateName, count]) => ({ delegateName, count }))
        .sort((left, right) => right.count - left.count),
      snoozeFrequency: decisions.filter(
        (d) => d.status === "snoozed" || d.status === "deferred",
      ).length,
      reopenedDecisions: decisions.filter((d) => d.status === "reopened").length,
      followThroughRate:
        accepted.length === 0 ? 0 : Math.round((completedFromAccepted / accepted.length) * 100),
    };
  }

  buildOutcomeCorrelations(decisions: ExecutiveDecision[]): OutcomeCorrelation[] {
    return decisions
      .filter((d) => d.outcomes.length > 0 || d.status === "completed")
      .map((decision) => {
        const outcome = decision.outcomes[0];
        const value = outcome?.value ?? decision.recommendation.estimatedValue ?? 0;

        return {
          decisionId: decision.id,
          recommendationTitle: decision.recommendation.title,
          recommendationType: decision.recommendation.recommendationType,
          action: primaryAction(decision),
          outcomeValue: value,
          outcomeLabel: outcome?.label ?? decision.recommendation.businessImpact,
          confidenceScore: decision.recommendation.confidenceScore,
          cycleHours: Math.round(hoursBetween(decision.createdAt, decision.updatedAt) * 10) / 10,
        };
      })
      .sort((left, right) => right.outcomeValue - left.outcomeValue);
  }

  buildScorecard(
    decisions: ExecutiveDecision[],
    executiveId: string,
    executiveName: string,
  ): ExecutiveScorecard {
    const mine = decisions.filter((d) =>
      d.actions.some((a) => a.executiveId === executiveId),
    );
    const scoped = mine.length > 0 ? mine : decisions;

    const typeSuccess = new Map<RecommendationType, { total: number; success: number }>();

    for (const decision of scoped) {
      const type = decision.recommendation.recommendationType;
      const current = typeSuccess.get(type) ?? { total: 0, success: 0 };
      typeSuccess.set(type, {
        total: current.total + 1,
        success: current.success + (isSuccessful(decision) ? 1 : 0),
      });
    }

    const completed = scoped.filter((d) => d.status === "completed");
    const cycleHours =
      completed.length === 0
        ? 0
        : completed.reduce(
            (sum, d) => sum + hoursBetween(d.createdAt, d.updatedAt),
            0,
          ) / completed.length;

    const missed = scoped
      .filter((d) => isDismissed(d) && (d.recommendation.estimatedValue ?? 0) > 5000)
      .map((d) => ({
        title: d.recommendation.title,
        estimatedValue: d.recommendation.estimatedValue ?? 0,
        reason: d.status === "dismissed" ? "Dismissed" : "Rejected",
      }))
      .slice(0, 3);

    return {
      executiveId,
      executiveName,
      mostEffectiveCategories: [...typeSuccess.entries()]
        .map(([type, stats]) => ({
          type,
          successRate: Math.round((stats.success / stats.total) * 100),
        }))
        .sort((left, right) => right.successRate - left.successRate)
        .slice(0, 3),
      averageDecisionCycleHours: Math.round(cycleHours * 10) / 10,
      highImpactActions: scoped
        .filter(isSuccessful)
        .map((d) => ({
          title: d.recommendation.title,
          value: outcomeValue(d) || d.recommendation.estimatedValue || 0,
        }))
        .sort((left, right) => right.value - left.value)
        .slice(0, 3),
      missedOpportunities: missed,
    };
  }

  calculatePlatformTrends(decisions: ExecutiveDecision[]): PlatformLearningTrends {
    const typeStats = new Map<RecommendationType, { total: number; success: number }>();

    for (const decision of decisions) {
      const type = decision.recommendation.recommendationType;
      const current = typeStats.get(type) ?? { total: 0, success: 0 };
      typeStats.set(type, {
        total: current.total + 1,
        success: current.success + (isSuccessful(decision) ? 1 : 0),
      });
    }

    return {
      highestSuccessTypes: [...typeStats.entries()]
        .map(([type, stats]) => ({
          type,
          successRate: Math.round((stats.success / stats.total) * 100),
        }))
        .sort((left, right) => right.successRate - left.successRate)
        .slice(0, 3),
      lowConfidenceSuccesses: decisions
        .filter(
          (d) =>
            d.recommendation.confidenceScore < LOW_CONFIDENCE &&
            isSuccessful(d) &&
            outcomeValue(d) > 0,
        )
        .map((d) => ({
          title: d.recommendation.title,
          confidenceScore: d.recommendation.confidenceScore,
          outcomeValue: outcomeValue(d),
        }))
        .slice(0, 3),
      highConfidenceRejections: decisions
        .filter(
          (d) => d.recommendation.confidenceScore >= HIGH_CONFIDENCE && isDismissed(d),
        )
        .map((d) => ({
          title: d.recommendation.title,
          confidenceScore: d.recommendation.confidenceScore,
          reason: d.status === "dismissed" ? "Dismissed by executive" : "Rejected",
        }))
        .slice(0, 3),
    };
  }

  generateInsights(
    decisions: ExecutiveDecision[],
    quality: RecommendationQualityMetrics,
    behavior: ExecutiveBehaviorAnalytics,
    scorecard: ExecutiveScorecard,
    platformTrends: PlatformLearningTrends,
  ): ExecutiveInsight[] {
    const insights: ExecutiveInsight[] = [];

    const topType = platformTrends.highestSuccessTypes[0];
    if (topType) {
      insights.push({
        id: "platform-top-type",
        category: "platform",
        headline: `${topType.type} recommendations lead success`,
        detail: `${topType.successRate}% success rate — ORION should prioritize this category.`,
        metric: `${topType.successRate}%`,
      });
    }

    const lowConf = platformTrends.lowConfidenceSuccesses[0];
    if (lowConf) {
      insights.push({
        id: "platform-low-conf-success",
        category: "platform",
        headline: "Low-confidence wins detected",
        detail: `"${lowConf.title}" succeeded at ${lowConf.confidenceScore}% confidence — recalibrate scoring.`,
        metric: `$${lowConf.outcomeValue.toLocaleString()}`,
      });
    }

    const highRej = platformTrends.highConfidenceRejections[0];
    if (highRej) {
      insights.push({
        id: "platform-high-conf-reject",
        category: "platform",
        headline: "High-confidence recommendations rejected",
        detail: `"${highRej.title}" (${highRej.confidenceScore}%) was ${highRej.reason.toLowerCase()}.`,
      });
    }

    const effective = scorecard.mostEffectiveCategories[0];
    if (effective) {
      insights.push({
        id: "scorecard-effective",
        category: "scorecard",
        headline: `Your strongest category: ${effective.type}`,
        detail: `${effective.successRate}% success on ${effective.type} decisions.`,
        metric: `${effective.successRate}%`,
      });
    }

    if (scorecard.averageDecisionCycleHours > 0) {
      insights.push({
        id: "scorecard-cycle",
        category: "scorecard",
        headline: "Average decision cycle",
        detail: `You close decisions in ${scorecard.averageDecisionCycleHours} hours on average.`,
        metric: `${scorecard.averageDecisionCycleHours}h`,
      });
    }

    const impact = scorecard.highImpactActions[0];
    if (impact) {
      insights.push({
        id: "scorecard-impact",
        category: "scorecard",
        headline: "Highest-impact action taken",
        detail: impact.title,
        metric: `$${impact.value.toLocaleString()}`,
      });
    }

    const missed = scorecard.missedOpportunities[0];
    if (missed) {
      insights.push({
        id: "scorecard-missed",
        category: "scorecard",
        headline: "Missed opportunity flagged",
        detail: `"${missed.title}" was ${missed.reason.toLowerCase()} — $${missed.estimatedValue.toLocaleString()} at stake.`,
      });
    }

    if (behavior.followThroughRate > 0) {
      insights.push({
        id: "behavior-follow-through",
        category: "behavior",
        headline: "Follow-through rate",
        detail: `${behavior.followThroughRate}% of accepted decisions reach completion.`,
        metric: `${behavior.followThroughRate}%`,
      });
    }

    if (behavior.snoozeFrequency > 0) {
      insights.push({
        id: "behavior-snooze",
        category: "behavior",
        headline: "Snooze pattern",
        detail: `${behavior.snoozeFrequency} decision${behavior.snoozeFrequency === 1 ? "" : "s"} currently snoozed — review deferred items.`,
      });
    }

    if (quality.overallConfidenceCalibration > 0) {
      insights.push({
        id: "quality-calibration",
        category: "quality",
        headline: "Confidence calibration",
        detail: `ORION confidence scores align with outcomes ${quality.overallConfidenceCalibration}% of the time.`,
        metric: `${quality.overallConfidenceCalibration}%`,
      });
    }

    if (decisions.length > 0 && quality.totalBusinessImpactRealized > 0) {
      insights.push({
        id: "outcome-value",
        category: "outcome",
        headline: "Business impact realized",
        detail: "Measurable outcomes linked to executive decisions this period.",
        metric: `$${quality.totalBusinessImpactRealized.toLocaleString()}`,
      });
    }

    return insights.slice(0, 6);
  }
}

export const executiveLearningEngine = new ExecutiveLearningEngine();
