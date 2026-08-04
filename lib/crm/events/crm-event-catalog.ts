import { CRM_CANONICAL_OUTBOUND_EVENTS } from "@/lib/crm/events/crmOutboundEvents";

export const CRM_ALL_OUTBOUND_EVENTS = [...CRM_CANONICAL_OUTBOUND_EVENTS] as const;

export type CrmOutboundEventType = (typeof CRM_ALL_OUTBOUND_EVENTS)[number];

/** Ensures the CRM event catalogue contains no duplicate identifiers. */
export function assertUniqueCrmEventCatalog(
  events: readonly string[] = CRM_ALL_OUTBOUND_EVENTS,
): void {
  const seen = new Set<string>();
  for (const eventType of events) {
    if (seen.has(eventType)) {
      throw new Error(`DUPLICATE_CRM_EVENT:${eventType}`);
    }
    seen.add(eventType);
  }
}

assertUniqueCrmEventCatalog();
