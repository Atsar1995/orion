import { crmService } from "@/lib/crm/services/CrmService";
import { CrmCustomerIntelligenceFacade } from "@/lib/crm/customer-intelligence";
import { CrmExecutiveDashboardFacade } from "@/lib/crm/executive-dashboard";
import { CrmCommercialIntelligenceFacade } from "@/lib/crm/commercial-intelligence";
import { CrmAgreementsFacade } from "@/lib/crm/agreements";
import { CrmPartyFacade } from "@/lib/crm/parties";
import { CrmCommercialFacade } from "@/lib/crm/commercial";
import { defaultCrmRepository } from "@/lib/crm/repositories/InMemoryCrmRepository";

/**
 * CRM workspace public API (CTO-008 v2).
 * Import from `@/lib/crm` only — not from internal modules.
 */

export {
  CRM_BASE_PATH,
  CRM_IIL_SERVICE_ID,
  CRM_MODULE_KEY,
  CRM_PROVIDER_ID,
  CRM_ROUTE_PERMISSIONS,
  CRM_WORKSPACE_ID,
  CRM_WORKSPACE_LABEL,
} from "@/lib/crm/constants";

export { CRM_NAV, type CrmNavItem } from "@/lib/crm/nav";

export type {
  CrmActivity,
  CrmAlert,
  CrmCustomerProfile,
  CrmInsight,
  CrmKpiMetric,
  CrmPipelineStage,
  CrmRecommendedAction,
  CrmRelationshipSegment,
  CrmTrendDirection,
} from "@/lib/crm/models/domain";

export type { CrmDashboardHeader, CrmDashboardView } from "@/lib/crm/models/dashboard";

export type {
  CrmCustomerDetailView,
  CrmCustomerListItem,
  CrmCustomerListResult,
  CrmCustomerRecord,
  CustomerHealthLabel,
  CustomerListQuery,
} from "@/lib/crm/models/customers";

export { resolveCustomerHealthLabel } from "@/lib/crm/data/customer-records";

export type {
  CrmOpportunityDetailView,
  CrmOpportunityListItem,
  CrmOpportunityListResult,
  CrmOpportunityMetrics,
  CrmOpportunityRecord,
  CrmOpportunityWorkspaceView,
  OpportunityHealthLabel,
  OpportunityListQuery,
  OpportunityStage,
} from "@/lib/crm/models/opportunities";

export {
  resolveOpportunityHealthLabel,
  resolveOpportunityPriorityLabel,
} from "@/lib/crm/data/opportunity-records";

export type { CrmInsightsView } from "@/lib/crm/models/insights";

export { mapCrmInsightsView } from "@/lib/crm/mappers/insights";
export { mapCrmBusinessHealthContribution } from "@/lib/crm/mappers/business-health-contribution";
export { mapCrmExplainableRecommendations } from "@/lib/crm/mappers/explainable-recommendations";
export {
  mapCrmBriefAlerts,
  mapCrmBriefExecutiveSummary,
  mapCrmBriefOvernightChanges,
  mapCrmBriefPlatformAlerts,
  mapCrmBriefPlatformRecommendations,
  mapCrmBriefRecommendations,
  mapCrmBriefBusinessHealth,
  CRM_BRIEF_WORKSPACE_ID,
} from "@/lib/crm/mappers/brief-contribution";

export type {
  ActivityListQuery,
  CrmActivityDashboardMetrics,
  CrmActivityRecord,
  CrmActivityWorkspaceView,
  CrmActivityPriority,
  CrmActivityStatus,
  CrmActivityType,
} from "@/lib/crm/models/activities";

export type {
  CrmCustomerHealthView,
  CrmOverviewHeader,
  CrmOverviewView,
  CrmPipelineView,
} from "@/lib/crm/models/overview";

export { mapCrmDashboardView } from "@/lib/crm/mappers/dashboard";

export type { CrmWorkspaceIntelligence } from "@/lib/crm/models/intelligence";

export { runCrmIntelligenceEngine } from "@/lib/crm/services/intelligence/CrmIntelligenceEngine";

