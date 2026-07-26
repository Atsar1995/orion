import type { HealthStatusLabel } from "@/lib/business-health/models/HealthScore";
import {
  FORMATTER_TEMPLATES,
  renderTemplate,
} from "@/lib/explainability/builder/MessageTemplates";
import type { ContributionAnalysis } from "@/lib/explainability/builder/ContributionAnalyzer";
import type { Confidence } from "@/lib/explainability/models/Confidence";
import type { ExplanationItem } from "@/lib/explainability/models/ExplanationItem";

/** Executive-readable formatted explanation sections. */
export type FormattedExplanation = {
  readonly headline: string;
  readonly driverSummaries: readonly string[];
  readonly positiveHighlights: readonly string[];
  readonly negativeHighlights: readonly string[];
  readonly neutralNotes: readonly string[];
  readonly confidenceNote: string;
};

export type ExplanationFormatInput = {
  readonly overallScore: number;
  readonly status: HealthStatusLabel;
  readonly confidence: Confidence;
  readonly analysis: ContributionAnalysis;
  readonly explanationItems: readonly ExplanationItem[];
  readonly highlightLimit?: number;
};

function resolveConfidenceTemplate(confidence: Confidence) {
  switch (confidence.level) {
    case "high":
      return FORMATTER_TEMPLATES.confidenceHigh;
    case "moderate":
      return FORMATTER_TEMPLATES.confidenceModerate;
    case "low":
      return FORMATTER_TEMPLATES.confidenceLow;
    case "insufficient":
      return FORMATTER_TEMPLATES.confidenceInsufficient;
  }
}

function formatContributionHighlight(
  template: (typeof FORMATTER_TEMPLATES)[keyof typeof FORMATTER_TEMPLATES],
  category: string,
  contribution: number,
  explanation: string,
): string {
  return renderTemplate(template, {
    category,
    contribution: Math.abs(contribution).toFixed(1),
    explanation,
  });
}

/** Converts structured explanation data into executive-readable language. */
export class ExplanationFormatter {
  format(input: ExplanationFormatInput): FormattedExplanation {
    const highlightLimit = input.highlightLimit ?? 3;

    const headline = renderTemplate(FORMATTER_TEMPLATES.headline, {
      score: input.overallScore.toFixed(1),
      status: input.status,
      confidenceLevel: input.confidence.level,
    });

    const confidenceNote = renderTemplate(resolveConfidenceTemplate(input.confidence), {
      confidenceScore: input.confidence.score.toFixed(1),
    });

    if (input.analysis.all.length === 0) {
      return {
        headline,
        driverSummaries: [renderTemplate(FORMATTER_TEMPLATES.emptyDrivers, {})],
        positiveHighlights: [],
        negativeHighlights: [],
        neutralNotes: [],
        confidenceNote,
      };
    }

    const positiveHighlights = input.analysis.positives
      .slice(0, highlightLimit)
      .map((entry) =>
        formatContributionHighlight(
          FORMATTER_TEMPLATES.positiveHighlight,
          entry.breakdown.category,
          entry.breakdown.contribution,
          entry.breakdown.explanation,
        ),
      );

    const negativeHighlights = input.analysis.negatives
      .slice(0, highlightLimit)
      .map((entry) =>
        formatContributionHighlight(
          FORMATTER_TEMPLATES.negativeHighlight,
          entry.breakdown.category,
          entry.breakdown.contribution,
          entry.breakdown.explanation,
        ),
      );

    const neutralNotes = input.analysis.neutrals
      .slice(0, highlightLimit)
      .map((entry) =>
        renderTemplate(FORMATTER_TEMPLATES.neutralNote, {
          category: entry.breakdown.category,
        }),
      );

    const driverSummaries = input.explanationItems.map((item) =>
      renderTemplate(FORMATTER_TEMPLATES.driverSummary, {
        title: item.title,
        description: item.description,
      }),
    );

    return {
      headline,
      driverSummaries,
      positiveHighlights,
      negativeHighlights,
      neutralNotes,
      confidenceNote,
    };
  }
}
