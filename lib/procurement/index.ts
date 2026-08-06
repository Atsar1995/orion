import { procurementFacade } from "@/lib/procurement/ProcurementFacade";

export { ProcurementFacade, procurementFacade, getProcurementWorkspaceBootstrap } from "@/lib/procurement/ProcurementFacade";
export { createProcurementWiring, type ProcurementWiring } from "@/lib/procurement/createProcurementWiring";
export { SupplierService } from "@/lib/procurement/services/SupplierService";
export { VendorContactService } from "@/lib/procurement/services/VendorContactService";
export { VendorScorecardService } from "@/lib/procurement/services/VendorScorecardService";
export { PurchaseRequisitionService } from "@/lib/procurement/services/PurchaseRequisitionService";
export { PurchaseApprovalService } from "@/lib/procurement/services/PurchaseApprovalService";
export { PurchaseOrderService } from "@/lib/procurement/services/PurchaseOrderService";
export { PurchaseContractService } from "@/lib/procurement/services/PurchaseContractService";
export { GoodsReceiptService } from "@/lib/procurement/services/GoodsReceiptService";
export { ReceivingLineService } from "@/lib/procurement/services/ReceivingLineService";
export { SupplierInvoiceService } from "@/lib/procurement/services/SupplierInvoiceService";
export type {
  VendorRecord,
  VendorStatus,
  VendorContactRecord,
  VendorScorecardRecord,
  CreateSupplierInput,
  UpdateSupplierInput,
  CreateVendorContactInput,
  UpdateVendorContactInput,
  CreateVendorScorecardInput,
  UpdateVendorScorecardInput,
} from "@/lib/procurement/types/supplier";
export type {
  PurchaseRequisitionRecord,
  RequisitionStatus,
  PurchaseApprovalRecord,
  CreateRequisitionInput,
  UpdateRequisitionInput,
} from "@/lib/procurement/types/requisition";
export type {
  PurchaseOrderRecord,
  PurchaseOrderStatus,
  PurchaseContractRecord,
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderInput,
  AmendPurchaseOrderInput,
  CreatePurchaseContractInput,
  UpdatePurchaseContractInput,
} from "@/lib/procurement/types/purchase-order";
export type {
  GoodsReceiptRecord,
  GoodsReceiptStatus,
  ReceivingLineRecord,
  CreateGoodsReceiptInput,
  UpdateGoodsReceiptInput,
  CreateReceivingLineInput,
  UpdateReceivingLineInput,
  ReceiveItemsInput,
} from "@/lib/procurement/types/goods-receipt";
export type {
  SupplierInvoiceRecord,
  SupplierInvoiceStatus,
  SupplierInvoiceLineItem,
  CreateSupplierInvoiceInput,
  UpdateSupplierInvoiceInput,
} from "@/lib/procurement/types/supplier-invoice";
export const procurementSupplierService = procurementFacade.suppliers.vendor;
export const procurementVendorContactService = procurementFacade.suppliers.contacts;
export const procurementVendorScorecardService = procurementFacade.suppliers.scorecards;
export const procurementRequisitionService = procurementFacade.requisitions.purchase;
export const procurementApprovalService = procurementFacade.requisitions.approval;
export const procurementPurchaseOrderService = procurementFacade.orders.purchase;
export const procurementPurchaseContractService = procurementFacade.orders.contracts;
export const procurementGoodsReceiptService = procurementFacade.receiving.goodsReceipt;
export const procurementReceivingLineService = procurementFacade.receiving.lines;
export const procurementSupplierInvoiceService = procurementFacade.invoices;
export {
  procurementOk,
  procurementCreated,
  procurementFromError,
} from "@/lib/procurement/api/procurementApiResponse";
export {
  PROCUREMENT_SEED_ORG_ID,
  PROCUREMENT_FOUNDATION_VERSION,
  PROCUREMENT_REPOSITORY_INFRASTRUCTURE_VERSION,
  createProcurementStore,
  seedProcurementStore,
  registerOrganizationFoundation,
  isOrganizationRegistered,
} from "@/lib/procurement/persistence/createProcurementStore";
export type {
  ProcurementStoreBacking,
  ProcurementPersistenceCollection,
  ProcurementAggregateRecord,
} from "@/lib/procurement/persistence/ProcurementStoreBacking";
export type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
export {
  ensureProcurementPlatformBacking,
  createIsolatedProcurementBacking,
} from "@/lib/procurement/persistence/ProcurementPlatformBacking";
export {
  createProcurementRepositories,
  type ProcurementRepositories,
  type CreateProcurementRepositoriesOptions,
} from "@/lib/procurement/persistence/createProcurementRepositories";
export {
  createProcurementPersistenceRepositories,
  type ProcurementPersistenceRepositories,
  type CreateProcurementPersistenceRepositoriesOptions,
} from "@/lib/procurement/persistence/createProcurementPersistenceRepositories";
export {
  getProcurementBackingCollection,
  listProcurementPersistenceCollections,
  isProcurementPersistenceCollection,
  assertProcurementBackingCollections,
  PROCUREMENT_PERSISTENCE_COLLECTIONS,
} from "@/lib/procurement/persistence/procurementBackingCollections";
export { InMemoryProcurementRepository } from "@/lib/procurement/persistence/InMemoryProcurementRepository";
export { PostgresProcurementRepository } from "@/lib/procurement/persistence/PostgresProcurementRepository";
export { canUsePostgresProcurementPersistence } from "@/lib/procurement/persistence/procurementPostgresPersistence";
export {
  getProcurementEventPipelineRegistry,
  setProcurementEventPipelineRegistry,
} from "@/lib/procurement/services/procurementEventPipelineRegistry";
export {
  PROCUREMENT_CANONICAL_EVENT_VERSION,
  PROCUREMENT_CANONICAL_OUTBOUND_EVENTS,
  PROCUREMENT_CANONICAL_ENTITY_TYPES,
  PROCUREMENT_ALL_OUTBOUND_EVENTS,
  assertUniqueProcurementEventCatalog,
  ProcurementCanonicalEventPublisher,
  defaultProcurementCanonicalEventPublisher,
  buildProcurementCanonicalIdempotencyKey,
} from "@/lib/procurement/events";
export type {
  ProcurementCanonicalEventType,
  ProcurementOutboundEventType,
} from "@/lib/procurement/events";
export {
  PROCUREMENT_PERMISSIONS,
  resolveProcurementRoutePermission,
  listProcurementRouteRules,
  ProcurementAuthorizationService,
  defaultProcurementAuthorizationService,
  getProcurementApiContext,
  getProcurementApiContextForRequest,
  ProcurementAuthorizationError,
} from "@/lib/procurement/security";
export type {
  ProcurementPermissionCode,
  ProcurementRoutePermissionRule,
  ProcurementApiContextOptions,
} from "@/lib/procurement/security";
