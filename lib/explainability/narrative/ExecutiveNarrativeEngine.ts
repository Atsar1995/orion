import type { HealthScore } from "@/lib/business-health/models/HealthScore";
import { ConcernExtractor } from "@/lib/explainability/narrative/ConcernExtractor";
import { ExecutiveSummaryBuilder } from "@/lib/explainability/narrative/ExecutiveSummaryBuilder";
import { InterpretationBuilder } from "@/lib/explainability/narrative/InterpretationBuilder";
import {
  EXECUTIVE_NARRATIVE_TEMPLATES,
  renderNarrativeTemplate,
} from "@/lib/explainability/narrative/NarrativeTemplates";
import { StrengthExtractor } from "@/lib/explainability/narrative/StrengthExtractor";
import type { Confidence } from "@/lib/explainability/models/Confidence";
import type { ExecutiveNarrative } from "@/lib/explainability/models/ExecutiveNarrative";

/** Input bundle for deterministic executive narrative generation. */
export type ExecutiveNarrativeInput = {
  readonly healthScore: HealthScore;
  readonly confidence: Confidence;
  readonly highlightLimit?: number;
};

/** Orchestrates deterministic executive narrative generation. */
export class ExecutiveNarrativeEngine {
  private readonly summaryBuilder: ExecutiveSummaryBuilder;
  private readonly strengthExtractor: StrengthExtractor;
  private readonly concernExtractor: ConcernExtractor;
  private readonly interpretationBuilder: InterpretationBuilder;

  constructor(
    summaryBuilder: ExecutiveSummaryBuilder = new ExecutiveSummaryBuilder(),
    strengthExtractor: StrengthExtractor = new StrengthExtractor(),
    concernExtractor: ConcernExtractor = new ConcernExtractor(),
    interpretationBuilder: InterpretationBuilder = new InterpretationBuilder(),
  ) {
    this.summaryBuilder = summaryBuilder;
    this.strengthExtractor = strengthExtractor;
    this.concernExtractor = concernExtractor;
    this.interpretationBuilder = interpretationBuilder;
  }

  generate(input: ExecutiveNarrativeInput): ExecutiveNarrative {
    const highlightLimit = input.highlightLimit ?? 3;
    const summary = this.summaryBuilder.build({
      healthScore: input.healthScore,
      confidence: input.confidence,
    });
    const strengths = this.buildStrengths(input, highlightLimit);
    const concerns = this.buildConcerns(input, highlightLimit);
    const interpretation = this.interpretationBuilder.build({
      healthScore: input.healthScore,
      confidence: input.confidence,
    });

    return {
      summary: summary.combinedSummary,
      strengths,
      concerns,
      interpretation: `${interpretation.text} ${summary.confidenceSummary}`.trim(),
    };
  }

  private buildStrengths(input: ExecutiveNarrativeInput, highlightLimit: number): readonly string[] {
    const extracted = this.strengthExtractor.extract(input.healthScore.breakdown, highlightLimit);

    if (extracted.length === 0) {
      return [renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.noStrengths, {})];
    }

    return extracted.map((contributor) =>
      renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.strengthBullet, {
        category: contributor.category,
        contribution: contributor.absoluteContribution.toFixed(1),
      }),
    );
  }

  private buildConcerns(input: ExecutiveNarrativeInput, highlightLimit: number): readonly string[] {
    const extraction = this.concernExtractor.extract(
      input.healthScore.breakdown,
      input.confidence,
      highlightLimit,
    );

    const contributorConcerns = extraction.contributors.map((concern) => concern.message);
    const concerns =
      contributorConcerns.length === 0
        ? [renderNarrativeTemplate(EXECUTIVE_NARRATIVE_TEMPLATES.noConcerns, {})]
        : [...contributorConcerns];

    return [...concerns, ...extraction.confidenceConcerns];
  }
}
