import type { CategoryScore, HealthScore } from "@/lib/business-health/models/HealthScore";
import type { Confidence } from "@/lib/explainability/models/Confidence";
import type { ExecutiveNarrative } from "@/lib/explainability/models/ExecutiveNarrative";
import type { ExplanationItem } from "@/lib/explainability/models/ExplanationItem";
import type { RecommendationContext } from "@/lib/explainability/models/RecommendationContext";

/** Complete explainability bundle for a Business Health assessment. */
export type Explanation = {
  readonly businessHealthScore: HealthScore;
  readonly confidence: Confidence;
  readonly categoryBreakdown: readonly CategoryScore[];
  readonly explanationItems: readonly ExplanationItem[];
  readonly executiveNarrative: ExecutiveNarrative;
  readonly recommendationContext: readonly RecommendationContext[];
  readonly generatedAt: string;
};
