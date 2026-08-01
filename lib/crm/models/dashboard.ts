import type { CrmActivity, CrmKpiMetric, CrmPipelineStage, CrmRelationshipSegment } from "@/lib/crm/models/domain";
import type { Recommendation } from "@/types/intelligence";

export type CrmDashboardHeader = {
  greetingPeriod: string;
  executiveName: string;
  title: string;
  dateLabel: string;
};

/** CRM dashboard view model for `/crm` (Mission 16A.2). */
export type CrmDashboardView = {
  header: CrmDashboardHeader;
  kpis: CrmKpiMetric[];
  customerHealthDistribution: CrmRelationshipSegment[];
  pipelineStages: CrmPipelineStage[];
  pipelineValue: string;
  recentActivity: CrmActivity[];
  recommendations: Recommendation[];
};
