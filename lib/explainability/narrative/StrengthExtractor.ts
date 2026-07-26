import type { ScoreBreakdown } from "@/lib/business-health/models/ScoreBreakdown";

/** Structured positive contributor traceable to EC-002A breakdown data. */
export type NarrativeContributor = {
  readonly category: string;
  readonly contribution: number;
  readonly explanation: string;
  readonly absoluteContribution: number;
};

function toContributor(breakdown: ScoreBreakdown): NarrativeContributor {
  return {
    category: breakdown.category,
    contribution: breakdown.contribution,
    explanation: breakdown.explanation,
    absoluteContribution: Math.abs(breakdown.contribution),
  };
}

function compareContributors(left: NarrativeContributor, right: NarrativeContributor): number {
  if (right.absoluteContribution !== left.absoluteContribution) {
    return right.absoluteContribution - left.absoluteContribution;
  }

  return left.category.localeCompare(right.category);
}

/** Extracts strongest positive contributors from structured breakdown evidence. */
export class StrengthExtractor {
  extract(
    breakdown: readonly ScoreBreakdown[],
    limit: number = 3,
  ): readonly NarrativeContributor[] {
    return breakdown
      .filter((entry) => entry.contribution > 0)
      .map(toContributor)
      .sort(compareContributors)
      .slice(0, Math.max(0, limit));
  }
}

/** Pure helper for selecting the strongest positive contributor. */
export function selectTopStrength(
  breakdown: readonly ScoreBreakdown[],
): NarrativeContributor | undefined {
  return new StrengthExtractor().extract(breakdown, 1)[0];
}
