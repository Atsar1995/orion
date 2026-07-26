import type { Confidence } from "@/lib/explainability/models/Confidence";
import type {
  ConfidenceFactor,
  ConfidenceFactorType,
  ConfidenceLevel,
} from "@/lib/explainability/models/ConfidenceFactor";
import {
  DEFAULT_CONFIDENCE_RULES,
  type ConfidenceRules,
} from "@/lib/explainability/engine/ConfidenceRules";

/** Normalized quality signals used for deterministic confidence scoring. */
export type ConfidenceAssessmentInput = {
  readonly missingKpiCount: number;
  readonly staleKpiCount: number;
  readonly unavailableProviderCount: number;
  readonly estimatedValueCount: number;
  readonly incompleteNormalizationCount: number;
  readonly validationFailureCount: number;
  readonly generatedAt: string;
};

type DeductionDefinition = {
  readonly type: ConfidenceFactorType;
  readonly getCount: (input: ConfidenceAssessmentInput) => number;
  readonly getUnitDeduction: (rules: ConfidenceRules) => number;
  readonly getWeight: (rules: ConfidenceRules) => number;
  readonly describe: (count: number, totalDeduction: number) => string;
};

const DEDUCTION_DEFINITIONS: readonly DeductionDefinition[] = [
  {
    type: "missing_kpi",
    getCount: (input) => input.missingKpiCount,
    getUnitDeduction: (rules) => rules.deductions.missingKpi,
    getWeight: (rules) => rules.factorWeights.missingKpi,
    describe: (count, total) =>
      `${count} expected KPI${count === 1 ? "" : "s"} missing from the assessment (−${total}).`,
  },
  {
    type: "stale_data",
    getCount: (input) => input.staleKpiCount,
    getUnitDeduction: (rules) => rules.deductions.staleData,
    getWeight: (rules) => rules.factorWeights.staleData,
    describe: (count, total) =>
      `${count} KPI${count === 1 ? "" : "s"} exceed freshness threshold (−${total}).`,
  },
  {
    type: "provider_delay",
    getCount: (input) => input.unavailableProviderCount,
    getUnitDeduction: (rules) => rules.deductions.providerUnavailable,
    getWeight: (rules) => rules.factorWeights.providerUnavailable,
    describe: (count, total) =>
      `${count} provider${count === 1 ? "" : "s"} unavailable (−${total}).`,
  },
  {
    type: "estimated_value",
    getCount: (input) => input.estimatedValueCount,
    getUnitDeduction: (rules) => rules.deductions.estimatedValue,
    getWeight: (rules) => rules.factorWeights.estimatedValue,
    describe: (count, total) =>
      `${count} estimated KPI value${count === 1 ? "" : "s"} detected (−${total}).`,
  },
  {
    type: "incomplete_normalization",
    getCount: (input) => input.incompleteNormalizationCount,
    getUnitDeduction: (rules) => rules.deductions.incompleteNormalization,
    getWeight: (rules) => rules.factorWeights.incompleteNormalization,
    describe: (count, total) =>
      `${count} incomplete normalization issue${count === 1 ? "" : "s"} (−${total}).`,
  },
  {
    type: "validation_failure",
    getCount: (input) => input.validationFailureCount,
    getUnitDeduction: (rules) => rules.deductions.validationFailure,
    getWeight: (rules) => rules.factorWeights.validationFailure,
    describe: (count, total) =>
      `${count} validation failure${count === 1 ? "" : "s"} (−${total}).`,
  },
];

/** Clamps a confidence score to the inclusive 0–100 range. */
export function clampConfidenceScore(score: number): number {
  if (score < 0) {
    return 0;
  }

  if (score > 100) {
    return 100;
  }

  return Number(score.toFixed(1));
}

/** Maps a numeric score to an executive confidence level band. */
export function resolveConfidenceLevel(
  score: number,
  thresholds: ConfidenceRules["levelThresholds"],
): ConfidenceLevel {
  const clamped = clampConfidenceScore(score);

  if (clamped >= thresholds.high) {
    return "high";
  }

  if (clamped >= thresholds.moderate) {
    return "moderate";
  }

  if (clamped >= thresholds.low) {
    return "low";
  }

  return "insufficient";
}

/** Deterministic confidence calculation from normalized quality signals. */
export function calculateConfidence(
  input: ConfidenceAssessmentInput,
  rules: ConfidenceRules = DEFAULT_CONFIDENCE_RULES,
): Confidence {
  let score = rules.startScore;
  const factors: ConfidenceFactor[] = [];

  for (const definition of DEDUCTION_DEFINITIONS) {
    const count = definition.getCount(input);
    if (count <= 0) {
      continue;
    }

    const unitDeduction = definition.getUnitDeduction(rules);
    const totalDeduction = count * unitDeduction;
    score -= totalDeduction;

    factors.push({
      type: definition.type,
      description: definition.describe(count, totalDeduction),
      impact: -totalDeduction,
      weight: definition.getWeight(rules),
    });
  }

  if (factors.length === 0) {
    factors.push({
      type: "complete_dataset",
      description: "All expected KPI signals are present, fresh, and validated.",
      impact: 0,
      weight: 1,
    });
  }

  const finalScore = clampConfidenceScore(score);

  return {
    score: finalScore,
    level: resolveConfidenceLevel(finalScore, rules.levelThresholds),
    factors,
    generatedAt: input.generatedAt,
  };
}
