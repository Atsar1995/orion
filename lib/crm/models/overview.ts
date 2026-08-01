import type { HealthStatus } from "@/lib/command-center-data";
import type {
  CrmActivity,
  CrmAlert,
  CrmCustomerProfile,
  CrmInsight,
  CrmKpiMetric,
  CrmPipelineStage,
  CrmRecommendedAction,
  CrmRelationshipSegment,
} from "@/lib/crm/models/domain";
import type { CrmWorkspaceIntelligence } from "@/lib/crm/models/intelligence";

export type CrmCustomerHealthView = {
  score: number;
  trend: string;
  status: HealthStatus;
  summary: string;
  drivers: Array<{ label: string; status: HealthStatus }>;
};

export type CrmPipelineView = {
  totalValue: string;
  trend: string;
  summary: string;
  activeOpportunities: number;
  stages: CrmPipelineStage[];
};

export type CrmOverviewHeader = {
  greetingPeriod: string;
  executiveName: string;
  title: string;
  dateLabel: string;
};

/** Dashboard view model for CRM Overview (`/crm`). */
export type CrmOverviewView = {
  header: CrmOverviewHeader;
  dashboard: {
    customerHealth: CrmCustomerHealthView;
    activeOpportunities: number;
    pipelineValue: string;
    pipelineTrend: string;
  };
  executiveSummary: string;
  customerHealth: CrmCustomerHealthView;
  kpis: CrmKpiMetric[];
  pipeline: CrmPipelineView;
  relationshipHealth: CrmRelationshipSegment[];
  executiveInsights: CrmInsight[];
  alerts: CrmAlert[];
  recommendedAction: CrmRecommendedAction;
  recentActivity: CrmActivity[];
  executiveNotes: string;
  profiles: {
    highestValueCustomer: CrmCustomerProfile;
    highestRiskCustomer: CrmCustomerProfile;
    largestOpportunity: CrmCustomerProfile;
  };
  intelligence: CrmWorkspaceIntelligence;
};
