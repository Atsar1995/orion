import type { ScoringStrategy } from "@/lib/business-health/interfaces/ScoringStrategy";
import type { CategoryScore } from "@/lib/business-health/models/HealthScore";
import type { KPI, KPICategoryId } from "@/lib/business-health/models/KPI";

/** Contract for independent category evaluation. */
export interface CategoryScorer {
  readonly categoryId: KPICategoryId;
  readonly categoryName: string;
  readonly defaultWeight: number;
  score(kpis: KPI[]): CategoryScore;
}

export function buildCategoryScore(
  categoryId: KPICategoryId,
  categoryName: string,
  defaultWeight: number,
  kpis: KPI[],
  strategy: ScoringStrategy,
): CategoryScore {
  if (kpis.length === 0) {
    return {
      categoryId,
      categoryName,
      score: 0,
      confidence: 0,
      weight: defaultWeight,
      breakdown: [
        {
          category: categoryName,
          contribution: 0,
          explanation: `No KPI signals registered for ${categoryName}.`,
          positiveContributions: [],
          negativeContributions: [],
        },
      ],
    };
  }

  const result = strategy.calculateCategoryScore(kpis);

  return {
    categoryId,
    categoryName,
    weight: defaultWeight,
    score: result.score,
    confidence: result.confidence,
    breakdown: result.breakdown,
  };
}
