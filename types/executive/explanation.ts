/** Explainability bundle for executive intelligence outputs. */
export type ExplainabilityQuestion =
  | "why-this-score"
  | "why-this-recommendation"
  | "why-this-priority"
  | "why-this-alert";

export type ExecutiveExplanation = {
  question: ExplainabilityQuestion;
  title: string;
  summary: string;
  factors: string[];
};
