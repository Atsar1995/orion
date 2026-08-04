/** ADR-014 CRM canonical outbound event contracts (Mission P-008.14). */

export const CRM_CANONICAL_EVENT_VERSION = "1";

/** Version 1 canonical CRM → enterprise event contracts. */
export const CRM_CANONICAL_OUTBOUND_EVENTS = [
  "crm.lead.created",
  "crm.lead.qualified",
  "crm.opportunity.created",
  "crm.opportunity.closed",
  "crm.quote.created",
  "crm.customer.created",
  "crm.customer.updated",
  "crm.salesorder.confirmed",
  "crm.revenue.recognized",
  "crm.case.closed",
] as const;

export type CrmCanonicalEventType = (typeof CRM_CANONICAL_OUTBOUND_EVENTS)[number];

/** Entity type labels used in ADR-014 envelopes. */
export const CRM_CANONICAL_ENTITY_TYPES = {
  lead: "lead",
  opportunity: "opportunity",
  quote: "quote",
  customer: "customer",
  salesOrder: "salesorder",
  case: "case",
  revenue: "revenue",
} as const;
