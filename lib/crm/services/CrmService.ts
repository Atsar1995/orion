import type { CrmIntelligenceResult } from "@/lib/crm/crm-intelligence-types";
import {
  mapCrmBriefContribution,
  mapCrmIntelligenceResult,
  mapCrmOverviewView,
} from "@/lib/crm/mappers/intelligence";
import { mapCrmDashboardView } from "@/lib/crm/mappers/dashboard";
import { mapCrmInsightsView } from "@/lib/crm/mappers/insights";
import type { CrmDashboardView } from "@/lib/crm/models/dashboard";
import type { CrmOverviewView } from "@/lib/crm/models/overview";
import { CrmCustomerIntelligenceFacade } from "@/lib/crm/customer-intelligence";
import { CrmExecutiveDashboardFacade } from "@/lib/crm/executive-dashboard";
import type { ExecutiveDashboardRepository } from "@/lib/crm/repositories/ExecutiveDashboardRepository";
import type { ServiceContext } from "@/types/services";
import { CrmAgreementsFacade } from "@/lib/crm/agreements";
import { CrmCommercialIntelligenceFacade } from "@/lib/crm/commercial-intelligence";
import { CrmCommercialFacade } from "@/lib/crm/commercial";
import {
  CrmCustomersService,
  createCrmCustomersService,
} from "@/lib/crm/services/customers/CrmCustomersService";
import type { CustomerListQuery } from "@/lib/crm/models/customers";
import type { OpportunityListQuery } from "@/lib/crm/models/opportunities";
import {
  CrmOpportunitiesService,
  createCrmOpportunitiesService,
} from "@/lib/crm/services/opportunities/CrmOpportunitiesService";
import type { ActivityListQuery } from "@/lib/crm/models/activities";
import {
  CrmActivitiesService,
  createCrmActivitiesService,
} from "@/lib/crm/services/activities/CrmActivitiesService";
import { CrmPartyFacade } from "@/lib/crm/parties";
import { CrmCanonicalEventPublisher } from "@/lib/crm/events";
import { SalesOrderService } from "@/lib/crm/services/SalesOrderService";

export type CrmServiceContext = {
  userId?: string;
};

export type CreateCrmServiceOptions = {
  readonly repository: ExecutiveDashboardRepository;
  readonly canonicalPublisher: CrmCanonicalEventPublisher;
  readonly salesOrderService: SalesOrderService;
};

/** CRM workspace business service — no React imports. */
export class CrmService {
  readonly customers: CrmCustomersService;
  readonly opportunities: CrmOpportunitiesService;
  readonly activities: CrmActivitiesService;
  readonly parties: CrmPartyFacade;
  readonly commercial: CrmCommercialFacade;
  readonly agreements: CrmAgreementsFacade;
  readonly intelligence: CrmCommercialIntelligenceFacade;
  readonly customerIntelligence: CrmCustomerIntelligenceFacade;
  readonly executiveDashboard: CrmExecutiveDashboardFacade;

  private readonly options: CreateCrmServiceOptions;

  constructor(options: CreateCrmServiceOptions | ExecutiveDashboardRepository) {
    const resolved = isCreateCrmServiceOptions(options)
      ? options
      : {
          repository: options,
          canonicalPublisher: new CrmCanonicalEventPublisher(),
          salesOrderService: new SalesOrderService(new CrmCanonicalEventPublisher()),
        };

    this.options = resolved;
    const { repository, canonicalPublisher, salesOrderService } = resolved;
    this.customers = createCrmCustomersService(repository);
    this.opportunities = createCrmOpportunitiesService(repository);
    this.activities = createCrmActivitiesService(repository);
    this.parties = new CrmPartyFacade(repository, canonicalPublisher);
    this.commercial = new CrmCommercialFacade(repository, canonicalPublisher);
    this.agreements = new CrmAgreementsFacade(repository, canonicalPublisher, salesOrderService);
    this.intelligence = new CrmCommercialIntelligenceFacade(repository);
    this.customerIntelligence = new CrmCustomerIntelligenceFacade(repository);
    this.executiveDashboard = new CrmExecutiveDashboardFacade(repository);
  }

