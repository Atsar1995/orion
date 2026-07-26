import type { Explanation } from "@/lib/explainability/models/Explanation";

/** Immutable aggregate output from a successful explainability pipeline run. */
export type ExplainabilitySnapshot = {
  readonly explanation: Explanation;
  readonly executionMs: number;
  readonly generatedAt: string;
};

export type ExplainabilityErrorCode =
  | "INVALID_HEALTH_SCORE"
  | "HEALTH_SCORE_FAILED"
  | "EMPTY_INPUT";

export type ExplainabilityError = {
  readonly code: ExplainabilityErrorCode;
  readonly message: string;
  readonly details?: readonly string[];
};

export type ExplainabilityEngineResult =
  | { readonly success: true; readonly data: ExplainabilitySnapshot }
  | { readonly success: false; readonly error: ExplainabilityError };

/** Type guard for successful explainability results. */
export function isExplainabilitySuccess(
  result: ExplainabilityEngineResult,
): result is { success: true; data: ExplainabilitySnapshot } {
  return result.success;
}
