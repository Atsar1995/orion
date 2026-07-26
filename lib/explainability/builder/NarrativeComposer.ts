import type { HealthScore } from "@/lib/business-health/models/HealthScore";
import {
  NARRATIVE_TEMPLATES,
  renderTemplate,
  type NarrativeTemplateId,
} from "@/lib/explainability/builder/MessageTemplates";
import type { ContributionAnalysis } from "@/lib/explainability/builder/ContributionAnalyzer";
import { selectTopContributions } from "@/lib/explainability/builder/ContributionAnalyzer";
import type { Confidence } from "@/lib/explainability/models/Confidence";
import type { ExecutiveNarrative } from "@/lib/explainability/models/ExecutiveNarrative";

export type NarrativeComposeInput = {
  readonly healthScore: HealthScore;
  readonly confidence: Confidence;
  readonly analysis: ContributionAnalysis;
  readonly highlightLimit?: number;
};

type NarrativeTemplateSelection = {
  readonly templateId: NarrativeTemplateId;
  readonly variables: Record<string, string | number>;
};

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function selectInterpretationTemplate(
  healthScore: HealthScore,
  confidence: Confidence,
): NarrativeTemplateSelection {
  if (confidence.level === "low" || confidence.level === "insufficient") {
    return {
      templateId: "lowConfidenceInterpretation",
      variables: {
        confidenceLevel: confidence.level,
        confidenceScore: confidence.score.toFixed(1),
      },
    };
  }

  if (healthScore.overallScore >= 75) {
    return {
      templateId: healthScore.status === "excellent" ? "healthyImproving" : "healthyStable",
      variables: {
        score: healthScore.overallScore.toFixed(1),
        status: healthScore.status,
      },
    };
  }

  if (healthScore.overallScore >= 60) {
    return {
      templateId: "fairAttention",
      variables: {
        score: healthScore.overallScore.toFixed(1),
        status: healthScore.status,
      },
    };
  }

  return {
    templateId: "poorCritical",
    variables: {
      score: healthScore.overallScore.toFixed(1),
      status: healthScore.status,
    },
  };
}

function enforceSummaryWordLimit(summary: string, fallback: string, maxWords = 20): string {
  if (countWords(summary) <= maxWords) {
    return summary;
  }

  if (countWords(fallback) <= maxWords) {
    return fallback;
  }

  return fallback.split(/\s+/).slice(0, maxWords).join(" ");
}

function buildSummary(input: NarrativeComposeInput): string {
  const highlightLimit = input.highlightLimit ?? 3;
  const topPositive = selectTopContributions(input.analysis.positives, highlightLimit)[0];
  const topNegative = selectTopContributions(input.analysis.negatives, highlightLimit)[0];

  if (input.confidence.level === "low" || input.confidence.level === "insufficient") {
    return renderTemplate(NARRATIVE_TEMPLATES.summaryLowConfidence, {
      score: input.healthScore.overallScore.toFixed(1),
      status: input.healthScore.status,
      confidenceLevel: input.confidence.level,
    });
  }

  if (!topPositive && !topNegative) {
    return renderTemplate(NARRATIVE_TEMPLATES.summaryNoDrivers, {
      score: input.healthScore.overallScore.toFixed(1),
      status: input.healthScore.status,
    });
  }

  if (topPositive && topNegative) {
    const summary = renderTemplate(NARRATIVE_TEMPLATES.summaryWithOffset, {
      score: input.healthScore.overallScore.toFixed(1),
      status: input.healthScore.status,
      topPositive: topPositive.breakdown.category,
      topNegative: topNegative.breakdown.category,
    });

    return enforceSummaryWordLimit(
      summary,
      renderTemplate(NARRATIVE_TEMPLATES.summaryStrengthOnly, {
        score: input.healthScore.overallScore.toFixed(1),
        status: input.healthScore.status,
        topPositive: topPositive.breakdown.category,
      }),
    );
  }

  return renderTemplate(NARRATIVE_TEMPLATES.summaryStrengthOnly, {
    score: input.healthScore.overallScore.toFixed(1),
    status: input.healthScore.status,
    topPositive: topPositive?.breakdown.category ?? "core categories",
  });
}

/** Produces deterministic executive narratives from ranked contributors. */
export class NarrativeComposer {
  compose(input: NarrativeComposeInput): ExecutiveNarrative {
    const highlightLimit = input.highlightLimit ?? 3;
    const summary = buildSummary(input);
    const interpretationSelection = selectInterpretationTemplate(
      input.healthScore,
      input.confidence,
    );

    const strengths =
      input.analysis.positives.length === 0
        ? [renderTemplate(NARRATIVE_TEMPLATES.noStrengths, {})]
        : selectTopContributions(input.analysis.positives, highlightLimit).map((entry) =>
            renderTemplate(NARRATIVE_TEMPLATES.strengthBullet, {
              category: entry.breakdown.category,
              contribution: Math.abs(entry.breakdown.contribution).toFixed(1),
            }),
          );

    const concerns = [
      ...selectTopContributions(input.analysis.negatives, highlightLimit).map((entry) =>
        renderTemplate(NARRATIVE_TEMPLATES.concernBullet, {
          category: entry.breakdown.category,
          contribution: Math.abs(entry.breakdown.contribution).toFixed(1),
        }),
      ),
    ];

    if (concerns.length === 0) {
      concerns.push(renderTemplate(NARRATIVE_TEMPLATES.noConcerns, {}));
    }

    if (input.confidence.level === "low" || input.confidence.level === "insufficient") {
      concerns.push(
        renderTemplate(NARRATIVE_TEMPLATES.confidenceConcern, {
          confidenceLevel: input.confidence.level,
          confidenceScore: input.confidence.score.toFixed(1),
        }),
      );
    }

    const interpretation = renderTemplate(
      NARRATIVE_TEMPLATES[interpretationSelection.templateId],
      interpretationSelection.variables,
    );

    return {
      summary: enforceSummaryWordLimit(summary, summary),
      strengths,
      concerns,
      interpretation,
    };
  }
}
