import type { HealthScore } from "@/lib/business-health/models/HealthScore";
import {
  enforceExecutiveSummaryWordLimit,
  EXECUTIVE_NARRATIVE_TEMPLATES,
  renderNarrativeTemplate,
} from "@/lib/explainability/narrative/NarrativeTemplates";
import type { Confidence } from "@/lib/explainability/models/Confidence";
import { selectTopConcern } from "@/lib/explainability/narrative/ConcernExtractor";
import { selectTopStrength } from "@/lib/explainability/narrative/StrengthExtractor";

/** Structured executive summary output traceable to health and confidence data. */
export type ExecutiveSummary = {
  readonly healthSummary: string;
  readonly confidenceSummary: string;
  readonly combinedSummary: string;
  readonly templateId: string;
};

export type ExecutiveSummaryInput = {
  readonly healthScore: HealthScore;
  readonly confidence: Confidence;
};

function resolveConfidenceSummaryTemplate(confidence: Confidence) {
  switch (confidence.level) {
    case "high":
      return EXECUTIVE_NARRATIVE_TEMPLATES.confidenceSummaryHigh;
    case "moderate":
      return EXECUTIVE_NARRATIVE_TEMPLATES.confidenceSummaryModerate;
    case "low":
      return EXECUTIVE_NARRATIVE_TEMPLATES.confidenceSummaryLow;
    case "insufficient":
      return EXECUTIVE_NARRATIVE_TEMPLATES.confidenceSummaryInsufficient;
  }
}

function isDecliningBusiness(healthScore: HealthScore): boolean {
  return (
    healthScore.overallScore < 60 ||
    healthScore.status === "poor" ||
    healthScore.status === "critical"
  );
}

/** Creates deterministic business health and confidence executive summaries. */
export class ExecutiveSummaryBuilder {
  build(input: ExecutiveSummaryInput): ExecutiveSummary {
    const { healthScore, confidence } = input;
    const topPositive = selectTopStrength(healthScore.breakdown);
    const topNegative = selectTopConcern(healthScore.breakdown);

    const confidenceSummary = renderNarrativeTemplate(resolveConfidenceSummaryTemplate(confidence), {
      confidenceScore: confidence.score.toFixed(1),
    });

    if (healthScore.breakdown.length === 0 && confidence.level === "insufficient") {
      const healthSummary = renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.summaryMissingData, {
        confidenceLevel: confidence.level,
      });

      return {
        healthSummary,
        confidenceSummary,
        combinedSummary: enforceExecutiveSummaryWordLimit(healthSummary, healthSummary),
        templateId: EXECUTIVE_NARRATIVE_TEMPLATES.summaryMissingData.id,
      };
    }

    if (confidence.level === "low" || confidence.level === "insufficient") {
      const healthSummary = renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.summaryLowConfidence, {
        score: healthScore.overallScore.toFixed(1),
        status: healthScore.status,
        confidenceLevel: confidence.level,
      });

      return {
        healthSummary,
        confidenceSummary,
        combinedSummary: enforceExecutiveSummaryWordLimit(healthSummary, healthSummary),
        templateId: EXECUTIVE_NARRATIVE_TEMPLATES.summaryLowConfidence.id,
      };
    }

    if (!topPositive && !topNegative) {
      const healthSummary = renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.summaryNoDrivers, {
        score: healthScore.overallScore.toFixed(1),
        status: healthScore.status,
      });

      return {
        healthSummary,
        confidenceSummary,
        combinedSummary: enforceExecutiveSummaryWordLimit(healthSummary, healthSummary),
        templateId: EXECUTIVE_NARRATIVE_TEMPLATES.summaryNoDrivers.id,
      };
    }

    if (topPositive && topNegative) {
      const healthSummary = renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.summaryWithOffset, {
        score: healthScore.overallScore.toFixed(1),
        status: healthScore.status,
        topPositive: topPositive.category,
        topNegative: topNegative.category,
      });
      const fallback = renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.summaryStrengthOnly, {
        score: healthScore.overallScore.toFixed(1),
        status: healthScore.status,
        topPositive: topPositive.category,
      });

      return {
        healthSummary,
        confidenceSummary,
        combinedSummary: enforceExecutiveSummaryWordLimit(healthSummary, fallback),
        templateId: EXECUTIVE_NARRATIVE_TEMPLATES.summaryWithOffset.id,
      };
    }

    if (isDecliningBusiness(healthScore) && topNegative) {
      const healthSummary = renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.summaryDeclining, {
        score: healthScore.overallScore.toFixed(1),
        status: healthScore.status,
        topNegative: topNegative.category,
      });

      return {
        healthSummary,
        confidenceSummary,
        combinedSummary: enforceExecutiveSummaryWordLimit(healthSummary, healthSummary),
        templateId: EXECUTIVE_NARRATIVE_TEMPLATES.summaryDeclining.id,
      };
    }

    const healthSummary = renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.summaryStrengthOnly, {
      score: healthScore.overallScore.toFixed(1),
      status: healthScore.status,
      topPositive: topPositive?.category ?? "core categories",
    });

    return {
      healthSummary,
      confidenceSummary,
      combinedSummary: enforceExecutiveSummaryWordLimit(healthSummary, healthSummary),
      templateId: EXECUTIVE_NARRATIVE_TEMPLATES.summaryStrengthOnly.id,
    };
  }
}
