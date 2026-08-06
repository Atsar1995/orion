/** Canonical Procurement → Finance event types (ADR-014 · P-010.19). */

/** Events that post journals through the Finance inbound processor. */
export const PROCUREMENT_FINANCE_POSTABLE_EVENT_TYPES = [
  "procurement.invoice.approved",
  "procurement.purchaseorder.approved",
] as const;

/** Events with validated envelopes but deferred posting mappings. */
export const PROCUREMENT_FINANCE_FUTURE_EVENT_TYPES = [
  "procurement.goods.received",
] as const;

export const PROCUREMENT_FINANCE_EVENT_TYPES = [
  ...PROCUREMENT_FINANCE_POSTABLE_EVENT_TYPES,
  ...PROCUREMENT_FINANCE_FUTURE_EVENT_TYPES,
] as const;

export type ProcurementFinancePostableEventType =
  (typeof PROCUREMENT_FINANCE_POSTABLE_EVENT_TYPES)[number];

export type ProcurementFinanceFutureEventType =
  (typeof PROCUREMENT_FINANCE_FUTURE_EVENT_TYPES)[number];

export type ProcurementFinanceEventType = (typeof PROCUREMENT_FINANCE_EVENT_TYPES)[number];

/** Returns true when the canonical type is a supported Finance inbound Procurement event. */
export function isSupportedProcurementFinanceEventType(
  canonicalEventType: string | undefined,
): canonicalEventType is ProcurementFinanceEventType {
  return (
    canonicalEventType !== undefined &&
    (PROCUREMENT_FINANCE_EVENT_TYPES as readonly string[]).includes(canonicalEventType)
  );
}

/** Returns true for future-ready Procurement events that accept envelopes but do not post yet. */
export function isProcurementFutureFinanceEventType(
  canonicalEventType: string | undefined,
): canonicalEventType is ProcurementFinanceFutureEventType {
  return (
    canonicalEventType !== undefined &&
    (PROCUREMENT_FINANCE_FUTURE_EVENT_TYPES as readonly string[]).includes(canonicalEventType)
  );
}

/** Returns true for unsupported `procurement.*` canonical types (graceful rejection target). */
export function isUnsupportedProcurementCanonicalEventType(
  canonicalEventType: string | undefined,
): boolean {
  return (
    canonicalEventType !== undefined &&
    canonicalEventType.startsWith("procurement.") &&
    !isSupportedProcurementFinanceEventType(canonicalEventType)
  );
}
