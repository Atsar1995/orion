/**
 * Shared Procurement business service utilities (Mission P-010.7).
 */

import type { ProcurementAggregateRecord } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import { AuthorizationError } from "@/lib/platform/security/AuthorizationResult";
import type { PermissionCode } from "@/lib/platform/security/Permission";
import type { ProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import type { VendorRecord } from "@/lib/procurement/types/supplier";
import type { PurchaseRequisitionRecord } from "@/lib/procurement/types/requisition";
import type {
  PurchaseContractRecord,
  PurchaseOrderRecord,
} from "@/lib/procurement/types/purchase-order";
import type {
  GoodsReceiptRecord,
  ReceivingLineRecord,
} from "@/lib/procurement/types/goods-receipt";
import type { SupplierInvoiceRecord } from "@/lib/procurement/types/supplier-invoice";
import type { ServiceContext } from "@/types/services";

export function nowIso(): string {
  return new Date().toISOString();
}

export function asVendorRecord(record: ProcurementAggregateRecord): VendorRecord {
  return record as VendorRecord;
}

export function asRequisitionRecord(record: ProcurementAggregateRecord): PurchaseRequisitionRecord {
  return record as PurchaseRequisitionRecord;
}

export function getRequisitionOrThrow(
  repository: ProcurementPersistenceRepository,
  requisitionId: string,
  context: ServiceContext,
): PurchaseRequisitionRecord {
  const record = repository.getById(context.organizationId, "requisitions", requisitionId);
  if (!record) {
    throw new Error("REQUISITION_NOT_FOUND");
  }
  return asRequisitionRecord(record);
}

export function asPurchaseOrderRecord(record: ProcurementAggregateRecord): PurchaseOrderRecord {
  return record as PurchaseOrderRecord;
}

export function asPurchaseContractRecord(record: ProcurementAggregateRecord): PurchaseContractRecord {
  return record as PurchaseContractRecord;
}

export function getPurchaseOrderOrThrow(
  repository: ProcurementPersistenceRepository,
  purchaseOrderId: string,
  context: ServiceContext,
): PurchaseOrderRecord {
  const record = repository.getById(context.organizationId, "purchaseOrders", purchaseOrderId);
  if (!record) {
    throw new Error("PURCHASE_ORDER_NOT_FOUND");
  }
  return asPurchaseOrderRecord(record);
}

export function getPurchaseContractOrThrow(
  repository: ProcurementPersistenceRepository,
  contractId: string,
  context: ServiceContext,
): PurchaseContractRecord {
  const record = repository.getById(context.organizationId, "purchaseContracts", contractId);
  if (!record) {
    throw new Error("CONTRACT_NOT_FOUND");
  }
  return asPurchaseContractRecord(record);
}

export function assertUniquePurchaseOrderNumber(
  repository: ProcurementPersistenceRepository,
  organizationId: string,
  purchaseOrderNumber: string,
  excludePurchaseOrderId?: string,
): void {
  const normalized = purchaseOrderNumber.trim().toUpperCase();
  if (!normalized) {
    throw new Error("INVALID_PURCHASE_ORDER_NUMBER");
  }

  const duplicate = repository
    .listByOrganization(organizationId, "purchaseOrders")
    .map(asPurchaseOrderRecord)
    .find(
      (entry) =>
        entry.purchaseOrderNumber.toUpperCase() === normalized &&
        (!excludePurchaseOrderId || entry.id !== excludePurchaseOrderId),
    );

  if (duplicate) {
    throw new Error("DUPLICATE_PURCHASE_ORDER_NUMBER");
  }
}

export function assertUniqueContractNumber(
  repository: ProcurementPersistenceRepository,
  organizationId: string,
  contractNumber: string,
  excludeContractId?: string,
): void {
  const normalized = contractNumber.trim().toUpperCase();
  if (!normalized) {
    throw new Error("INVALID_CONTRACT_NUMBER");
  }

  const duplicate = repository
    .listByOrganization(organizationId, "purchaseContracts")
    .map(asPurchaseContractRecord)
    .find(
      (entry) =>
        entry.contractNumber.toUpperCase() === normalized &&
        (!excludeContractId || entry.id !== excludeContractId),
    );

  if (duplicate) {
    throw new Error("DUPLICATE_CONTRACT_NUMBER");
  }
}

export function assertApprovedRequisition(
  repository: ProcurementPersistenceRepository,
  requisitionId: string,
  context: ServiceContext,
): PurchaseRequisitionRecord {
  const requisition = getRequisitionOrThrow(repository, requisitionId, context);
  if (requisition.status !== "approved" && requisition.status !== "closed") {
    throw new Error("REQUISITION_NOT_APPROVED");
  }
  return requisition;
}

export function assertContractVendorMatch(
  contract: PurchaseContractRecord,
  vendorId: string,
): void {
  if (contract.vendorId !== vendorId) {
    throw new Error("CONTRACT_VENDOR_MISMATCH");
  }
}

export function asGoodsReceiptRecord(record: ProcurementAggregateRecord): GoodsReceiptRecord {
  return record as GoodsReceiptRecord;
}

export function asReceivingLineRecord(record: ProcurementAggregateRecord): ReceivingLineRecord {
  return record as ReceivingLineRecord;
}

export function getGoodsReceiptOrThrow(
  repository: ProcurementPersistenceRepository,
  goodsReceiptId: string,
  context: ServiceContext,
): GoodsReceiptRecord {
  const record = repository.getById(context.organizationId, "goodsReceipts", goodsReceiptId);
  if (!record) {
    throw new Error("GOODS_RECEIPT_NOT_FOUND");
  }
  return asGoodsReceiptRecord(record);
}

export function getReceivingLineOrThrow(
  repository: ProcurementPersistenceRepository,
  lineId: string,
  context: ServiceContext,
): ReceivingLineRecord {
  const record = repository.getById(context.organizationId, "receivingLines", lineId);
  if (!record) {
    throw new Error("RECEIVING_LINE_NOT_FOUND");
  }
  return asReceivingLineRecord(record);
}

export function listReceivingLinesForReceipt(
  repository: ProcurementPersistenceRepository,
  goodsReceiptId: string,
  organizationId: string,
): readonly ReceivingLineRecord[] {
  return repository
    .listByOrganization(organizationId, "receivingLines")
    .map(asReceivingLineRecord)
    .filter((entry) => entry.goodsReceiptId === goodsReceiptId);
}

export function assertApprovedPurchaseOrderForReceipt(
  repository: ProcurementPersistenceRepository,
  purchaseOrderId: string,
  context: ServiceContext,
): PurchaseOrderRecord {
  const purchaseOrder = getPurchaseOrderOrThrow(repository, purchaseOrderId, context);
  if (purchaseOrder.status !== "approved" && purchaseOrder.status !== "closed") {
    throw new Error("PURCHASE_ORDER_NOT_APPROVED");
  }
  return purchaseOrder;
}

export function assertUniqueGoodsReceiptNumber(
  repository: ProcurementPersistenceRepository,
  organizationId: string,
  goodsReceiptNumber: string,
  excludeGoodsReceiptId?: string,
): void {
  const normalized = goodsReceiptNumber.trim().toUpperCase();
  if (!normalized) {
    throw new Error("INVALID_GOODS_RECEIPT_NUMBER");
  }

  const duplicate = repository
    .listByOrganization(organizationId, "goodsReceipts")
    .map(asGoodsReceiptRecord)
    .find(
      (entry) =>
        entry.goodsReceiptNumber.toUpperCase() === normalized &&
        (!excludeGoodsReceiptId || entry.id !== excludeGoodsReceiptId),
    );

  if (duplicate) {
    throw new Error("DUPLICATE_GOODS_RECEIPT_NUMBER");
  }
}

export function asSupplierInvoiceRecord(record: ProcurementAggregateRecord): SupplierInvoiceRecord {
  return record as SupplierInvoiceRecord;
}

export function getSupplierInvoiceOrThrow(
  repository: ProcurementPersistenceRepository,
  invoiceId: string,
  context: ServiceContext,
): SupplierInvoiceRecord {
  const record = repository.getById(context.organizationId, "supplierInvoices", invoiceId);
  if (!record) {
    throw new Error("SUPPLIER_INVOICE_NOT_FOUND");
  }
  return asSupplierInvoiceRecord(record);
}

export function getVendorOrThrow(
  repository: ProcurementPersistenceRepository,
  vendorId: string,
  context: ServiceContext,
): VendorRecord {
  const record = repository.getById(context.organizationId, "vendors", vendorId);
  if (!record) {
    throw new Error("VENDOR_NOT_FOUND");
  }
  return asVendorRecord(record);
}

export function assertUniqueVendorCode(
  repository: ProcurementPersistenceRepository,
  organizationId: string,
  vendorCode: string,
  excludeVendorId?: string,
): void {
  const normalized = vendorCode.trim().toUpperCase();
  if (!normalized) {
    throw new Error("INVALID_VENDOR_CODE");
  }

  const duplicate = repository
    .listByOrganization(organizationId, "vendors")
    .map(asVendorRecord)
    .find(
      (entry) =>
        entry.vendorCode.toUpperCase() === normalized &&
        (!excludeVendorId || entry.id !== excludeVendorId),
    );

  if (duplicate) {
    throw new Error("DUPLICATE_VENDOR_CODE");
  }
}

export function assertProcurementPermission(
  authorization: ProcurementAuthorizationService,
  context: ServiceContext,
  permission: PermissionCode,
  resourceOrganizationId?: string,
): void {
  const result = authorization.authorize(context, permission, { resourceOrganizationId });
  if (!result.allowed) {
    throw new AuthorizationError("FORBIDDEN", result.reason, permission);
  }
}
