import type {
  BudgetActualRecord,
  ExecutiveRecommendationRecord,
  FinancialAlertRecord,
  FinancialInsightRecord,
  FinancialKpiRecord,
  FinancialTrendRecord,
  ForecastInterfaceRecord,
} from "@/types/finance-executive-intelligence";

export type FinancialExecutiveSummary = {
  readonly healthScore: number;
  readonly healthTrend: "up" | "down" | "stable";
  readonly cashPosition: string;
  readonly revenue: string;
  readonly netProfit: string;
  readonly operatingMargin: string;
  readonly alertCount: number;
  readonly criticalAlerts: number;
  readonly briefingLine: string;
};

export type FinancialExecutiveDashboardView = {
  readonly summary: FinancialExecutiveSummary;
  readonly kpis: readonly FinancialKpiRecord[];
  readonly alerts: readonly FinancialAlertRecord[];
  readonly recommendations: readonly ExecutiveRecommendationRecord[];
  readonly trends: readonly FinancialTrendRecord[];
  readonly variance: readonly BudgetActualRecord[];
  readonly forecasts: readonly ForecastInterfaceRecord[];
  readonly insights: readonly FinancialInsightRecord[];
  readonly liquidityIndicators: {
    readonly currentRatio: number;
    readonly quickRatio: number;
    readonly workingCapital: number;
    readonly cashPosition: number;
  };
  readonly profitability: {
    readonly revenue: number;
    readonly grossProfit: number;
    readonly netProfit: number;
    readonly operatingMargin: number;
    readonly ebitda: number;
  };
  readonly periodId: string;
  readonly generatedAt: string;
};

export type DailyExecutiveSummaryView = {
  readonly date: string;
  readonly summary: FinancialExecutiveSummary;
  readonly topAlerts: readonly FinancialAlertRecord[];
  readonly topRecommendations: readonly ExecutiveRecommendationRecord[];
};

export type VarianceAnalysisView = {
  readonly periodId: string;
  readonly lines: readonly BudgetActualRecord[];
  readonly totalBudget: number;
  readonly totalActual: number;
  readonly totalVariance: number;
};

export type TrendAnalysisView = {
  readonly periods: readonly FinancialTrendRecord[];
  readonly revenueTrend: "up" | "down" | "stable";
  readonly expenseTrend: "up" | "down" | "stable";
  readonly revenueTrendPercent: number;
  readonly expenseTrendPercent: number;
};
