/** Unified confidence model for executive surfaces (EC-000). */
export type ConfidenceLabel = "high" | "medium" | "low";

export type ConfidenceScore = {
  value: number;
  label: ConfidenceLabel;
};

export type ConfidenceBreakdown = {
  dataFreshness: number;
  sourceCoverage: number;
  modelCertainty: number;
};
