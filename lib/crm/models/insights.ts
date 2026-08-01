/** CRM Insights dashboard view model (Mission 16A.6). */

import type { CrmAlert, CrmRelationshipSegment } from "@/lib/crm/models/domain";
import type {
  ActivityEffectivenessResult,
  CrmExecutiveSummaryResult,
  DealRiskResult,
  PipelineHealthResult,
  RevenueForecastResult,
  SalesMomentumResult,
  WinRateTrendResult,
} from "@/lib/crm/models/intelligence";
import type { ExecutiveRecommendation } from "@/types/executive";

/** Explainable CRM recommendation — deterministic rules, AI-ready contract. */
export type CrmExplainableRecommendation = ExecutiveRecommendation & {
  reason: string;
  recommendedAction: string;
};

export type CrmBusinessHealthContribution = {
  customerHealth: { label: string; value: string; score: number };
  pipelineHealth: { label: string; value: string; score: number };
  salesPerformance: { label: string; value: string; score: number };
  activityCompletion: { label: string; value: string; score: number };
  overallScore: number;
};

export type CrmInsightsDashboard = {
  pipelineHealth: PipelineHealthResult;
  customerHealthDistribution: CrmRelationshipSegment[];
  revenueForecast: RevenueForecastResult;
  winRateTrend: WinRateTrendResult;
  activityEffectiveness: ActivityEffectivenessResult;
  opportunityRiskSummary: DealRiskResult;
  salesMomentum: SalesMomentumResult;
};

export type CrmBriefHighlights = {
  overnightChanges: string[];
  upcomingPriorities: string[];
};

/** Full CRM Insights page view model. */
export type CrmInsightsView = {
  executiveSummary: CrmExecutiveSummaryResult;
  dashboard: CrmInsightsDashboard;
  recommendations: CrmExplainableRecommendation[];
  alerts: CrmAlert[];
  businessHealth: CrmBusinessHealthContribution;
  briefHighlights: CrmBriefHighlights;
};
