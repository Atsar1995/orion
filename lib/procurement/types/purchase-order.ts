/**
 * Purchase Order domain types (Mission P-010.9).
 */

import type { ProcurementScopedRecord } from "@/lib/procurement/types/procurement-core";

export type PurchaseOrderStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "cancelled"
  | "closed";

/** Organization-scoped purchase order record. */
export type PurchaseOrderRecord = ProcurementScopedRecord & {
  readonly purchaseOrderNumber: string;
  readonly status: PurchaseOrderStatus;
  readonly vendorId: string;
  readonly requisitionId?: string;
  readonly contractId?: string;
  readonly amount?: string;
  readonly currencyCode?: string;
  readonly amendmentVersion: number;
  readonly submittedAt?: string;
  readonly approvedAt?: string;
  readonly approvedBy?: string;
  readonly cancelledAt?: string;
  readonly closedAt?: string;
};

export type CreatePurchaseOrderInput = {
  readonly purchaseOrderNumber: string;
  readonly vendorId: string;
  readonly requisitionId?: string;
  readonly contractId?: string;
  readonly amount?: string;
  readonly currencyCode?: string;
};

export type UpdatePurchaseOrderInput = {
  readonly amount?: string;
  readonly currencyCode?: string;
  readonly contractId?: string;
};

export type AmendPurchaseOrderInput = {
  readonly amount?: string;
  readonly currencyCode?: string;
  readonly contractId?: string;
  readonly amendmentNote?: string;
};

export type PurchaseOrderListFilter = {
  readonly status?: PurchaseOrderStatus;
  readonly vendorId?: string;
  readonly query?: string;
};

export type PurchaseOrderListView = {
  readonly total: number;
  readonly items: readonly PurchaseOrderRecord[];
};

export type PurchaseContractStatus = "draft" | "active" | "expired" | "cancelled";

/** Organization-scoped purchase contract record. */
export type PurchaseContractRecord = ProcurementScopedRecord & {
  readonly contractNumber: string;
  readonly title: string;
  readonly vendorId: string;
  readonly status: PurchaseContractStatus;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
  readonly amount?: string;
  readonly currencyCode?: string;
};

export type CreatePurchaseContractInput = {
  readonly contractNumber: string;
  readonly title: string;
  readonly vendorId: string;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
  readonly amount?: string;
  readonly currencyCode?: string;
};

export type UpdatePurchaseContractInput = {
  readonly title?: string;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
  readonly amount?: string;
  readonly currencyCode?: string;
  readonly status?: PurchaseContractStatus;
};
