# Procurement Canonical Event Publishers

**Document ID:** PROC-INT-001  
**Program:** P-010 — ORION Enterprise Procurement  
**Mission:** P-010.6 — Procurement Canonical Event Publisher & ADR-014 Integration  
**Version:** 1.0  
**Status:** Implemented  
**Classification:** Procurement Integration · Cross-Domain Events  
**Date:** 5 August 2026

**Baseline:** [Procurement-Engineering-Specification.md](../Procurement-Engineering-Specification.md) · [ADR-013](../../11_Governance/ADR/ADR-013-Durable-Intelligent-Integration-Layer.md) · [ADR-014](../../11_Governance/ADR/ADR-014-Cross-Domain-Event-Contracts.md) · CRM P-008.14 reference

---

## Purpose

Mission P-010.6 establishes Procurement as a **publish-only** enterprise event producer via the Durable Intelligent Integration Layer (ADR-013), using ADR-014 canonical event contracts.

**Scope:** Integration infrastructure only. No consumers, Finance integration, Inventory integration, REST routes, business services, or workflow emission.

---

## Publisher Lifecycle

```
Domain service (future trigger)
  └── ProcurementCanonicalEventPublisher.publish*()
        └── getIntelligenceIntegrationService().publish()
              └── createIntelligenceEvent + enrichDurableEnvelope (ADR-013)
                    └── Durable IIL transport (procurement-workspace)
                          └── Consumers: Finance · Inventory · Intelligence (future)
```

| Stage | Component | Responsibility |
|-------|-----------|----------------|
| **Trigger** | Procurement domain services *(future P-010.7+)* | Domain state transition |
| **Publish** | `ProcurementCanonicalEventPublisher` | Build ADR-014 envelope + deterministic idempotency key |
| **Transport** | IIL (`procurement-workspace`) | Persist-before-ack durable delivery |
| **Consume** | Finance · Inventory · Intelligence | Separate missions — not in P-010.6 scope |

---

## Canonical Contracts (Version 1)

| Canonical Type | Entity | Publisher Method |
|----------------|--------|------------------|
| `procurement.vendor.created` | `vendor` | `publishVendorCreated()` |
| `procurement.vendor.updated` | `vendor` | `publishVendorUpdated()` |
| `procurement.requisition.created` | `requisition` | `publishRequisitionCreated()` |
| `procurement.requisition.approved` | `requisition` | `publishRequisitionApproved()` |
| `procurement.rfq.sent` | `rfq` | `publishRfqSent()` |
| `procurement.quotation.received` | `quotation` | `publishQuotationReceived()` |
| `procurement.purchaseorder.created` | `purchaseorder` | `publishPurchaseOrderCreated()` |
| `procurement.purchaseorder.approved` | `purchaseorder` | `publishPurchaseOrderApproved()` |
| `procurement.goods.received` | `goodsreceipt` | `publishGoodsReceived()` |
| `procurement.invoice.received` | `invoice` | `publishInvoiceReceived()` |
| `procurement.invoice.approved` | `invoice` | `publishInvoiceApproved()` |
| `procurement.contract.created` | `contract` | `publishContractCreated()` |

### ADR-014 Envelope (required fields)

Every canonical publication includes:

- `eventId` — IIL-generated UUID
- `correlationId` — caller-supplied trace ID
- `causationId` — optional parent event reference
- `organizationId` — from `ServiceContext` (envelope level)
- `eventVersion` — `"1"` in payload
- `eventTimestamp` — ISO-8601 publish timestamp in payload
- `payload.canonicalEventType` — namespaced contract ID
- `payload.sourceDomain` — `"procurement"`
- `payload.idempotencyKey` — deterministic dedupe key
- `auditMetadata.sourceDomain` — `"procurement"`

### Idempotency key patterns

| Event | Pattern |
|-------|---------|
| Vendor created | `{org}:procurement-workspace:procurement-vendor-{vendorId}-created-v1` |
| Vendor updated | `{org}:procurement-workspace:procurement-vendor-{id}-updated-v{version}` |
| Requisition approved | `{org}:procurement-workspace:procurement-requisition-{id}-approved-v1` |
| Purchase order approved | `{org}:procurement-workspace:procurement-purchaseorder-{id}-approved-v1` |
| Invoice approved | `{org}:procurement-workspace:procurement-invoice-{id}-approved-v1` |

---

## Integration Policy

| Rule | Status |
|------|--------|
| **Publish only** | Procurement emits canonical events — no consumers in this mission |
| **No Finance mutations** | Invoice flows to Finance via future consumer missions |
| **No Inventory mutations** | Goods receipt flows to Inventory via future consumer missions |
| **No workflow changes** | Service triggers deferred to P-010.7+ |
| **Durable IIL** | All publication via `getIntelligenceIntegrationService()` |

---

## Implementation Map

| File | Role |
|------|------|
| `lib/procurement/events/ProcurementCanonicalEventPublisher.ts` | Canonical publish class + idempotency builder |
| `lib/procurement/events/procurementOutboundEvents.ts` | Version 1 contract constants |
| `lib/procurement/events/procurement-event-catalog.ts` | Catalogue aggregation + uniqueness guard |
| `lib/procurement/events/index.ts` | Public exports |
| `lib/procurement/createProcurementWiring.ts` | Composition root — exposes `canonicalEventPublisher` |
| `lib/procurement/services/procurementEventPipelineRegistry.ts` | Registry — `canonicalPublisherReady: true` |
| `tests/lib/procurement/ProcurementCanonicalPublisher.test.ts` | Envelope · idempotency · IIL · org isolation |

---

## Verification

```bash
npm run typecheck
npm test -- tests/lib/procurement/ProcurementCanonicalPublisher.test.ts tests/lib/procurement
```

---

## Remaining Work

| Item | Mission |
|------|---------|
| Business service workflow emission | P-010.7+ |
| Finance inbound consumer | Future integration mission |
| Inventory inbound consumer | Future integration mission |
| REST route migration | P-010.8+ |

---

*Procurement Canonical Events · P-010.6 · Publish-only infrastructure*
