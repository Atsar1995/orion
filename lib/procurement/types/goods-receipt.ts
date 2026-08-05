/**
 * Goods Receipt domain types (Mission P-010.10).
 */

import type { ProcurementScopedRecord } from "@/lib/procurement/types/procurement-core";

export type GoodsReceiptStatus =
  | "draft"
  | "receiving"
  | "partially_received"
  | "received"
  | "cancelled"
  | "closed";

/** Organization-scoped goods receipt header record. */
export type GoodsReceiptRecord = ProcurementScopedRecord & {
  readonly goodsReceiptNumber: string;
  readonly status: GoodsReceiptStatus;
  readonly purchaseOrderId: string;
  readonly vendorId: string;
  readonly receivingStartedAt?: string;
  readonly receivedAt?: string;
  readonly cancelledAt?: string;
  readonly closedAt?: string;
};

/** Receiving line linked to a goods receipt. */
export type ReceivingLineRecord = ProcurementScopedRecord & {
  readonly goodsReceiptId: string;
  readonly purchaseOrderId: string;
  readonly itemCode: string;
  readonly description?: string;
  readonly orderedQuantity: string;
  readonly receivedQuantity: string;
};

export type CreateGoodsReceiptInput = {
  readonly goodsReceiptNumber: string;
  readonly purchaseOrderId: string;
  readonly lines?: readonly CreateReceivingLineInput[];
};

export type UpdateGoodsReceiptInput = {
  readonly goodsReceiptNumber?: string;
};

export type CreateReceivingLineInput = {
  readonly itemCode: string;
  readonly description?: string;
  readonly orderedQuantity: string;
};

export type UpdateReceivingLineInput = {
  readonly itemCode?: string;
  readonly description?: string;
  readonly orderedQuantity?: string;
};

export type ReceiveItemsInput = {
  readonly lines: readonly {
    readonly lineId: string;
    readonly receivedQuantity: string;
  }[];
};

export type GoodsReceiptListFilter = {
  readonly status?: GoodsReceiptStatus;
  readonly purchaseOrderId?: string;
  readonly query?: string;
};

export type GoodsReceiptListView = {
  readonly total: number;
  readonly items: readonly GoodsReceiptRecord[];
};
