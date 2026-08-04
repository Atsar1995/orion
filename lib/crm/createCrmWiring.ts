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
import {
  CrmCanonicalEventPublisher,
  defaultCrmCanonicalEventPublisher,
} from "@/lib/crm/events";
import { CrmService } from "@/lib/crm/services/CrmService";
import { setCrmEventPipelineRegistry } from "@/lib/crm/services/crmEventPipelineRegistry";
import {
  CrmAuthorizationService,
  defaultCrmAuthorizationService,
} from "@/lib/crm/security/CrmAuthorizationService";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** CRM composition root — PlatformStore-backed dependency injection (Mission P-008.9 · P-008.10 · P-008.12 · P-008.14). */
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
};

/** Centralized CRM dependency wiring — internal composition root. */
export function createCrmWiring(platformStore: PlatformStore): CrmWiring {
  const backing = ensureCrmPlatformBacking(platformStore);
  const connection = platformStore.getDatabaseConnection?.() ?? undefined;
  const persistenceRepositories = createCrmPersistenceRepositories({ platformStore, connection });
  const repositories = createCrmRepositories(backing, {
    crmRepository: persistenceRepositories.crmRepository,
  });
  const repository = repositories.executiveDashboard;

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
    partyFacade: new CrmPartyFacade(repository),
    commercialFacade: new CrmCommercialFacade(repository),
    agreementsFacade: new CrmAgreementsFacade(repository),
    commercialIntelligenceFacade: new CrmCommercialIntelligenceFacade(repository),
    customerIntelligenceFacade: new CrmCustomerIntelligenceFacade(repository),
    executiveDashboardFacade: new CrmExecutiveDashboardFacade(repository),
    crmService: new CrmService(repository),
    authorization: defaultCrmAuthorizationService,
    canonicalEventPublisher: defaultCrmCanonicalEventPublisher,
  };
}
