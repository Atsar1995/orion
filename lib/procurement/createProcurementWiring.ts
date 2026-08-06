import { ensureProcurementPlatformBacking } from "@/lib/procurement/persistence/ProcurementPlatformBacking";
import {
  createProcurementPersistenceRepositories,
  type ProcurementPersistenceRepositories,
} from "@/lib/procurement/persistence/createProcurementPersistenceRepositories";
import {
  createProcurementRepositories,
  type ProcurementRepositories,
} from "@/lib/procurement/persistence/createProcurementRepositories";
import type { ProcurementStoreBacking } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import { setProcurementEventPipelineRegistry } from "@/lib/procurement/services/procurementEventPipelineRegistry";
import { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import { ProcurementCanonicalEventPublisher } from "@/lib/procurement/events/ProcurementCanonicalEventPublisher";
import { SupplierService } from "@/lib/procurement/services/SupplierService";
import { VendorContactService } from "@/lib/procurement/services/VendorContactService";
import { VendorScorecardService } from "@/lib/procurement/services/VendorScorecardService";
import { PurchaseApprovalService } from "@/lib/procurement/services/PurchaseApprovalService";
import { PurchaseRequisitionService } from "@/lib/procurement/services/PurchaseRequisitionService";
import { PurchaseOrderService } from "@/lib/procurement/services/PurchaseOrderService";
import { PurchaseContractService } from "@/lib/procurement/services/PurchaseContractService";
import { GoodsReceiptService } from "@/lib/procurement/services/GoodsReceiptService";
import { ReceivingLineService } from "@/lib/procurement/services/ReceivingLineService";
import { SupplierInvoiceService } from "@/lib/procurement/services/SupplierInvoiceService";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** Procurement composition root — PlatformStore-backed dependency injection (Mission P-010.3 · P-010.4 · P-010.5 · P-010.6 · P-010.7 · P-010.8 · P-010.9 · P-010.10 · P-010.11). */
export type ProcurementWiring = ProcurementRepositories &
  ProcurementPersistenceRepositories & {
    readonly platformStore: PlatformStore;
    readonly backing: ProcurementStoreBacking;
    readonly authorization: ProcurementAuthorizationService;
    readonly canonicalEventPublisher: ProcurementCanonicalEventPublisher;
    readonly supplierService: SupplierService;
    readonly vendorContactService: VendorContactService;
    readonly vendorScorecardService: VendorScorecardService;
    readonly purchaseApprovalService: PurchaseApprovalService;
    readonly purchaseRequisitionService: PurchaseRequisitionService;
    readonly purchaseOrderService: PurchaseOrderService;
    readonly purchaseContractService: PurchaseContractService;
    readonly goodsReceiptService: GoodsReceiptService;
    readonly receivingLineService: ReceivingLineService;
    readonly supplierInvoiceService: SupplierInvoiceService;
  };

/** Centralized Procurement dependency wiring — authoritative composition root. */
export function createProcurementWiring(platformStore: PlatformStore): ProcurementWiring {
  const backing = ensureProcurementPlatformBacking(platformStore);
  const connection = platformStore.getDatabaseConnection?.() ?? undefined;
  const persistenceRepositories = createProcurementPersistenceRepositories({
    platformStore,
    connection,
  });
  const repositories = createProcurementRepositories(backing, {
    procurementRepository: persistenceRepositories.procurementRepository,
  });
  const authorization = new ProcurementAuthorizationService();
  const canonicalEventPublisher = new ProcurementCanonicalEventPublisher();
  const supplierService = new SupplierService(
    repositories.suppliers,
    authorization,
    canonicalEventPublisher,
  );
  const vendorContactService = new VendorContactService(repositories.suppliers, authorization);
  const vendorScorecardService = new VendorScorecardService(repositories.suppliers, authorization);
  const purchaseApprovalService = new PurchaseApprovalService(
    repositories.requisitioning,
    authorization,
  );
  const purchaseRequisitionService = new PurchaseRequisitionService(
    repositories.requisitioning,
    authorization,
    canonicalEventPublisher,
    purchaseApprovalService,
  );
  const purchaseOrderService = new PurchaseOrderService(
    repositories.ordering,
    authorization,
    canonicalEventPublisher,
  );
  const purchaseContractService = new PurchaseContractService(
    repositories.ordering,
    authorization,
  );
  const goodsReceiptService = new GoodsReceiptService(
    repositories.receiving,
    authorization,
    canonicalEventPublisher,
  );
  const receivingLineService = new ReceivingLineService(repositories.receiving, authorization);
  const supplierInvoiceService = new SupplierInvoiceService(
    repositories.receiving,
    authorization,
    canonicalEventPublisher,
  );

  setProcurementEventPipelineRegistry({
    initialized: true,
    canonicalPublisherReady: true,
    backingOrganizationIds: () => [...backing.organizationFoundations.keys()],
  });

  return {
    platformStore,
    backing,
    authorization,
    canonicalEventPublisher,
    supplierService,
    vendorContactService,
    vendorScorecardService,
    purchaseApprovalService,
    purchaseRequisitionService,
    purchaseOrderService,
    purchaseContractService,
    goodsReceiptService,
    receivingLineService,
    supplierInvoiceService,
    ...persistenceRepositories,
    ...repositories,
  };
}
