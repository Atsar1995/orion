/**
 * Supplier Invoice domain types (Mission P-010.11).
 */

import type { ProcurementScopedRecord } from "@/lib/procurement/types/procurement-core";

export type SupplierInvoiceStatus =
  | "draft"
  | "submitted"
  | "matched"
  | "approved"
  | "posted"
  | "rejected"
  | "cancelled";

/** Line item on a supplier invoice — three-way match preparation. */
export type SupplierInvoiceLineItem = {
  readonly itemCode: string;
  readonly description?: string;
  readonly quantity: string;
  readonly unitPrice: string;
  readonly lineAmount?: string;
  readonly accountId?: string;
};

/** Organization-scoped supplier invoice record. */
export type SupplierInvoiceRecord = ProcurementScopedRecord & {
  readonly invoiceNumber: string;
  readonly status: SupplierInvoiceStatus;
  readonly vendorId: string;
  readonly purchaseOrderId?: string;
  readonly goodsReceiptId?: string;
  readonly currencyCode: string;
  readonly totalAmount: string;
  readonly lineItems: readonly SupplierInvoiceLineItem[];
  readonly purchaseOrderMatchedAt?: string;
  readonly goodsReceiptMatchedAt?: string;
  readonly submittedAt?: string;
  readonly matchedAt?: string;
  readonly approvedAt?: string;
  readonly approvedBy?: string;
  readonly rejectedAt?: string;
  readonly rejectedBy?: string;
  readonly rejectionReason?: string;
  readonly cancelledAt?: string;
  readonly postedAt?: string;
};

export type CreateSupplierInvoiceInput = {
  readonly invoiceNumber: string;
  readonly vendorId: string;
  readonly purchaseOrderId?: string;
  readonly goodsReceiptId?: string;
  readonly currencyCode: string;
  readonly totalAmount: string;
  readonly lineItems: readonly SupplierInvoiceLineItem[];
};

export type UpdateSupplierInvoiceInput = {
  readonly currencyCode?: string;
  readonly totalAmount?: string;
  readonly lineItems?: readonly SupplierInvoiceLineItem[];
  readonly purchaseOrderId?: string;
  readonly goodsReceiptId?: string;
};

export type SupplierInvoiceListFilter = {
  readonly status?: SupplierInvoiceStatus;
  readonly vendorId?: string;
  readonly purchaseOrderId?: string;
  readonly query?: string;
};

export type SupplierInvoiceListView = {
  readonly total: number;
  readonly items: readonly SupplierInvoiceRecord[];
};
