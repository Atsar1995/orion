/**
 * Supplier invoice validation — three-way match preparation (Mission P-010.11).
 */

import type { ProcurementPersistenceRepository } from "@/lib/procurement/persistence/ProcurementPersistenceRepository";
import type { GoodsReceiptRecord } from "@/lib/procurement/types/goods-receipt";
import type { PurchaseOrderRecord } from "@/lib/procurement/types/purchase-order";
import type {
  CreateSupplierInvoiceInput,
  SupplierInvoiceLineItem,
  SupplierInvoiceRecord,
  UpdateSupplierInvoiceInput,
} from "@/lib/procurement/types/supplier-invoice";
import { parseQuantity } from "@/lib/procurement/services/goodsReceiptQuantity";
import {
  asGoodsReceiptRecord,
  asPurchaseOrderRecord,
  asSupplierInvoiceRecord,
  getGoodsReceiptOrThrow,
  getPurchaseOrderOrThrow,
  getVendorOrThrow,
  listReceivingLinesForReceipt,
} from "@/lib/procurement/services/procurementServiceUtils";
import type { ServiceContext } from "@/types/services";

const RECEIVED_GOODS_RECEIPT_STATUSES: readonly GoodsReceiptRecord["status"][] = [
  "received",
  "closed",
];

export function validateInvoiceLineItems(lineItems: readonly SupplierInvoiceLineItem[]): void {
  if (lineItems.length === 0) {
    throw new Error("SUPPLIER_INVOICE_LINES_REQUIRED");
  }

  for (const line of lineItems) {
    if (!line.itemCode.trim()) {
      throw new Error("INVALID_ITEM_CODE");
    }
    parseQuantity(line.quantity);
    parseQuantity(line.unitPrice);
  }
}

export function validateCreateSupplierInvoiceInput(input: CreateSupplierInvoiceInput): void {
  const invoiceNumber = input.invoiceNumber.trim();
  if (!invoiceNumber) {
    throw new Error("INVALID_INVOICE_NUMBER");
  }

  if (!input.vendorId.trim()) {
    throw new Error("VENDOR_NOT_FOUND");
  }

  if (!input.currencyCode.trim()) {
    throw new Error("INVALID_CURRENCY_CODE");
  }

  parseQuantity(input.totalAmount);
  validateInvoiceLineItems(input.lineItems);
}

export function validateUpdateSupplierInvoiceInput(input: UpdateSupplierInvoiceInput): void {
  if (input.currencyCode !== undefined && !input.currencyCode.trim()) {
    throw new Error("INVALID_CURRENCY_CODE");
  }

  if (input.totalAmount !== undefined) {
    parseQuantity(input.totalAmount);
  }

  if (input.lineItems !== undefined) {
    validateInvoiceLineItems(input.lineItems);
  }
}

export function assertUniqueInvoiceNumber(
  repository: ProcurementPersistenceRepository,
  organizationId: string,
  invoiceNumber: string,
  excludeInvoiceId?: string,
): void {
  const normalized = invoiceNumber.trim().toUpperCase();
  if (!normalized) {
    throw new Error("INVALID_INVOICE_NUMBER");
  }

  const duplicate = repository
    .listByOrganization(organizationId, "supplierInvoices")
    .map(asSupplierInvoiceRecord)
    .find(
      (entry) =>
        entry.invoiceNumber.toUpperCase() === normalized &&
        (!excludeInvoiceId || entry.id !== excludeInvoiceId),
    );

  if (duplicate) {
    throw new Error("DUPLICATE_INVOICE_NUMBER");
  }
}

export function assertDuplicateInvoiceForVendor(
  repository: ProcurementPersistenceRepository,
  organizationId: string,
  vendorId: string,
  invoiceNumber: string,
  excludeInvoiceId?: string,
): void {
  const normalized = invoiceNumber.trim().toUpperCase();
  const duplicate = repository
    .listByOrganization(organizationId, "supplierInvoices")
    .map(asSupplierInvoiceRecord)
    .find(
      (entry) =>
        entry.vendorId === vendorId &&
        entry.invoiceNumber.toUpperCase() === normalized &&
        entry.status !== "cancelled" &&
        entry.status !== "rejected" &&
        (!excludeInvoiceId || entry.id !== excludeInvoiceId),
    );

  if (duplicate) {
    throw new Error("DUPLICATE_VENDOR_INVOICE");
  }
}

export function assertCurrencyConsistency(
  invoiceCurrency: string,
  purchaseOrder?: PurchaseOrderRecord,
): void {
  if (!purchaseOrder?.currencyCode) {
    return;
  }

  if (invoiceCurrency.trim().toUpperCase() !== purchaseOrder.currencyCode.trim().toUpperCase()) {
    throw new Error("INVOICE_CURRENCY_MISMATCH");
  }
}

