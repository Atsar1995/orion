/**
 * Goods receipt workflow transition rules (Mission P-010.10).
 */

import type { GoodsReceiptStatus } from "@/lib/procurement/types/goods-receipt";

const ALLOWED_TRANSITIONS: Readonly<Record<GoodsReceiptStatus, readonly GoodsReceiptStatus[]>> = {
  draft: ["receiving", "cancelled"],
  receiving: ["partially_received", "received", "cancelled"],
  partially_received: ["received", "cancelled"],
  received: ["closed"],
  cancelled: [],
  closed: [],
};

const RECEIVABLE_STATUSES: readonly GoodsReceiptStatus[] = [
  "receiving",
  "partially_received",
];

/** Validates and returns the next goods receipt status or throws on invalid transition. */
export function assertGoodsReceiptTransition(
  current: GoodsReceiptStatus,
  next: GoodsReceiptStatus,
): GoodsReceiptStatus {
  if (current === next) {
    return next;
  }

  const allowed = ALLOWED_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new Error("INVALID_GOODS_RECEIPT_TRANSITION");
  }

  return next;
}

export function canReceiveItems(status: GoodsReceiptStatus): boolean {
  return RECEIVABLE_STATUSES.includes(status);
}

export function canEditGoodsReceiptLines(status: GoodsReceiptStatus): boolean {
  return status === "draft";
}
