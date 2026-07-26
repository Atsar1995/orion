import type { ScoringStrategy } from "@/lib/business-health/interfaces/ScoringStrategy";
import type { KPI } from "@/lib/business-health/models/KPI";
import { buildCategoryScore, type CategoryScorer } from "@/lib/business-health/scorers/CategoryScorer";

export class RevenueScorer implements CategoryScorer {
  readonly categoryId = "revenue" as const;
  readonly categoryName = "Revenue";
  readonly defaultWeight = 0.25;

  constructor(private readonly strategy: ScoringStrategy) {}

  score(kpis: KPI[]) {
    return buildCategoryScore(this.categoryId, this.categoryName, this.defaultWeight, kpis, this.strategy);
  }
}
