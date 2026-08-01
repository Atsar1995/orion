import type { HealthStatus } from "@/lib/command-center-data";
import {
  CRM_INTELLIGENCE,
  getPipelineChartPoints,
  type CrmAlert,
  type CrmCustomerProfile,
  type CrmInsight,
  type CrmKpiMetric,
  type CrmPipelineStage,
  type CrmRecommendedAction,
  type CrmRelationshipSegment,
  type CrmTrendDirection,
} from "@/lib/crm";

// TD-002: Placeholder CRM insights until customer intelligence service integration

export type {
  CrmAlert,
  CrmCustomerProfile,
  CrmInsight,
  CrmKpiMetric,
  CrmPipelineStage,
  CrmRecommendedAction,
  CrmRelationshipSegment,
  CrmTrendDirection,
};

export const CRM_INSIGHTS_READY = true;

export {
  CRM_ENHANCED_KPIS,
  OPPORTUNITY_PIPELINE,
  PIPELINE_SUMMARY,
  RELATIONSHIP_HEALTH,
  CRM_EXECUTIVE_INSIGHTS,
  CRM_CUSTOMER_ALERTS,
  HIGHEST_VALUE_CUSTOMER,
  HIGHEST_RISK_CUSTOMER,
  LARGEST_OPPORTUNITY,
  CRM_RECOMMENDED_ACTION,
} from "@/lib/crm-business-data";

export { getPipelineChartPoints };

/** Customer health score computed via CRM intelligence engine. */
export const CUSTOMER_HEALTH_SCORE = {
  score: CRM_INTELLIGENCE.signals.customerHealthScore.score,
  trend: CRM_INTELLIGENCE.signals.customerHealthScore.trend,
  status: CRM_INTELLIGENCE.signals.customerHealthScore.status,
  summary: CRM_INTELLIGENCE.signals.customerHealthScore.summary,
  drivers: CRM_INTELLIGENCE.signals.customerHealthScore.drivers.map((driver) => ({
    label: driver.label,
    status: driver.status as HealthStatus,
  })),
};

/** Single-line CRM context for the daily Executive Brief. */
export const CRM_EXECUTIVE_BRIEFING_LINE = CRM_INTELLIGENCE.brief.briefingLine;

/** Compact CRM metrics for the Executive Brief Customer Insights card. */
export const ADVISOR_CRM_SNAPSHOT = CRM_INTELLIGENCE.brief.snapshot;
