/**
 * ORION Hospitality — Executive Intelligence & Operational Analytics (Mission P-007.7).
 * Transforms operational data into KPIs, trends, forecasts, insights, and recommendations.
 */

export type KpiCategory = "revenue" | "occupancy" | "guest" | "operational" | "commercial";

export type TrendDirection = "up" | "down" | "stable";

export type InsightCategory = "revenue" | "occupancy" | "guest_experience" | "operations" | "risk" | "opportunity";

export type ForecastHorizon = "7d" | "30d" | "90d";

export type KpiRecord = {
  readonly id: string;
  readonly label: string;
  readonly category: KpiCategory;
  readonly value: number;
  readonly unit: string;
  readonly formattedValue: string;
  readonly trend: TrendDirection;
  readonly changePercent: number;
  readonly benchmark?: number;
};

export type MetricRecord = {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly formattedValue: string;
  readonly period: string;
};

export type TrendRecord = {
  readonly id: string;
  readonly label: string;
  readonly direction: TrendDirection;
  readonly changePercent: number;
  readonly narrative: string;
  readonly period: string;
};

export type ForecastRecord = {
  readonly id: string;
  readonly label: string;
  readonly horizon: ForecastHorizon;
  readonly predictedValue: number;
  readonly formattedValue: string;
  readonly confidence: number;
  readonly drivers: readonly string[];
};

export type InsightRecord = {
  readonly id: string;
  readonly category: InsightCategory;
  readonly title: string;
  readonly narrative: string;
  readonly impact: "high" | "medium" | "low";
  readonly actionable: boolean;
};

export type AnalyticsAlertRecord = {
  readonly id: string;
  readonly severity: "critical" | "attention" | "info";
  readonly message: string;
  readonly source: string;
};

export type AnalyticsRecommendationRecord = {
  readonly priority: number;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly rationale: string;
};

export type BenchmarkRecord = {
  readonly id: string;
  readonly metric: string;
  readonly actual: number;
  readonly benchmark: number;
  readonly unit: string;
  readonly status: "above" | "at" | "below";
};

export type AnalyticsBriefSignals = {
  readonly operationalHealth: number;
  readonly revenueHealth: number;
  readonly guestExperienceHealth: number;
  readonly forecastOccupancy: number;
  readonly forecastRevenue: number;
  readonly criticalRiskCount: number;
  readonly insightCount: number;
};

export type PublishAnalyticsEventInput = {
  readonly eventType: "InsightGenerated" | "ForecastUpdated" | "KpiThresholdBreached" | "RecommendationIssued";
  readonly entityId: string;
  readonly actorId: string;
  readonly actorName?: string;
  readonly payload?: Record<string, unknown>;
};
