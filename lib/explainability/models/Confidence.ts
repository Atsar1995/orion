import type {
  ConfidenceFactor,
  ConfidenceLevel,
} from "@/lib/explainability/models/ConfidenceFactor";

/** Overall confidence assessment for a Business Health explanation. */
export type Confidence = {
  /** Normalized confidence score (0–100). */
  readonly score: number;
  readonly level: ConfidenceLevel;
  readonly factors: readonly ConfidenceFactor[];
  readonly generatedAt: string;
};
