import type { ScoringStrategy } from "@/lib/business-health/interfaces/ScoringStrategy";
import type { KPI } from "@/lib/business-health/models/KPI";
import { buildCategoryScore, type CategoryScorer } from "@/lib/business-health/scorers/CategoryScorer";

export class CustomerScorer implements CategoryScorer {
  readonly categoryId = "customer" as const;
  readonly categoryName = "Customer";
  readonly defaultWeight = 0.2;

  constructor(private readonly strategy: ScoringStrategy) {}

  score(kpis: KPI[]) {
    return buildCategoryScore(this.categoryId, this.categoryName, this.defaultWeight, kpis, this.strategy);
  }
}
