import "@/lib/procurement/events/procurement-event-catalog";

export {
  PROCUREMENT_CANONICAL_EVENT_VERSION,
  PROCUREMENT_CANONICAL_OUTBOUND_EVENTS,
  PROCUREMENT_CANONICAL_ENTITY_TYPES,
  type ProcurementCanonicalEventType,
} from "@/lib/procurement/events/procurementOutboundEvents";

export {
  PROCUREMENT_ALL_OUTBOUND_EVENTS,
  assertUniqueProcurementEventCatalog,
  type ProcurementOutboundEventType,
} from "@/lib/procurement/events/procurement-event-catalog";

export {
  ProcurementCanonicalEventPublisher,
  defaultProcurementCanonicalEventPublisher,
  buildProcurementCanonicalIdempotencyKey,
} from "@/lib/procurement/events/ProcurementCanonicalEventPublisher";
