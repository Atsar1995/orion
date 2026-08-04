import { CrmAgreementsFacade } from "@/lib/crm/agreements";
import { CrmCommercialFacade } from "@/lib/crm/commercial";
import { CrmCommercialIntelligenceFacade } from "@/lib/crm/commercial-intelligence";
import { CrmCustomerIntelligenceFacade } from "@/lib/crm/customer-intelligence";
import { CrmExecutiveDashboardFacade } from "@/lib/crm/executive-dashboard";
import { ensureCrmPlatformBacking } from "@/lib/crm/persistence/CrmPlatformBacking";
import {
  createCrmRepositories,
  type CrmRepositories,
} from "@/lib/crm/persistence/createCrmRepositories";
import type { CrmStoreBacking } from "@/lib/crm/persistence/CrmStoreBacking";
import { CrmPartyFacade } from "@/lib/crm/parties";
import { CrmService } from "@/lib/crm/services/CrmService";
import { setCrmEventPipelineRegistry } from "@/lib/crm/services/crmEventPipelineRegistry";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** CRM composition root — PlatformStore-backed dependency injection (Mission P-008.9). */
export type CrmWiring = CrmRepositories & {
  readonly platformStore: PlatformStore;
  readonly backing: CrmStoreBacking;
  readonly partyFacade: CrmPartyFacade;
  readonly commercialFacade: CrmCommercialFacade;
  readonly agreementsFacade: CrmAgreementsFacade;
  readonly commercialIntelligenceFacade: CrmCommercialIntelligenceFacade;
  readonly customerIntelligenceFacade: CrmCustomerIntelligenceFacade;
  readonly executiveDashboardFacade: CrmExecutiveDashboardFacade;
  readonly crmService: CrmService;
};

/** Centralized CRM dependency wiring — internal composition root. */
export function createCrmWiring(platformStore: PlatformStore): CrmWiring {
  const backing = ensureCrmPlatformBacking(platformStore);
  const repositories = createCrmRepositories(backing);
  const repository = repositories.executiveDashboard;

  setCrmEventPipelineRegistry({
    initialized: true,
    backingOrganizationIds: () => [...backing.organizationFoundations.keys()],
  });

  return {
    platformStore,
    backing,
    ...repositories,
    partyFacade: new CrmPartyFacade(repository),
    commercialFacade: new CrmCommercialFacade(repository),
    agreementsFacade: new CrmAgreementsFacade(repository),
    commercialIntelligenceFacade: new CrmCommercialIntelligenceFacade(repository),
    customerIntelligenceFacade: new CrmCustomerIntelligenceFacade(repository),
    executiveDashboardFacade: new CrmExecutiveDashboardFacade(repository),
    crmService: new CrmService(repository),
  };
}
