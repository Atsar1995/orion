/**
 * Requisition workflow transition rules (Mission P-010.8).
 */

import type { RequisitionStatus } from "@/lib/procurement/types/requisition";

const ALLOWED_TRANSITIONS: Readonly<Record<RequisitionStatus, readonly RequisitionStatus[]>> = {
  draft: ["submitted", "cancelled"],
  submitted: ["approved", "rejected", "cancelled"],
  approved: ["closed"],
  rejected: [],
  cancelled: [],
  closed: [],
};

/** Validates and returns the next requisition status or throws on invalid transition. */
export function assertRequisitionTransition(
  current: RequisitionStatus,
  next: RequisitionStatus,
): RequisitionStatus {
  if (current === next) {
    return next;
  }

  const allowed = ALLOWED_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new Error("INVALID_REQUISITION_TRANSITION");
  }

  return next;
}

export function canTransitionRequisition(
  current: RequisitionStatus,
  next: RequisitionStatus,
): boolean {
  if (current === next) {
    return true;
  }
  return ALLOWED_TRANSITIONS[current].includes(next);
}
