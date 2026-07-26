/** Configurable level thresholds for confidence classification. */
export type ConfidenceLevelThresholds = {
  readonly high: number;
  readonly moderate: number;
  readonly low: number;
};

/** Per-issue deduction amounts applied to the starting confidence score. */
export type ConfidenceDeductionRules = {
  readonly missingKpi: number;
  readonly staleData: number;
  readonly providerUnavailable: number;
  readonly estimatedValue: number;
  readonly incompleteNormalization: number;
  readonly validationFailure: number;
};

/** Confidence engine configuration — constants and thresholds only. */
export type ConfidenceRules = {
  readonly startScore: number;
  readonly deductions: ConfidenceDeductionRules;
  readonly factorWeights: ConfidenceDeductionRules;
  readonly levelThresholds: ConfidenceLevelThresholds;
  /** KPI age in milliseconds after which data is considered stale. */
  readonly staleAfterMs: number;
};

export const DEFAULT_CONFIDENCE_RULES: ConfidenceRules = {
  startScore: 100,
  deductions: {
    missingKpi: 8,
    staleData: 6,
    providerUnavailable: 12,
    estimatedValue: 5,
    incompleteNormalization: 10,
    validationFailure: 15,
  },
  factorWeights: {
    missingKpi: 0.2,
    staleData: 0.15,
    providerUnavailable: 0.2,
    estimatedValue: 0.1,
    incompleteNormalization: 0.15,
    validationFailure: 0.2,
  },
  levelThresholds: {
    high: 75,
    moderate: 60,
    low: 40,
  },
  staleAfterMs: 4 * 60 * 60 * 1000,
};
