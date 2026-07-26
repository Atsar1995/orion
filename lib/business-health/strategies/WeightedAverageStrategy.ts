import type {
  CategoryScoreResult,
  OverallScoreResult,
  ScoringStrategy,
} from "@/lib/business-health/interfaces/ScoringStrategy";
import type { CategoryScore } from "@/lib/business-health/models/HealthScore";
import type { CategoryDefinition } from "@/lib/business-health/models/Category";
import type { KPI } from "@/lib/business-health/models/KPI";
import type { ScoreBreakdown } from "@/lib/business-health/models/ScoreBreakdown";
import { evaluateKPIScore } from "@/lib/business-health/utils/HealthUtils";
import {
  aggregateConfidence,
  clampScore,
  isValidWeight,
  weightedAverage,
} from "@/lib/business-health/utils/WeightCalculator";

/** Default composite scoring strategy — weighted averages at KPI, category, and overall levels. */
export class WeightedAverageStrategy implements ScoringStrategy {
  readonly name = "weighted-average";

  calculateKPIScore(kpi: KPI): number {
    return clampScore(evaluateKPIScore(kpi));
  }

  calculateCategoryScore(kpis: KPI[]): CategoryScoreResult {
    if (kpis.length === 0) {
      return {
        score: 0,
        confidence: 0,
        breakdown: [],
      };
    }

    const validKpis = kpis.filter((kpi) => isValidWeight(kpi.weight));
    const scoringKpis = validKpis.length > 0 ? validKpis : kpis;
    const scores = scoringKpis.map((kpi) => this.calculateKPIScore(kpi));
    const weights = scoringKpis.map((kpi) => kpi.weight);
    const confidences = scoringKpis.map((kpi) => clampScore(kpi.confidence));
    const categoryScore = weightedAverage(scores, weights);
    const confidence = aggregateConfidence(confidences, weights);

    const breakdown: ScoreBreakdown[] = scoringKpis.map((kpi) => {
      const kpiScore = this.calculateKPIScore(kpi);
      const contribution = Number((kpiScore - categoryScore).toFixed(1));

      return {
        category: kpi.name,
        contribution,
        explanation: `${kpi.name} scored ${kpiScore}/100 from ${kpi.source}.`,
        positiveContributions: contribution >= 0 ? [`${kpi.name}: +${contribution.toFixed(1)}`] : [],
        negativeContributions: contribution < 0 ? [`${kpi.name}: ${contribution.toFixed(1)}`] : [],
      };
    });

    return {
      score: clampScore(categoryScore),
      confidence: clampScore(confidence),
      breakdown,
    };
  }

  calculateOverallScore(
    categoryScores: CategoryScore[],
    categories: CategoryDefinition[],
  ): OverallScoreResult {
    if (categoryScores.length === 0) {
      return {
        overallScore: 0,
        confidence: 0,
        breakdown: [],
      };
    }

    const categoryWeightMap = new Map(categories.map((category) => [category.id, category.weight]));
    const scores = categoryScores.map((entry) => entry.score);
    const weights = categoryScores.map(
      (entry) => categoryWeightMap.get(entry.categoryId) ?? entry.weight,
    );
    const confidences = categoryScores.map((entry) => entry.confidence);
    const overallScore = weightedAverage(scores, weights);
    const confidence = aggregateConfidence(confidences, weights);

    const breakdown: ScoreBreakdown[] = categoryScores.map((entry) => {
      const weight = categoryWeightMap.get(entry.categoryId) ?? entry.weight;
      const contribution = Number(((entry.score - overallScore) * weight).toFixed(1));
      const positives = entry.breakdown
        .filter((item) => item.contribution >= 0)
        .map((item) => `${item.category}: +${item.contribution.toFixed(1)}`);
      const negatives = entry.breakdown
        .filter((item) => item.contribution < 0)
        .map((item) => `${item.category}: ${item.contribution.toFixed(1)}`);

      return {
        category: entry.categoryName,
        contribution,
        explanation: `${entry.categoryName} scored ${entry.score}/100 with weight ${weight.toFixed(2)}.`,
        positiveContributions: positives,
        negativeContributions: negatives,
      };
    });

    return {
      overallScore: clampScore(overallScore),
      confidence: clampScore(confidence),
      breakdown,
    };
  }
}
