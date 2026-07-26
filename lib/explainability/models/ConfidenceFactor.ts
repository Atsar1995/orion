/** Classification band for overall explainability confidence. */
export type ConfidenceLevel = "high" | "moderate" | "low" | "insufficient";

/** Reason a confidence score was adjusted or disclosed. */
export type ConfidenceFactorType =
  | "complete_dataset"
  | "missing_kpi"
  | "stale_data"
  | "provider_delay"
  | "estimated_value"
  | "incomplete_normalization"
  | "validation_failure";

/** Single factor influencing overall confidence. */
export type ConfidenceFactor = {
  readonly type: ConfidenceFactorType;
  readonly description: string;
  /** Impact on confidence score (positive or negative points). */
  readonly impact: number;
  /** Relative weight of this factor in the confidence model (0–1). */
  readonly weight: number;
};
