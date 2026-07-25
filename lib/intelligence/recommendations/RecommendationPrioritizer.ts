import type { Recommendation, RecommendationPriority } from "@/types/recommendations";

const PRIORITY_ORDER: Record<RecommendationPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

/** Removes duplicate recommendations by normalized title. */
export function deduplicateRecommendations(
  recommendations: Recommendation[],
): Recommendation[] {
  const seen = new Set<string>();
  const unique: Recommendation[] = [];

  for (const recommendation of recommendations) {
    const key = normalizeKey(recommendation.title);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(recommendation);
  }

  return unique;
}

/** Ranks recommendations by business value score and priority tier. */
export function rankRecommendations(recommendations: Recommendation[]): Recommendation[] {
  return [...recommendations].sort((left, right) => {
    const priorityDelta = PRIORITY_ORDER[right.priority] - PRIORITY_ORDER[left.priority];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    const scoreDelta = right.score.total - left.score.total;

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return right.confidenceScore - left.confidenceScore;
  });
}

export function selectTopRecommendations(
  recommendations: Recommendation[],
  limit = 6,
): Recommendation[] {
  return rankRecommendations(recommendations).slice(0, limit);
}
