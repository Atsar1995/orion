import "@/lib/crm/events/crm-event-catalog";

export {
  CRM_CANONICAL_EVENT_VERSION,
  CRM_CANONICAL_OUTBOUND_EVENTS,
  CRM_CANONICAL_ENTITY_TYPES,
  type CrmCanonicalEventType,
} from "@/lib/crm/events/crmOutboundEvents";

export {
  CRM_ALL_OUTBOUND_EVENTS,
  assertUniqueCrmEventCatalog,
  type CrmOutboundEventType,
} from "@/lib/crm/events/crm-event-catalog";

export {
  CrmCanonicalEventPublisher,
  defaultCrmCanonicalEventPublisher,
  buildCrmCanonicalIdempotencyKey,
} from "@/lib/crm/events/CrmCanonicalEventPublisher";
