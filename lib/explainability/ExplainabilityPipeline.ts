import type { HealthScore } from "@/lib/business-health/models/HealthScore";
import type { KPI } from "@/lib/business-health/models/KPI";
import { ExplanationBuilder } from "@/lib/explainability/builder/ExplanationBuilder";
import {
  ConfidenceEngine,
  type ConfidenceAssessmentContext,
} from "@/lib/explainability/engine/ConfidenceEngine";
import {
  createExplainabilityConfig,
  DEFAULT_EXPLAINABILITY_CONFIG,
  type ExplainabilityConfig,
} from "@/lib/explainability/ExplainabilityConfig";
import type { ExplainabilitySnapshot } from "@/lib/explainability/ExplainabilityResult";
import { ExecutiveNarrativeEngine } from "@/lib/explainability/narrative/ExecutiveNarrativeEngine";
import type { Explanation } from "@/lib/explainability/models/Explanation";
import type { RecommendationContext } from "@/lib/explainability/models/RecommendationContext";

/** Optional context supplied to the explainability pipeline. */
export type ExplainabilityContext = ConfidenceAssessmentContext & {
  readonly recommendationContext?: readonly RecommendationContext[];
};

export type ExplainabilityPipelineInput = {
  readonly healthScore: HealthScore;
  readonly context?: ExplainabilityContext;
};

/** Coordinates confidence, explanation, and executive narrative stages. */
export class ExplainabilityPipeline {
  private readonly config: ExplainabilityConfig;
  private readonly confidenceEngine: ConfidenceEngine;
  private readonly explanationBuilder: ExplanationBuilder;
  private readonly narrativeEngine: ExecutiveNarrativeEngine;

  constructor(config: ExplainabilityConfig = DEFAULT_EXPLAINABILITY_CONFIG) {
    this.config = createExplainabilityConfig(config);
    this.confidenceEngine = new ConfidenceEngine(this.config.confidenceRules);
    this.explanationBuilder = new ExplanationBuilder();
    this.narrativeEngine = new ExecutiveNarrativeEngine();
  }

  execute(input: ExplainabilityPipelineInput): ExplainabilitySnapshot {
    const startedAt = performance.now();
    const context = input.context ?? {};
    const highlightLimit = this.config.highlightLimit;

    const confidence = this.confidenceEngine.calculateFromHealthScore(input.healthScore, context);

    const explanation = this.explanationBuilder.build({
      healthScore: input.healthScore,
      confidence,
      recommendationContext: context.recommendationContext,
      generatedAt: context.referenceTime ?? input.healthScore.timestamp,
      highlightLimit,
    });

    const executiveNarrative = this.narrativeEngine.generate({
      healthScore: input.healthScore,
      confidence,
      highlightLimit,
    });

    const mergedExplanation: Explanation = {
      ...explanation,
      executiveNarrative,
      generatedAt: context.referenceTime ?? confidence.generatedAt ?? input.healthScore.timestamp,
    };

    return {
      explanation: mergedExplanation,
      executionMs: Number((performance.now() - startedAt).toFixed(3)),
      generatedAt: mergedExplanation.generatedAt,
    };
  }
}

/** Maps pipeline KPI context for confidence assessment. */
export function toConfidenceContext(
  context: ExplainabilityContext | undefined,
  kpis: readonly KPI[],
): ExplainabilityContext {
  return {
    ...context,
    kpis,
    expectedKpiCount: context?.expectedKpiCount ?? kpis.length,
  };
}
