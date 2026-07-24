import type { HealthStatus } from "@/lib/command-center-data";
import {
  CRM_ENHANCED_KPIS,
  CRM_EXECUTIVE_INSIGHTS,
  CRM_CUSTOMER_ALERTS,
  CRM_INSIGHTS_READY,
  HIGHEST_RISK_CUSTOMER,
  HIGHEST_VALUE_CUSTOMER,
  LARGEST_OPPORTUNITY,
  CRM_RECOMMENDED_ACTION,
  OPPORTUNITY_PIPELINE,
  PIPELINE_SUMMARY,
  RELATIONSHIP_HEALTH,
  type CrmAlert,
  type CrmCustomerProfile,
  type CrmInsight,
  type CrmKpiMetric,
  type CrmPipelineStage,
  type CrmRecommendedAction,
  type CrmRelationshipSegment,
  type CrmTrendDirection,
} from "@/lib/crm-business-data";
import { CRM_INTELLIGENCE } from "@/lib/crm/crm-intelligence-pipeline";

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

export { CRM_INSIGHTS_READY, CRM_ENHANCED_KPIS, OPPORTUNITY_PIPELINE, PIPELINE_SUMMARY, RELATIONSHIP_HEALTH };
export { CRM_EXECUTIVE_INSIGHTS, CRM_CUSTOMER_ALERTS };
export { HIGHEST_VALUE_CUSTOMER, HIGHEST_RISK_CUSTOMER, LARGEST_OPPORTUNITY, CRM_RECOMMENDED_ACTION };

/** Customer health score computed via shared Health Engine. */
export const CUSTOMER_HEALTH_SCORE = {
  score: CRM_INTELLIGENCE.health.customer.score,
  trend: CRM_INTELLIGENCE.health.customer.trend,
  status: CRM_INTELLIGENCE.health.customer.status,
  summary: CRM_INTELLIGENCE.health.customer.summary,
  drivers: CRM_INTELLIGENCE.health.customer.drivers.map((driver) => ({
    label: driver.label,
    status: driver.status as HealthStatus,
  })),
};

/** Single-line CRM context for the daily Executive Brief. */
export const CRM_EXECUTIVE_BRIEFING_LINE = CRM_INTELLIGENCE.brief.briefingLine;

/** Compact CRM metrics for the Executive Brief Customer Insights card. */
export const ADVISOR_CRM_SNAPSHOT = CRM_INTELLIGENCE.brief.snapshot;

/** Maps pipeline stages to chart points for bar visualisation. */
export function getPipelineChartPoints(stages: CrmPipelineStage[]) {
  return stages.map((stage) => ({
    label: stage.label,
    value: stage.count,
    displayValue: stage.displayValue,
  }));
}

/** Returns the maximum pipeline count for chart scaling. */
export function getPipelineMaxCount(stages: CrmPipelineStage[]): number {
  return Math.max(...stages.map((stage) => stage.count), 1);
}
