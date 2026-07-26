/** Explainability record for a category contribution to the overall score. */
export type ScoreBreakdown = {
  category: string;
  contribution: number;
  explanation: string;
  positiveContributions?: string[];
  negativeContributions?: string[];
};