export type { CrmRepository } from "@/lib/crm/repositories/CrmRepository";
export type { CommercialRepository } from "@/lib/crm/repositories/CommercialRepository";
export type { AgreementsRepository } from "@/lib/crm/repositories/AgreementsRepository";
export type { CommercialIntelligenceRepository } from "@/lib/crm/repositories/CommercialIntelligenceRepository";
export type { CustomerIntelligenceRepository } from "@/lib/crm/repositories/CustomerIntelligenceRepository";
export type { ExecutiveDashboardRepository } from "@/lib/crm/repositories/ExecutiveDashboardRepository";
export type { PartyRepository } from "@/lib/crm/repositories/PartyRepository";
export {
  InMemoryCrmRepository,
  defaultCrmRepository,
} from "@/lib/crm/repositories/InMemoryCrmRepository";

export { CrmPartyFacade } from "@/lib/crm/parties";
export { mapCrmPartyBriefSignals } from "@/lib/crm/mappers/party-brief";

export type {
  OrganisationDetailView,
  OrganisationListItem,
  OrganisationListView,
  PartyAnalyticsView,
  PartyBriefSignals,
  PartyRelationshipView,
  PartySearchView,
  PersonDetailView,
  PersonListItem,
} from "@/lib/crm/models/parties";

export type {
  CreateOrganisationInput,
  CreatePersonInput,
  LinkPartyRelationshipInput,
  ModifyPartyInput,
  OrganisationRecord,
  OrganisationType,
  PartyKind,
  PartyRecord,
  PartyRelationship,
  PartyRoleType,
  PartySearchFilter,
  PartyStatus,
  PersonRecord,
} from "@/types/crm-party";

export const crmPartyService = new CrmPartyFacade(defaultCrmRepository);

export { CrmCommercialFacade } from "@/lib/crm/commercial";
export { mapCrmCommercialBriefSignals } from "@/lib/crm/mappers/commercial-brief";

export type {
  CommercialBriefSignals,
  ForecastDashboardView,
  LeadDetailView,
  LeadListItem,
  LeadListView,
  PipelineMetricsView,
  PipelineView,
} from "@/lib/crm/models/commercial";

export type {
  CommercialActivityRecord,
  CommercialOpportunityRecord,
  CommercialOpportunityStage,
  CreateLeadInput,
  CreateOpportunityInput,
  LeadRecord,
  LeadSource,
  LeadStatus,
  RevenueForecastRecord,
} from "@/types/crm-commercial";

export const crmCommercialService = new CrmCommercialFacade(defaultCrmRepository);

export { CrmAgreementsFacade } from "@/lib/crm/agreements";
export { mapCrmAgreementsBriefSignals } from "@/lib/crm/mappers/agreements-brief";

export type {
  AgreementsBriefSignals,
  AgreementsRegistryView,
  ContractListItem,
  ProposalListItem,
  RateAgreementListItem,
  RenewalDashboardView,
} from "@/lib/crm/models/agreements";

export type {
  AgreementLifecycleStatus,
  ApprovalRecord,
  ContractRecord,
  ContractType,
  CreateContractInput,
  CreateProposalInput,
  CreateQuotationInput,
  CreateRateAgreementInput,
  ProposalRecord,
  QuotationRecord,
  RateAgreementRecord,
  RateAgreementType,
  RenewalRecord,
} from "@/types/crm-agreements";

export const crmAgreementsService = new CrmAgreementsFacade(defaultCrmRepository);

export { CrmCommercialIntelligenceFacade } from "@/lib/crm/commercial-intelligence";
export { mapCrmCommercialIntelligenceBriefSignals } from "@/lib/crm/mappers/commercial-intelligence-brief";

export type {
  CommercialAnalyticsView,
  CommercialExecutiveDashboard,
  CommercialIntelligenceBriefSignals,
} from "@/lib/crm/models/commercial-intelligence";

export type {
  BenchmarkRecord,
  CommercialAlert,
  CommercialInsight,
  CommercialKpi,
  CommercialRecommendation,
  ForecastHistoryRecord,
  ForecastRecord,
  RelationshipHealthRecord,
} from "@/types/crm-commercial-intelligence";

export const crmCommercialIntelligenceService = new CrmCommercialIntelligenceFacade(defaultCrmRepository);

export { CrmCustomerIntelligenceFacade } from "@/lib/crm/customer-intelligence";
export { mapCrmCustomerIntelligenceBriefSignals } from "@/lib/crm/mappers/customer-intelligence-brief";

