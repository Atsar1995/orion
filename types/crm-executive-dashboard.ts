/**
 * ORION Commercial Executive Dashboard (Mission P-008.7).
 * Composes commercial, customer, and agreement intelligence — does not own transactional state.
 */

export type DashboardWidgetType = "kpi" | "chart" | "alert" | "list" | "trend";

export type ExecutiveAlertSeverity = "critical" | "high" | "medium" | "low";

export type ExecutiveAlertCategory =
  | "account_risk"
  | "stalled_opportunity"
  | "renewal_deadline"
  | "revenue_variance"
  | "relationship";

export type DashboardWidget = {
  readonly id: string;
  readonly type: DashboardWidgetType;
  readonly title: string;
  readonly priority: number;
  readonly summary: string;
  readonly drillDownHref?: string;
};

export type ExecutiveAlert = {
  readonly id: string;
  readonly severity: ExecutiveAlertSeverity;
  readonly category: ExecutiveAlertCategory;
  readonly title: string;
  readonly message: string;
  readonly recommendedAction: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly drillDownHref?: string;
  readonly createdAt: string;
};

export type CommercialSnapshotRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly capturedAt: string;
  readonly pipelineValue: number;
  readonly forecastRevenue: number;
  readonly revenueWon: number;
  readonly activeContracts: number;
  readonly relationshipHealthIndex: number;
};

export type PerformanceTrendRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly period: string;
  readonly pipelineValue: number;
  readonly revenueWon: number;
  readonly winRate: number;
  readonly relationshipHealthIndex: number;
};

export type DrillDownTarget = {
  readonly label: string;
  readonly href: string;
  readonly entityType: string;
  readonly entityId?: string;
};

export type PublishExecutiveDashboardEventInput = {
  readonly eventType:
    | "ExecutiveDashboardRefreshed"
    | "ExecutiveAlertRaised"
    | "ExecutiveReportGenerated"
    | "DashboardSnapshotCaptured";
  readonly entityId: string;
  readonly actorId?: string;
  readonly actorName?: string;
  readonly payload?: Record<string, unknown>;
};