  /** CRM customer list with search, filters, sort, and pagination. */
  listCustomers(query?: CustomerListQuery) {
    return this.customers.listCustomers(query);
  }

  /** CRM customer detail view by id. */
  getCustomerDetail(customerId: string) {
    return this.customers.getCustomerDetail(customerId);
  }

  /** CRM opportunity list with search, filters, sort, and pagination. */
  listOpportunities(query?: OpportunityListQuery) {
    return this.opportunities.listOpportunities(query);
  }

  /** CRM opportunity detail view by id. */
  getOpportunityDetail(opportunityId: string) {
    return this.opportunities.getOpportunityDetail(opportunityId);
  }

  /** CRM opportunities workspace view (metrics, recommendations, catalog). */
  getOpportunityWorkspace() {
    return this.opportunities.getWorkspaceView();
  }

  /** CRM activities workspace view (metrics and catalog). */
  getActivityWorkspace() {
    return this.activities.getWorkspaceView();
  }

  /** CRM activity list with search, filters, sort, and pagination. */
  listActivities(query?: ActivityListQuery) {
    return this.activities.listActivities(query);
  }

  /** CRM intelligence insights dashboard (Mission 16A.6). */
  getInsights(_context?: CrmServiceContext) {
    void _context;
    return mapCrmInsightsView(this.options.repository, this.getIntelligence());
  }

  /** Full intelligence pipeline result for provider and brief integration. */
  getIntelligence(_context?: CrmServiceContext): CrmIntelligenceResult {
    void _context;
    return mapCrmIntelligenceResult(this.options.repository);
  }

  /** CRM dashboard view model for `/crm` (Mission 16A.2). */
  getDashboard(_context?: CrmServiceContext): CrmDashboardView {
    void _context;
    return mapCrmDashboardView(this.options.repository);
  }

  /** Overview dashboard view model for `/crm`. */
  getOverview(_context?: CrmServiceContext): CrmOverviewView {
    void _context;
    const intelligence = this.getIntelligence();
    return mapCrmOverviewView(this.options.repository, intelligence);
  }

  /** Universal party brief signals for Executive Brief (Mission P-008.1). */
  getPartyBriefSignals(context: ServiceContext) {
    return this.parties.analytics.getBriefSignals(context);
  }

  /** Commercial domain brief signals (Mission P-008.2). */
  getCommercialBriefSignals(context: ServiceContext) {
    return this.commercial.forecast.getBriefSignals(context);
  }

  /** Commercial agreements brief signals (Mission P-008.3). */
  getAgreementsBriefSignals(context: ServiceContext) {
    return this.agreements.analytics.getBriefSignals(context);
  }

  /** Commercial intelligence brief signals (Mission P-008.5). */
  getCommercialIntelligenceBriefSignals(context: ServiceContext) {
    return this.intelligence.executive.getBriefSignals(context);
  }

  /** Customer analytics brief signals (Mission P-008.6). */
  getCustomerIntelligenceBriefSignals(context: ServiceContext) {
    return this.customerIntelligence.executive.getBriefSignals(context);
  }

  /** Commercial executive dashboard brief signals (Mission P-008.7). */
  getExecutiveDashboardBriefSignals(context: ServiceContext) {
    return this.executiveDashboard.executive.getBriefSignals(context);
  }

  /** Executive Brief workspace contribution slice. */
  getBriefContribution(_context?: CrmServiceContext) {
    void _context;
    return mapCrmBriefContribution(this.getIntelligence());
  }
}

export function createCrmService(
  options: CreateCrmServiceOptions | ExecutiveDashboardRepository,
): CrmService {
  if (isCreateCrmServiceOptions(options)) {
    return new CrmService(options);
  }

  const canonicalPublisher = new CrmCanonicalEventPublisher();
  return new CrmService({
    repository: options,
    canonicalPublisher,
    salesOrderService: new SalesOrderService(canonicalPublisher),
  });
}

function isCreateCrmServiceOptions(
  value: CreateCrmServiceOptions | ExecutiveDashboardRepository,
): value is CreateCrmServiceOptions {
  return (
    typeof value === "object" &&
    value !== null &&
    "canonicalPublisher" in value &&
    "salesOrderService" in value
  );
}
