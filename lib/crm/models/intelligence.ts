import type { HealthStatus } from "@/lib/command-center-data";

/** Customer health score output from business rules. */
export type CustomerHealthScoreResult = {
  score: number;
  trend: string;
  status: HealthStatus;
  summary: string;
  drivers: Array<{ label: string; status: HealthStatus; detail: string }>;
};

/** Deal-level risk assessment. */
export type DealRiskItem = {
  dealName: string;
  customer: string;
  value: string;
  riskScore: number;
  riskLevel: "high" | "medium" | "low";
  status: HealthStatus;
  reason: string;
};

export type DealRiskResult = {
  overallStatus: HealthStatus;
  summary: string;
  highRiskCount: number;
  deals: DealRiskItem[];
};

/** Pipeline health from stage distribution and velocity rules. */
export type PipelineHealthResult = {
  score: number;
  status: HealthStatus;
  trend: string;
  summary: string;
  stageBalance: "healthy" | "top-heavy" | "bottom-heavy";
  conversionRate: number;
};

/** Stalled or at-risk lost opportunity signal. */
export type LostOpportunityItem = {
  dealName: string;
  customer: string;
  value: string;
  stage: string;
  probability: number;
  reason: string;
  status: HealthStatus;
};

export type LostOpportunityResult = {
  count: number;
  summary: string;
  opportunities: LostOpportunityItem[];
};

/** Ranked follow-up action from relationship rules. */
export type FollowUpPriorityItem = {
  rank: number;
  customer: string;
  action: string;
  description: string;
  urgency: "immediate" | "this-week" | "scheduled";
  status: HealthStatus;
};

export type FollowUpPriorityResult = {
  dueCount: number;
  summary: string;
  items: FollowUpPriorityItem[];
};

/** Weighted revenue forecast from open pipeline. */
export type RevenueForecastResult = {
  weightedForecast: number;
  weightedForecastDisplay: string;
  conservativeForecast: number;
  conservativeForecastDisplay: string;
  optimisticForecast: number;
  optimisticForecastDisplay: string;
  closingThisQuarter: number;
  closingThisQuarterDisplay: string;
  summary: string;
};

/** Composed executive narrative from intelligence signals. */
export type CrmExecutiveSummaryResult = {
  narrative: string;
  briefingLine: string;
  headline: string;
  status: HealthStatus;
  keyPoints: string[];
};

/** Win rate trend from closed opportunities. */
export type WinRateTrendResult = {
  currentWinRate: number;
  previousWinRate: number;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  summary: string;
  status: HealthStatus;
};

/** Activity completion and overdue effectiveness. */
export type ActivityEffectivenessResult = {
  score: number;
  completionRate: number;
  overdueRate: number;
  summary: string;
  status: HealthStatus;
};

/** Composite sales momentum score. */
export type SalesMomentumResult = {
  score: number;
  status: HealthStatus;
  trend: string;
  summary: string;
  drivers: Array<{ label: string; status: HealthStatus }>;
};

/** Aggregated CRM workspace intelligence (Mission 16B / 16A.6). */
export type CrmWorkspaceIntelligence = {
  customerHealthScore: CustomerHealthScoreResult;
  dealRisk: DealRiskResult;
  pipelineHealth: PipelineHealthResult;
  lostOpportunities: LostOpportunityResult;
  followUpPriority: FollowUpPriorityResult;
  revenueForecast: RevenueForecastResult;
  winRateTrend: WinRateTrendResult;
  activityEffectiveness: ActivityEffectivenessResult;
  salesMomentum: SalesMomentumResult;
  executiveSummary: CrmExecutiveSummaryResult;
};
