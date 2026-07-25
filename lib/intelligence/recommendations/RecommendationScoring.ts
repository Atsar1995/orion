import type {
  Recommendation,
  RecommendationEvidence,
  RecommendationPriority,
  RecommendationScore,
} from "@/types/recommendations";

const PRIORITY_WEIGHT: Record<RecommendationPriority, number> = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
};

const IMPACT_WEIGHT = {
  high: 30,
  medium: 20,
  low: 10,
} as const;

const SOURCE_CONFIDENCE: Record<Recommendation["source"], number> = {
  alert: 0.92,
  provider: 0.88,
  trend: 0.85,
  health: 0.8,
  brief: 0.78,
  rule: 0.82,
  platform: 0.75,
};

export function scoreRecommendation(
  recommendation: Recommendation,
  evidence: RecommendationEvidence[],
): RecommendationScore {
  const businessValue =
    PRIORITY_WEIGHT[recommendation.priority] +
    IMPACT_WEIGHT[recommendation.estimatedImpact.magnitude];

  const evidenceBoost = Math.min(evidence.length * 5, 20);
  const sourceConfidence = SOURCE_CONFIDENCE[recommendation.source] * 100;
  const confidence = Math.min(sourceConfidence + evidenceBoost, 100);

  const urgency =
    recommendation.priority === "critical"
      ? 100
      : recommendation.priority === "high"
        ? 80
        : recommendation.priority === "medium"
          ? 55
          : 30;

  const total = Math.round(businessValue * 0.5 + confidence * 0.3 + urgency * 0.2);

  return {
    businessValue,
    confidence,
    urgency,
    total,
  };
}

export function applyScores(
  recommendation: Recommendation,
  evidence: RecommendationEvidence[],
): Recommendation {
  const score = scoreRecommendation(recommendation, evidence);

  return {
    ...recommendation,
    evidence,
    confidenceScore: Math.round(score.confidence),
    score,
  };
}

export function priorityToLegacyRank(priority: RecommendationPriority): number {
  const map: Record<RecommendationPriority, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  return map[priority];
}
