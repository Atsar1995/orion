/** ADR-014 Procurement canonical outbound event contracts (Mission P-010.6). */

export const PROCUREMENT_CANONICAL_EVENT_VERSION = "1";

/** Version 1 canonical Procurement → enterprise event contracts. */
export const PROCUREMENT_CANONICAL_OUTBOUND_EVENTS = [
  "procurement.vendor.created",
  "procurement.vendor.updated",
  "procurement.requisition.created",
  "procurement.requisition.approved",
  "procurement.rfq.sent",
  "procurement.quotation.received",
  "procurement.purchaseorder.created",
  "procurement.purchaseorder.approved",
  "procurement.goods.received",
  "procurement.invoice.received",
  "procurement.invoice.approved",
  "procurement.contract.created",
] as const;

export type ProcurementCanonicalEventType =
  (typeof PROCUREMENT_CANONICAL_OUTBOUND_EVENTS)[number];

/** Entity type labels used in ADR-014 envelopes. */
export const PROCUREMENT_CANONICAL_ENTITY_TYPES = {
  vendor: "vendor",
  requisition: "requisition",
  rfq: "rfq",
  quotation: "quotation",
  purchaseOrder: "purchaseorder",
  goodsReceipt: "goodsreceipt",
  invoice: "invoice",
  contract: "contract",
} as const;
