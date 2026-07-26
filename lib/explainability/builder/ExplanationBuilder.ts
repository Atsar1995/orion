import type { HealthScore } from "@/lib/business-health/models/HealthScore";
import { ContributionAnalyzer } from "@/lib/explainability/builder/ContributionAnalyzer";
import { ExplanationFormatter } from "@/lib/explainability/builder/ExplanationFormatter";
import { NarrativeComposer } from "@/lib/explainability/builder/NarrativeComposer";
import type { Confidence } from "@/lib/explainability/models/Confidence";
import type { Explanation } from "@/lib/explainability/models/Explanation";
import type { RecommendationContext } from "@/lib/explainability/models/RecommendationContext";

/** Input bundle for deterministic explanation assembly. */
export type ExplanationBuildInput = {
  readonly healthScore: HealthScore;
  readonly confidence: Confidence;
  readonly recommendationContext?: readonly RecommendationContext[];
  readonly generatedAt?: string;
  readonly highlightLimit?: number;
};

/** Orchestrates contributor analysis, formatting, and narrative composition. */
export class ExplanationBuilder {
  private readonly analyzer: ContributionAnalyzer;
  private readonly formatter: ExplanationFormatter;
  private readonly composer: NarrativeComposer;

  constructor(
    analyzer: ContributionAnalyzer = new ContributionAnalyzer(),
    formatter: ExplanationFormatter = new ExplanationFormatter(),
    composer: NarrativeComposer = new NarrativeComposer(),
  ) {
    this.analyzer = analyzer;
    this.formatter = formatter;
    this.composer = composer;
  }

  build(input: ExplanationBuildInput): Explanation {
    const analysis = this.analyzer.analyze(
      input.healthScore.breakdown,
      input.healthScore.categoryScores,
    );

    const formatted = this.formatter.format({
      overallScore: input.healthScore.overallScore,
      status: input.healthScore.status,
      confidence: input.confidence,
      analysis,
      explanationItems: analysis.explanationItems,
      highlightLimit: input.highlightLimit,
    });

    const executiveNarrative = this.composer.compose({
      healthScore: input.healthScore,
      confidence: input.confidence,
      analysis,
      highlightLimit: input.highlightLimit,
    });

    return {
      businessHealthScore: input.healthScore,
      confidence: input.confidence,
      categoryBreakdown: input.healthScore.categoryScores,
      explanationItems: analysis.explanationItems,
      executiveNarrative: {
        ...executiveNarrative,
        interpretation: `${executiveNarrative.interpretation} ${formatted.confidenceNote}`.trim(),
      },
      recommendationContext: input.recommendationContext ?? [],
      generatedAt:
        input.generatedAt ?? input.confidence.generatedAt ?? input.healthScore.timestamp,
    };
  }
}
