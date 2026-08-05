/**
 * Purchase order workflow transition rules (Mission P-010.9).
 */

import type { PurchaseOrderStatus } from "@/lib/procurement/types/purchase-order";

const ALLOWED_TRANSITIONS: Readonly<Record<PurchaseOrderStatus, readonly PurchaseOrderStatus[]>> = {
  draft: ["submitted", "cancelled"],
  submitted: ["approved", "cancelled"],
  approved: ["closed"],
  cancelled: [],
  closed: [],
};

const AMENDABLE_STATUSES: readonly PurchaseOrderStatus[] = ["draft", "submitted", "approved"];

/** Validates and returns the next purchase order status or throws on invalid transition. */
export function assertPurchaseOrderTransition(
  current: PurchaseOrderStatus,
  next: PurchaseOrderStatus,
): PurchaseOrderStatus {
  if (current === next) {
    return next;
  }

  const allowed = ALLOWED_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new Error("INVALID_PURCHASE_ORDER_TRANSITION");
  }

  return next;
}

export function canAmendPurchaseOrder(status: PurchaseOrderStatus): boolean {
  return AMENDABLE_STATUSES.includes(status);
}