export function validatePurchaseOrderForInvoiceMatch(
  repository: ProcurementPersistenceRepository,
  purchaseOrderId: string,
  invoice: SupplierInvoiceRecord,
  context: ServiceContext,
): PurchaseOrderRecord {
  const purchaseOrder = getPurchaseOrderOrThrow(repository, purchaseOrderId, context);

  if (purchaseOrder.status !== "approved" && purchaseOrder.status !== "closed") {
    throw new Error("PURCHASE_ORDER_NOT_APPROVED");
  }

  if (purchaseOrder.vendorId !== invoice.vendorId) {
    throw new Error("INVOICE_VENDOR_MISMATCH");
  }

  assertCurrencyConsistency(invoice.currencyCode, purchaseOrder);
  return purchaseOrder;
}

export function validateGoodsReceiptForInvoiceMatch(
  repository: ProcurementPersistenceRepository,
  goodsReceiptId: string,
  invoice: SupplierInvoiceRecord,
  context: ServiceContext,
): GoodsReceiptRecord {
  const goodsReceipt = getGoodsReceiptOrThrow(repository, goodsReceiptId, context);

  if (!RECEIVED_GOODS_RECEIPT_STATUSES.includes(goodsReceipt.status)) {
    throw new Error("GOODS_RECEIPT_NOT_RECEIVED");
  }

  if (goodsReceipt.vendorId !== invoice.vendorId) {
    throw new Error("INVOICE_VENDOR_MISMATCH");
  }

  const purchaseOrderId = invoice.purchaseOrderId;
  if (!purchaseOrderId) {
    throw new Error("PURCHASE_ORDER_MATCH_REQUIRED");
  }

  if (goodsReceipt.purchaseOrderId !== purchaseOrderId) {
    throw new Error("GOODS_RECEIPT_PURCHASE_ORDER_MISMATCH");
  }

  return goodsReceipt;
}

export function assertThreeWayMatchPreparation(
  repository: ProcurementPersistenceRepository,
  invoice: SupplierInvoiceRecord,
  context: ServiceContext,
): void {
  if (!invoice.purchaseOrderId || !invoice.goodsReceiptId) {
    throw new Error("THREE_WAY_MATCH_INCOMPLETE");
  }

  const purchaseOrder = validatePurchaseOrderForInvoiceMatch(
    repository,
    invoice.purchaseOrderId,
    invoice,
    context,
  );
  const goodsReceipt = validateGoodsReceiptForInvoiceMatch(
    repository,
    invoice.goodsReceiptId,
    invoice,
    context,
  );

  assertInvoiceLineItemsAgainstReceipt(
    invoice.lineItems,
    listReceivingLinesForReceipt(repository, goodsReceipt.id, context.organizationId),
  );

  assertCurrencyConsistency(invoice.currencyCode, purchaseOrder);
}

function assertInvoiceLineItemsAgainstReceipt(
  lineItems: readonly SupplierInvoiceLineItem[],
  receivingLines: readonly { readonly itemCode: string; readonly receivedQuantity: string }[],
): void {
  for (const line of lineItems) {
    const receiptLine = receivingLines.find(
      (entry) => entry.itemCode.toUpperCase() === line.itemCode.trim().toUpperCase(),
    );

    if (!receiptLine) {
      throw new Error("INVOICE_ITEM_NOT_ON_RECEIPT");
    }

    const invoicedQty = parseQuantity(line.quantity);
    const receivedQty = parseQuantity(receiptLine.receivedQuantity);
    if (invoicedQty > receivedQty) {
      throw new Error("INVOICE_QUANTITY_EXCEEDS_RECEIVED");
    }
  }
}

export function validateSupplierForInvoice(
  repository: ProcurementPersistenceRepository,
  vendorId: string,
  context: ServiceContext,
): void {
  getVendorOrThrow(repository, vendorId, context);
}

export function resolveOptionalPurchaseOrder(
  repository: ProcurementPersistenceRepository,
  purchaseOrderId: string | undefined,
  vendorId: string,
  currencyCode: string,
  context: ServiceContext,
): PurchaseOrderRecord | undefined {
  if (!purchaseOrderId) {
    return undefined;
  }

  const purchaseOrder = getPurchaseOrderOrThrow(repository, purchaseOrderId, context);
  if (purchaseOrder.vendorId !== vendorId) {
    throw new Error("INVOICE_VENDOR_MISMATCH");
  }

  assertCurrencyConsistency(currencyCode, purchaseOrder);
  return purchaseOrder;
}

export function resolveOptionalGoodsReceipt(
  repository: ProcurementPersistenceRepository,
  goodsReceiptId: string | undefined,
  vendorId: string,
  purchaseOrderId: string | undefined,
  context: ServiceContext,
): GoodsReceiptRecord | undefined {
  if (!goodsReceiptId) {
    return undefined;
  }

  const goodsReceipt = getGoodsReceiptOrThrow(repository, goodsReceiptId, context);
  if (goodsReceipt.vendorId !== vendorId) {
    throw new Error("INVOICE_VENDOR_MISMATCH");
  }

  if (purchaseOrderId && goodsReceipt.purchaseOrderId !== purchaseOrderId) {
    throw new Error("GOODS_RECEIPT_PURCHASE_ORDER_MISMATCH");
  }

  return goodsReceipt;
}
