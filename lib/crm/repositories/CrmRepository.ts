import type { CrmCustomerRecord } from "@/lib/crm/models/customers";
import type { CrmActivityRecord } from "@/lib/crm/models/activities";
import type { CrmOpportunityRecord } from "@/lib/crm/models/opportunities";
import type {
  CrmActivity,
  CrmAlert,
  CrmCustomerHealthInput,
  CrmCustomerProfile,
  CrmInsight,
  CrmKpiMetric,
  CrmPipelineStage,
  CrmPipelineSummary,
  CrmRecommendedAction,
  CrmRelationshipSegment,
} from "@/lib/crm/models/domain";
import type {
  CustomerProfileDetail,
  ManagedOpportunity,
  RelationshipAction,
} from "@/lib/crm-relationships-opportunities";

/** CRM data access contract — swap InMemory for API without UI changes. */
export type CrmRepository = {
  getExecutiveSummary(): string;
  getExecutiveNotes(): string;
  getRecentActivity(): CrmActivity[];
  getEnhancedKpis(): CrmKpiMetric[];
  getCustomerHealthInput(): CrmCustomerHealthInput;
  getPipelineSummary(): CrmPipelineSummary;
  getPipelineStages(): CrmPipelineStage[];
  getRelationshipHealth(): CrmRelationshipSegment[];
  getExecutiveInsights(): CrmInsight[];
  getCustomerAlerts(): CrmAlert[];
  getRecommendedAction(): CrmRecommendedAction;
  getHighestValueCustomer(): CrmCustomerProfile;
  getHighestRiskCustomer(): CrmCustomerProfile;
  getLargestOpportunity(): CrmCustomerProfile;
  getCustomerProfiles(): CustomerProfileDetail[];
  getCustomerRecords(): CrmCustomerRecord[];
  getOpportunityRecords(): CrmOpportunityRecord[];
  getActivityRecords(): CrmActivityRecord[];
  getManagedOpportunities(): ManagedOpportunity[];
  getRelationshipActions(): RelationshipAction[];
};
