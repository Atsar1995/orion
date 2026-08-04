import {
  CRM_BASE_PATH,
  CRM_IIL_SERVICE_ID,
  CRM_MODULE_KEY,
  CRM_WORKSPACE_ID,
  CRM_WORKSPACE_LABEL,
} from "@/lib/crm/constants";
import { createCrmWiring, type CrmWiring } from "@/lib/crm/createCrmWiring";
import { getDefaultCrmBacking } from "@/lib/crm/persistence/createCrmStore";
import { CRM_FOUNDATION_CAPABILITIES } from "@/lib/crm/models/workspace";
import { CrmAgreementsFacade } from "@/lib/crm/agreements";
import { CrmCommercialFacade } from "@/lib/crm/commercial";
import { CrmCommercialIntelligenceFacade } from "@/lib/crm/commercial-intelligence";
import { CrmCustomerIntelligenceFacade } from "@/lib/crm/customer-intelligence";
import { CrmExecutiveDashboardFacade } from "@/lib/crm/executive-dashboard";
import { CrmPartyFacade } from "@/lib/crm/parties";
import { CrmService } from "@/lib/crm/services/CrmService";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import type { CrmDomainStatus, CrmWorkspaceBootstrap, CrmWorkspaceView } from "@/types/crm-core";
import type { ServiceContext } from "@/types/services";

export const CRM_MISSION_PLATFORM_FOUNDATION = "P-008.9";

function createDefaultCrmWiring(): CrmWiring {
  return createCrmWiring(new InMemoryPlatformStore({ crmStore: getDefaultCrmBacking() }));
}

/** Public CRM Domain facade (Mission P-008.9 · Platform Foundation). */
export class CrmFacade {
  readonly party: CrmPartyFacade;
  readonly commercial: CrmCommercialFacade;
  readonly agreements: CrmAgreementsFacade;
  readonly commercialIntelligence: CrmCommercialIntelligenceFacade;
  readonly customerIntelligence: CrmCustomerIntelligenceFacade;
  readonly executiveDashboard: CrmExecutiveDashboardFacade;
  readonly crmService: CrmService;

  constructor(private readonly wiring: CrmWiring = createDefaultCrmWiring()) {
    this.party = wiring.partyFacade;
    this.commercial = wiring.commercialFacade;
    this.agreements = wiring.agreementsFacade;
    this.commercialIntelligence = wiring.commercialIntelligenceFacade;
    this.customerIntelligence = wiring.customerIntelligenceFacade;
    this.executiveDashboard = wiring.executiveDashboardFacade;
    this.crmService = wiring.crmService;
  }

  getDomainStatus(): CrmDomainStatus {
    return {
      foundationComplete: true,
      platformStoreIntegrated: true,
      repositoryWiringReady: true,
      eventPipelineRegistryReady: true,
      healthMonitoringReady: true,
      readyForPlatformPersistence: true,
      readyForCanonicalEvents: false,
      readyForRbac: false,
      readyForCertification: false,
    };
  }

  getWorkspaceBootstrap(_context: ServiceContext): CrmWorkspaceBootstrap {
    return {
      workspaceId: CRM_WORKSPACE_ID,
      moduleKey: CRM_MODULE_KEY,
      label: CRM_WORKSPACE_LABEL,
      basePath: CRM_BASE_PATH,
      iilServiceId: CRM_IIL_SERVICE_ID,
      mission: CRM_MISSION_PLATFORM_FOUNDATION,
      capabilities: CRM_FOUNDATION_CAPABILITIES,
    };
  }

  getWorkspaceView(context: ServiceContext): CrmWorkspaceView {
    return {
      ...this.getWorkspaceBootstrap(context),
      domainStatus: this.getDomainStatus(),
    };
  }
}

export const crmFacade = new CrmFacade();

export function getCrmWorkspaceBootstrap(context: ServiceContext): CrmWorkspaceBootstrap {
  return crmFacade.getWorkspaceBootstrap(context);
}

export { createCrmWiring, type CrmWiring } from "@/lib/crm/createCrmWiring";
