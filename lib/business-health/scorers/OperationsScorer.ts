import type { ScoringStrategy } from "@/lib/business-health/interfaces/ScoringStrategy";
import type { KPI } from "@/lib/business-health/models/KPI";
import { buildCategoryScore, type CategoryScorer } from "@/lib/business-health/scorers/CategoryScorer";

export class OperationsScorer implements CategoryScorer {
  readonly categoryId = "operations" as const;
  readonly categoryName = "Operations";
  readonly defaultWeight = 0.15;

  constructor(private readonly strategy: ScoringStrategy) {}

  score(kpis: KPI[]) {
    return buildCategoryScore(this.categoryId, this.categoryName, this.defaultWeight, kpis, this.strategy);
  }
}
