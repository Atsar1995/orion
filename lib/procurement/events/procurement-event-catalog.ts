import { PROCUREMENT_CANONICAL_OUTBOUND_EVENTS } from "@/lib/procurement/events/procurementOutboundEvents";

export const PROCUREMENT_ALL_OUTBOUND_EVENTS = [
  ...PROCUREMENT_CANONICAL_OUTBOUND_EVENTS,
] as const;

export type ProcurementOutboundEventType = (typeof PROCUREMENT_ALL_OUTBOUND_EVENTS)[number];

/** Ensures the Procurement event catalogue contains no duplicate identifiers. */
export function assertUniqueProcurementEventCatalog(
  events: readonly string[] = PROCUREMENT_ALL_OUTBOUND_EVENTS,
): void {
  const seen = new Set<string>();
  for (const eventType of events) {
    if (seen.has(eventType)) {
      throw new Error(`DUPLICATE_PROCUREMENT_EVENT:${eventType}`);
    }
    seen.add(eventType);
  }
}

assertUniqueProcurementEventCatalog();
