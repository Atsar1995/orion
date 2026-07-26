import {
  DEFAULT_CONFIDENCE_RULES,
  type ConfidenceRules,
} from "@/lib/explainability/engine/ConfidenceRules";

/** Central configuration for the explainability integration layer. */
export type ExplainabilityConfig = {
  /** Maximum contributors surfaced in narrative and explanation highlights. */
  readonly highlightLimit: number;
  /** Confidence engine rule set — thresholds and deductions only. */
  readonly confidenceRules: ConfidenceRules;
  /** Upper bound for synchronous pipeline execution in integration tests (ms). */
  readonly maxExecutionMs: number;
};

export const DEFAULT_EXPLAINABILITY_CONFIG: ExplainabilityConfig = {
  highlightLimit: 3,
  confidenceRules: DEFAULT_CONFIDENCE_RULES,
  maxExecutionMs: 250,
};

/** Creates an explainability configuration with optional overrides. */
export function createExplainabilityConfig(
  overrides: Partial<ExplainabilityConfig> = {},
): ExplainabilityConfig {
  return {
    ...DEFAULT_EXPLAINABILITY_CONFIG,
    ...overrides,
    confidenceRules: overrides.confidenceRules ?? DEFAULT_EXPLAINABILITY_CONFIG.confidenceRules,
  };
}
