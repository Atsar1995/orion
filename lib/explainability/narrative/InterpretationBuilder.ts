import type { HealthScore } from "@/lib/business-health/models/HealthScore";
import {
  EXECUTIVE_NARRATIVE_TEMPLATES,
  renderNarrativeTemplate,
  type ExecutiveNarrativeTemplateId,
} from "@/lib/explainability/narrative/NarrativeTemplates";
import type { Confidence } from "@/lib/explainability/models/Confidence";
import { selectTopConcern } from "@/lib/explainability/narrative/ConcernExtractor";
import { selectTopStrength } from "@/lib/explainability/narrative/StrengthExtractor";

/** Structured interpretation output traceable to selected template and variables. */
export type ExecutiveInterpretation = {
  readonly text: string;
  readonly templateId: ExecutiveNarrativeTemplateId;
  readonly variables: Record<string, string | number>;
};

export type InterpretationBuildInput = {
  readonly healthScore: HealthScore;
  readonly confidence: Confidence;
};

type InterpretationTemplateSelection = {
  readonly templateId: ExecutiveNarrativeTemplateId;
  readonly variables: Record<string, string | number>;
};

function isMixedPerformance(healthScore: HealthScore): boolean {
  const positives = healthScore.breakdown.filter((entry) => entry.contribution > 0);
  const negatives = healthScore.breakdown.filter((entry) => entry.contribution < 0);
  return positives.length > 0 && negatives.length > 0;
}

function isDecliningBusiness(healthScore: HealthScore): boolean {
  return (
    healthScore.overallScore < 60 ||
    healthScore.status === "poor" ||
    healthScore.status === "critical"
  );
}

function selectInterpretationTemplate(input: InterpretationBuildInput): InterpretationTemplateSelection {
  const { healthScore, confidence } = input;

  if (healthScore.breakdown.length === 0 && confidence.level === "insufficient") {
    return {
      templateId: "missingDataInterpretation",
      variables: {},
    };
  }

  if (confidence.level === "low" || confidence.level === "insufficient") {
    return {
      templateId: "lowConfidenceInterpretation",
      variables: {
        confidenceLevel: confidence.level,
        confidenceScore: confidence.score.toFixed(1),
      },
    };
  }

  if (isMixedPerformance(healthScore)) {
    const topPositive = selectTopStrength(healthScore.breakdown);
    const topNegative = selectTopConcern(healthScore.breakdown);

    if (topPositive && topNegative) {
      return {
        templateId: "mixedPerformanceInterpretation",
        variables: {
          score: healthScore.overallScore.toFixed(1),
          topPositive: topPositive.category,
          topNegative: topNegative.category,
        },
      };
    }
  }

  if (isDecliningBusiness(healthScore)) {
    return {
      templateId: "decliningBusiness",
      variables: {
        score: healthScore.overallScore.toFixed(1),
        status: healthScore.status,
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

/** Builds concise executive interpretation using structured templates. */
export class InterpretationBuilder {
  build(input: InterpretationBuildInput): ExecutiveInterpretation {
    const selection = selectInterpretationTemplate(input);

    return {
      text: renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES[selection.templateId], selection.variables),
      templateId: selection.templateId,
      variables: selection.variables,
    };
  }
}
