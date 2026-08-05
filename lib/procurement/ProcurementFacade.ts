import {
  PROCUREMENT_BASE_PATH,
  PROCUREMENT_IIL_SERVICE_ID,
  PROCUREMENT_MODULE_KEY,
  PROCUREMENT_WORKSPACE_ID,
  PROCUREMENT_WORKSPACE_LABEL,
} from "@/lib/procurement/constants";
import { createProcurementWiring, type ProcurementWiring } from "@/lib/procurement/createProcurementWiring";
import { PROCUREMENT_FOUNDATION_CAPABILITIES } from "@/lib/procurement/models/workspace";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import type {
  ProcurementDomainStatus,
  ProcurementWorkspaceBootstrap,
  ProcurementWorkspaceView,
} from "@/lib/procurement/types/procurement-core";
import type { SupplierService } from "@/lib/procurement/services/SupplierService";
import type { VendorContactService } from "@/lib/procurement/services/VendorContactService";
import type { VendorScorecardService } from "@/lib/procurement/services/VendorScorecardService";
import type { PurchaseApprovalService } from "@/lib/procurement/services/PurchaseApprovalService";
import type { PurchaseRequisitionService } from "@/lib/procurement/services/PurchaseRequisitionService";
import type { ServiceContext } from "@/types/services";

export const PROCUREMENT_MISSION_PLATFORM_FOUNDATION = "P-010.3";
export const PROCUREMENT_MISSION_SUPPLIER_MANAGEMENT = "P-010.7";
export const PROCUREMENT_MISSION_REQUISITION_MANAGEMENT = "P-010.8";

function createDefaultProcurementWiring(): ProcurementWiring {
  return createProcurementWiring(new InMemoryPlatformStore());
}

/** Public Procurement Domain facade (Mission P-010.3 composition root). */
export class ProcurementFacade {
  readonly wiring: ProcurementWiring;

  constructor(wiring: ProcurementWiring = createDefaultProcurementWiring()) {
    this.wiring = wiring;
  }

  getDomainStatus(): ProcurementDomainStatus {
    return {
      foundationComplete: true,
      platformStoreIntegrated: true,
      repositoryWiringReady: true,
      eventPipelineRegistryReady: true,
      healthMonitoringReady: true,
      readyForPlatformPersistence: true,
      readyForCanonicalEvents: true,
      readyForRbac: true,
      readyForCertification: false,
    };
  }

  get suppliers(): {
    readonly vendor: SupplierService;
    readonly contacts: VendorContactService;
    readonly scorecards: VendorScorecardService;
  } {
    return {
      vendor: this.wiring.supplierService,
      contacts: this.wiring.vendorContactService,
      scorecards: this.wiring.vendorScorecardService,
    };
  }

  get requisitions(): {
    readonly purchase: PurchaseRequisitionService;
    readonly approval: PurchaseApprovalService;
  } {
    return {
      purchase: this.wiring.purchaseRequisitionService,
      approval: this.wiring.purchaseApprovalService,
    };
  }

  getWorkspaceBootstrap(_context: ServiceContext): ProcurementWorkspaceBootstrap {
    return {
      workspaceId: PROCUREMENT_WORKSPACE_ID,
      moduleKey: PROCUREMENT_MODULE_KEY,
      label: PROCUREMENT_WORKSPACE_LABEL,
      basePath: PROCUREMENT_BASE_PATH,
      iilServiceId: PROCUREMENT_IIL_SERVICE_ID,
      mission: PROCUREMENT_MISSION_PLATFORM_FOUNDATION,
      capabilities: PROCUREMENT_FOUNDATION_CAPABILITIES,
    };
  }

  getWorkspaceView(context: ServiceContext): ProcurementWorkspaceView {
    return {
      ...this.getWorkspaceBootstrap(context),
      domainStatus: this.getDomainStatus(),
    };
  }
}

export const procurementFacade = new ProcurementFacade();

export function getProcurementWorkspaceBootstrap(
  context: ServiceContext,
): ProcurementWorkspaceBootstrap {
  return procurementFacade.getWorkspaceBootstrap(context);
}

export {
  createProcurementWiring,
  type ProcurementWiring,
} from "@/lib/procurement/createProcurementWiring";