export type {
  CustomerIntelligenceBriefSignals,
  CustomerIntelligenceDashboardView,
  CustomerProfileDetailView,
  CustomerProfileHubView,
  CustomerProfileListItem,
} from "@/lib/crm/models/customer-intelligence";

export type {
  CustomerInsightRecord,
  CustomerProfileRecord,
  CustomerSegmentRecord,
  CustomerSegmentType,
  GrowthOpportunityRecord,
  JourneyEventRecord,
  RetentionRiskRecord,
} from "@/types/crm-customer-intelligence";

export const crmCustomerIntelligenceService = new CrmCustomerIntelligenceFacade(defaultCrmRepository);

export { CrmExecutiveDashboardFacade } from "@/lib/crm/executive-dashboard";
export { mapCrmExecutiveBriefSignals } from "@/lib/crm/mappers/crm-executive-brief";

export type {
  CommercialActivitySummary,
  CrmExecutiveBriefSignals,
  CrmExecutiveDashboardView,
  CustomerIntelligenceSummary,
  ExecutiveReport,
  RevenueSummary,
  SalesPerformanceView,
} from "@/lib/crm/models/crm-executive-dashboard";

export type {
  CommercialSnapshotRecord,
  DashboardWidget,
  DrillDownTarget,
  ExecutiveAlert,
  PerformanceTrendRecord,
} from "@/types/crm-executive-dashboard";

export const crmExecutiveDashboardService = new CrmExecutiveDashboardFacade(defaultCrmRepository);

export {
  CrmService,
  createCrmService,
  crmService,
  type CrmServiceContext,
} from "@/lib/crm/services/CrmService";

export { getPipelineChartPoints, getPipelineMaxCount } from "@/lib/crm/mappers/pipeline-utils";

export {
  mapCrmBriefContribution,
  mapCrmIntelligenceResult,
  mapCrmOverviewView,
  mapCrmProviderMetrics,
} from "@/lib/crm/mappers/intelligence";

export type { CrmAdvisorSnapshot, CrmIntelligenceResult } from "@/lib/crm/crm-intelligence-types";

/** Cached intelligence — single evaluation per module load. */
export const CRM_INTELLIGENCE = crmService.getIntelligence();

/** Convenience exports for Executive Brief integration. */
export const CRM_EXECUTIVE_BRIEFING_LINE = CRM_INTELLIGENCE.brief.briefingLine;
export const ADVISOR_CRM_SNAPSHOT = CRM_INTELLIGENCE.brief.snapshot;

export function getCrmBriefContribution() {
  return crmService.getBriefContribution();
}

export function getCrmExecutiveRecommendations() {
  return CRM_INTELLIGENCE.brief.snapshot.executiveRecommendations;
}

export function runCrmIntelligencePipeline() {
  return crmService.getIntelligence();
}

export {
  CrmFacade,
  crmFacade,
  getCrmWorkspaceBootstrap,
  createCrmWiring,
  type CrmWiring,
} from "@/lib/crm/CrmFacade";

export type {
  CrmCapabilityDescriptor,
  CrmCapabilityStatus,
  CrmDomainStatus,
  CrmScopedRecord,
  CrmWorkspaceBootstrap,
  CrmWorkspaceView,
} from "@/types/crm-core";

export type { CrmStoreBacking } from "@/lib/crm/persistence/CrmStoreBacking";
export { CRM_SEED_ORG_ID } from "@/lib/crm/persistence/createCrmStore";
export { createCrmPersistenceRepositories } from "@/lib/crm/persistence/createCrmPersistenceRepositories";
export type {
  CrmPersistenceRepositories,
  CreateCrmPersistenceRepositoriesOptions,
} from "@/lib/crm/persistence/createCrmPersistenceRepositories";
export type { CrmPersistenceRepository } from "@/lib/crm/persistence/CrmPersistenceRepository";
export type {
  CrmPersistenceCollection,
  CrmAggregateRecord,
} from "@/lib/crm/persistence/CrmStoreBacking";

export {
  CRM_PERMISSIONS,
  listCrmRouteRules,
  resolveCrmRoutePermission,
  CrmAuthorizationService,
  defaultCrmAuthorizationService,
  getCrmApiContext,
  getCrmApiContextForRequest,
  CrmAuthorizationError,
} from "@/lib/crm/security";
export type {
  CrmPermissionCode,
  CrmRoutePermissionRule,
  CrmApiContextOptions,
} from "@/lib/crm/security";
