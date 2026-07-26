/** Domain context tags for future Recommendation Engine integration. */
export type RecommendationContextType =
  | "growth"
  | "revenue"
  | "marketing"
  | "retention"
  | "operations"
  | "seasonality";

/** Structured context supplied alongside an explanation for downstream recommendations. */
export type RecommendationContext = {
  readonly type: RecommendationContextType;
  readonly label: string;
  readonly description: string;
  readonly relatedCategories: readonly string[];
};
