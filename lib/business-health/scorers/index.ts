import type { ScoringStrategy } from "@/lib/business-health/interfaces/ScoringStrategy";
import { CustomerScorer } from "@/lib/business-health/scorers/CustomerScorer";
import { MarketingScorer } from "@/lib/business-health/scorers/MarketingScorer";
import { OperationsScorer } from "@/lib/business-health/scorers/OperationsScorer";
import { RevenueScorer } from "@/lib/business-health/scorers/RevenueScorer";
import type { CategoryScorer } from "@/lib/business-health/scorers/CategoryScorer";

export function createDefaultCategoryScorers(strategy: ScoringStrategy): CategoryScorer[] {
  return [
    new RevenueScorer(strategy),
    new MarketingScorer(strategy),
    new CustomerScorer(strategy),
    new OperationsScorer(strategy),
  ];
}

export { CustomerScorer } from "@/lib/business-health/scorers/CustomerScorer";
export { MarketingScorer } from "@/lib/business-health/scorers/MarketingScorer";
export { OperationsScorer } from "@/lib/business-health/scorers/OperationsScorer";
export { RevenueScorer } from "@/lib/business-health/scorers/RevenueScorer";
export type { CategoryScorer } from "@/lib/business-health/scorers/CategoryScorer";
