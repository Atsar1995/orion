/**
 * ORION Commercial Intelligence — Revenue Analytics (Mission P-008.5).
 * D-005 domain. Computes insight from Party, Commercial, and Agreements — does not own transactional state.
 */

export type ForecastType = "revenue" | "pipeline" | "renewal" | "opportunity";

export type CommercialKpiCategory =
  | "pipeline"
  | "revenue"
  | "velocity"
  | "relationship"
  | "renewal";

export type CommercialAlertSeverity = "critical" | "high" | "medium" | "low";

export type CommercialInsightCategory =
  | "pipeline_health"
  | "revenue_growth"
  | "account_risk"
  | "renewal_risk"
  | "opportunity_stall"
  | "relationship";

export type RecommendationCategory =
  | "priority_account"
  | "pipeline_action"
  | "pricing_review"
  | "renewal_action";

export type CommercialKpi = {
  readonly id: string;
  readonly label: string;
  readonly category: CommercialKpiCategory;
  readonly value: string;
  readonly numericValue?: number;
  readonly trend?: string;
  readonly status?: "healthy" | "warning" | "critical";
};

export type ForecastRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly forecastType: ForecastType;
  readonly period: string;
  readonly projectedValue: number;
  readonly confidence: number;
  readonly basisCount: number;
  readonly createdAt: string;
};

export type ForecastHistoryRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly period: string;
  readonly projectedValue: number;
  readonly actualValue?: number;
  readonly accuracy?: number;
  readonly recordedAt: string;
};

export type PipelineSnapshot = {
  readonly capturedAt: string;
  readonly totalValue: number;
  readonly openCount: number;
  readonly weightedValue: number;
  readonly byStage: readonly { stage: string; count: number; value: number }[];
  readonly byOwner: readonly { owner: string; count: number; value: number }[];
};

export type RelationshipHealthRecord = {
  readonly partyId: string;
  readonly partyName: string;
  readonly score: number;
  readonly status: "healthy" | "at_risk" | "critical";
  readonly drivers: readonly string[];
  readonly openOpportunityValue: number;
  readonly activeContractValue: number;
};

export type CommercialInsight = {
  readonly id: string;
  readonly category: CommercialInsightCategory;
  readonly title: string;
  readonly summary: string;
  readonly why: string;
  readonly likelyNext: string;
  readonly impact: CommercialAlertSeverity;
};

export type CommercialAlert = {
  readonly id: string;
  readonly organizationId: string;
  readonly severity: CommercialAlertSeverity;
  readonly title: string;
  readonly message: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly createdAt: string;
};

export type CommercialRecommendation = {
  readonly id: string;
  readonly category: RecommendationCategory;
  readonly priority: number;
  readonly title: string;
  readonly description: string;
  readonly rationale: string;
  readonly expectedImpact: string;
  readonly entityId?: string;
};

export type BenchmarkRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly metric: string;
  readonly label: string;
  readonly actual: number;
  readonly benchmark: number;
  readonly unit: string;
  readonly variance: number;
};

export type CommercialIntelligenceEngineEventType =
  | "ForecastUpdated"
  | "PipelineHealthChanged"
  | "CommercialAlertRaised"
  | "AccountRiskDetected"
  | "RecommendationGenerated";

export type PublishCommercialIntelligenceEventInput = {
  eventType: CommercialIntelligenceEngineEventType;
  entityId: string;
  actorId?: string;
  actorName?: string;
  payload?: Record<string, string>;
};
