import type { CategoryScore } from "@/lib/business-health/models/HealthScore";
import type { CategoryDefinition } from "@/lib/business-health/models/Category";
import type { KPI } from "@/lib/business-health/models/KPI";
import type { ScoreBreakdown } from "@/lib/business-health/models/ScoreBreakdown";

export type CategoryScoreResult = {
  score: number;
  confidence: number;
  breakdown: ScoreBreakdown[];
};

export type OverallScoreResult = {
  overallScore: number;
  confidence: number;
  breakdown: ScoreBreakdown[];
};

/** Strategy contract for KPI, category, and overall scoring (DC-009). */
export interface ScoringStrategy {
  readonly name: string;
  calculateKPIScore(kpi: KPI): number;
  calculateCategoryScore(kpis: KPI[]): CategoryScoreResult;
  calculateOverallScore(
    categoryScores: CategoryScore[],
    categories: CategoryDefinition[],
  ): OverallScoreResult;
}
