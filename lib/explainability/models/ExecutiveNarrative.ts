/** Deterministic executive summary derived from Business Health evidence. */
export type ExecutiveNarrative = {
  /** One-sentence executive summary (≤ 20 words in production templates). */
  readonly summary: string;
  readonly strengths: readonly string[];
  readonly concerns: readonly string[];
  readonly interpretation: string;
};
