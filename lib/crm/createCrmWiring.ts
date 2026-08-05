import { CrmAgreementsFacade } from "@/lib/crm/agreements";
import { CrmCommercialFacade } from "@/lib/crm/commercial";
import { CrmCommercialIntelligenceFacade } from "@/lib/crm/commercial-intelligence";
import { CrmCustomerIntelligenceFacade } from "@/lib/crm/customer-intelligence";
import { CrmExecutiveDashboardFacade } from "@/lib/crm/executive-dashboard";
import { ensureCrmPlatformBacking } from "@/lib/crm/persistence/CrmPlatformBacking";
import {
  createCrmPersistenceRepositories,
  type CrmPersistenceRepositories,
} from "@/lib/crm/persistence/createCrmPersistenceRepositories";
import {
  createCrmRepositories,
  type CrmRepositories,
} from "@/lib/crm/persistence/createCrmRepositories";
import type { CrmStoreBacking } from "@/lib/crm/persistence/CrmStoreBacking";
import { CrmPartyFacade } from "@/lib/crm/parties";
import { CrmCanonicalEventPublisher } from "@/lib/crm/events";
import { CrmService } from "@/lib/crm/services/CrmService";
import { CaseService } from "@/lib/crm/services/CaseService";
import { SalesOrderService } from "@/lib/crm/services/SalesOrderService";
import { setCrmEventPipelineRegistry } from "@/lib/crm/services/crmEventPipelineRegistry";
import { CrmAuthorizationService } from "@/lib/crm/security/CrmAuthorizationService";
import type { InMemoryCrmRepository } from "@/lib/crm/repositories/InMemoryCrmRepository";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

export type CreateCrmWiringOptions = {
  readonly repository?: InMemoryCrmRepository;
};

/** CRM composition root — PlatformStore-backed dependency injection (Mission P-008.9 · P-008.18). */
export type CrmWiring = CrmRepositories &
  CrmPersistenceRepositories & {
  readonly platformStore: PlatformStore;
  readonly backing: CrmStoreBacking;
  readonly partyFacade: CrmPartyFacade;
  readonly commercialFacade: CrmCommercialFacade;
  readonly agreementsFacade: CrmAgreementsFacade;
  readonly commercialIntelligenceFacade: CrmCommercialIntelligenceFacade;
  readonly customerIntelligenceFacade: CrmCustomerIntelligenceFacade;
  readonly executiveDashboardFacade: CrmExecutiveDashboardFacade;
  readonly crmService: CrmService;
  readonly authorization: CrmAuthorizationService;
  readonly canonicalEventPublisher: CrmCanonicalEventPublisher;
  readonly salesOrderService: SalesOrderService;
  readonly caseService: CaseService;
};

/** Centralized CRM dependency wiring — authoritative composition root. */
export function createCrmWiring(
  platformStore: PlatformStore,
  options?: CreateCrmWiringOptions,
): CrmWiring {
  const backing = ensureCrmPlatformBacking(platformStore);
  const connection = platformStore.getDatabaseConnection?.() ?? undefined;
  const persistenceRepositories = createCrmPersistenceRepositories({ platformStore, connection });
  const repositories = createCrmRepositories(backing, {
    crmRepository: persistenceRepositories.crmRepository,
    repository: options?.repository,
  });
  const repository = repositories.executiveDashboard;

  const canonicalEventPublisher = new CrmCanonicalEventPublisher();
  const salesOrderService = new SalesOrderService(canonicalEventPublisher);
  const authorization = new CrmAuthorizationService();

  setCrmEventPipelineRegistry({
    initialized: true,
    canonicalPublisherReady: true,
    backingOrganizationIds: () => [...backing.organizationFoundations.keys()],
  });

  return {
    platformStore,
    backing,
    ...persistenceRepositories,
    ...repositories,
    partyFacade: new CrmPartyFacade(repository, canonicalEventPublisher),
    commercialFacade: new CrmCommercialFacade(repository, canonicalEventPublisher),
    agreementsFacade: new CrmAgreementsFacade(
      repository,
      canonicalEventPublisher,
      salesOrderService,
    ),
    commercialIntelligenceFacade: new CrmCommercialIntelligenceFacade(repository),
    customerIntelligenceFacade: new CrmCustomerIntelligenceFacade(repository),
    executiveDashboardFacade: new CrmExecutiveDashboardFacade(repository),
    crmService: new CrmService({
      repository,
      canonicalPublisher: canonicalEventPublisher,
      salesOrderService,
    }),
    authorization,
    canonicalEventPublisher,
    salesOrderService,
    caseService: new CaseService(backing, canonicalEventPublisher),
  };
}
