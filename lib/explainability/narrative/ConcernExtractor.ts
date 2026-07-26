import type { ScoreBreakdown } from "@/lib/business-health/models/ScoreBreakdown";
import {
  EXECUTIVE_NARRATIVE_TEMPLATES,
  renderNarrativeTemplate,
} from "@/lib/explainability/narrative/NarrativeTemplates";
import type { Confidence } from "@/lib/explainability/models/Confidence";
import type { NarrativeContributor } from "@/lib/explainability/narrative/StrengthExtractor";

/** Structured concern output traceable to breakdown and confidence data. */
export type NarrativeConcern = {
  readonly category: string;
  readonly contribution: number;
  readonly explanation: string;
  readonly absoluteContribution: number;
  readonly message: string;
  readonly templateId: string;
};

/** Combined contributor and confidence concerns for executive narratives. */
export type ConcernExtraction = {
  readonly contributors: readonly NarrativeConcern[];
  readonly confidenceConcerns: readonly string[];
};

function compareNegativeContributors(
  left: ScoreBreakdown,
  right: ScoreBreakdown,
): number {
  const leftMagnitude = Math.abs(left.contribution);
  const rightMagnitude = Math.abs(right.contribution);

  if (rightMagnitude !== leftMagnitude) {
    return rightMagnitude - leftMagnitude;
  }

  return left.category.localeCompare(right.category);
}

/** Pure helper for selecting the weakest contributor. */
export function selectTopConcern(
  breakdown: readonly ScoreBreakdown[],
): NarrativeContributor | undefined {
  const top = [...breakdown]
    .filter((entry) => entry.contribution < 0)
    .sort(compareNegativeContributors)[0];

  if (!top) {
    return undefined;
  }

  return {
    category: top.category,
    contribution: top.contribution,
    explanation: top.explanation,
    absoluteContribution: Math.abs(top.contribution),
  };
}

function buildConfidenceConcerns(confidence: Confidence): readonly string[] {
  const concerns: string[] = [];

  if (confidence.level === "low" || confidence.level === "insufficient") {
    concerns.push(
      renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.confidenceConcern, {
        confidenceLevel: confidence.level,
        confidenceScore: confidence.score.toFixed(1),
      }),
    );
  }

  for (const factor of confidence.factors) {
    if (factor.impact >= 0) {
      continue;
    }

    concerns.push(
      renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.confidenceFactorConcern, {
        factorDescription: factor.description,
      }),
    );
  }

  return concerns;
}

function compareConcerns(left: NarrativeConcern, right: NarrativeConcern): number {
  if (right.absoluteContribution !== left.absoluteContribution) {
    return right.absoluteContribution - left.absoluteContribution;
  }

  return left.category.localeCompare(right.category);
}

/** Extracts weakest contributors and confidence-related executive concerns. */
export class ConcernExtractor {
  extract(
    breakdown: readonly ScoreBreakdown[],
    confidence: Confidence,
    limit: number = 3,
  ): ConcernExtraction {
    const contributors = breakdown
      .filter((entry) => entry.contribution < 0)
      .map((entry) => ({
        category: entry.category,
        contribution: entry.contribution,
        explanation: entry.explanation,
        absoluteContribution: Math.abs(entry.contribution),
        templateId: EXECUTIVE_NARRATIVE_TEMPLATES.concernBullet.id,
        message: renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.concernBullet, {
          category: entry.category,
          contribution: Math.abs(entry.contribution).toFixed(1),
        }),
      }))
      .sort(compareConcerns)
      .slice(0, Math.max(0, limit));

    return {
      contributors,
      confidenceConcerns: buildConfidenceConcerns(confidence),
    };
  }
}
