/**
 * Finance Domain — Executive Financial Intelligence types (Mission P-009.7).
 * Read-only analytics layer — does not alter accounting records.
 * @see docs/Finance/Blueprints/D-007_Finance_Domain_Blueprint.md
 */

/** Executive KPI identifiers. */
export type FinancialKpiKey =
  | "revenue"
  | "gross_profit"
  | "net_profit"
  | "operating_margin"
  | "ebitda"
  | "cash_position"
  | "working_capital"
  | "current_ratio"
  | "quick_ratio"
  | "debt_ratio"
  | "expense_trend"
  | "revenue_trend"
  | "average_transaction_value"
  | "collection_performance"
  | "organization_health_score";

export type FinancialKpiRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly key: FinancialKpiKey;
  readonly label: string;
  readonly value: number;
  readonly displayValue: string;
  readonly unit: "currency" | "percent" | "ratio" | "score" | "count";
  readonly trend: "up" | "down" | "stable";
  readonly trendPercent: number;
  readonly periodId: string;
  readonly updatedAt: string;
};

/** Financial alert severity levels. */
export type FinancialAlertSeverity = "critical" | "high" | "medium" | "low";

export type FinancialAlertCategory =
  | "negative_cash_trend"
  | "declining_revenue"
  | "expense_spike"
  | "margin_deterioration"
  | "budget_variance"
  | "unusual_transaction"
  | "period_close_risk"
  | "liquidity_warning";

export type FinancialAlertRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly severity: FinancialAlertSeverity;
  readonly category: FinancialAlertCategory;
  readonly title: string;
  readonly message: string;
  readonly recommendedAction: string;
  readonly periodId?: string;
  readonly createdAt: string;
};

export type ExecutiveRecommendationRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly priority: number;
  readonly title: string;
  readonly summary: string;
  readonly rationale: string;
  readonly category: "cash" | "revenue" | "expense" | "risk" | "period" | "forecast";
  readonly createdAt: string;
};

export type FinancialTrendRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly period: string;
  readonly periodId: string;
  readonly revenue: number;
  readonly expenses: number;
  readonly netProfit: number;
  readonly cashPosition: number;
  readonly healthScore: number;
};

export type BudgetActualRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly category: string;
  readonly budgetAmount: number;
  readonly actualAmount: number;
  readonly variance: number;
  readonly variancePercent: number;
  readonly periodId: string;
};

export type ForecastInterfaceRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly horizon: "30d" | "60d" | "90d";
  readonly projectedRevenue: number;
  readonly projectedExpenses: number;
  readonly projectedCash: number;
  readonly confidence: "high" | "medium" | "low";
  readonly generatedAt: string;
};

/** Intelligence-produced event types (D-008 extension). */
export type FinancialIntelligenceEventType =
  | "FinancialInsightGenerated"
  | "ExecutiveAlertCreated"
  | "KPIUpdated"
  | "ForecastGenerated"
  | "HealthScoreUpdated";

export type PublishFinancialIntelligenceEventInput = {
  readonly eventType: FinancialIntelligenceEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};

export type FinancialInsightRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly title: string;
  readonly summary: string;
  readonly impact: "critical" | "high" | "medium" | "low";
  readonly category: string;
  readonly generatedAt: string;
};
