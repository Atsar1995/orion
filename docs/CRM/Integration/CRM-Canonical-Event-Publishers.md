# CRM Canonical Event Publishers

**Document ID:** CRM-INT-001  
**Program:** P-008 — ORION Enterprise CRM  
**Mission:** P-008.14 — CRM Canonical Event Publisher & ADR-014 Integration  
**Version:** 1.0  
**Status:** Implemented  
**Classification:** CRM Integration · Cross-Domain Events  
**Date:** 4 August 2026

**Baseline:** [CRM-Reference-Domain-Architecture.md](../CRM-Reference-Domain-Architecture.md) · [ADR-013](../../11_Governance/ADR/ADR-013-Durable-Intelligent-Integration-Layer.md) · [ADR-014](../../11_Governance/ADR/ADR-014-Cross-Domain-Event-Contracts.md) · [ADR-015](../../11_Governance/ADR/ADR-015-Domain-Service-Boundaries.md) · HCM reference (`lib/hcm/events/HcmCanonicalFinancePublisher.ts`)

---

## Purpose

Documents native ADR-014 canonical event publication from CRM for Finance, Intelligence, Analytics, and future domain consumers. This mission establishes CRM as a **publish-only** enterprise event producer via the Durable Intelligent Integration Layer.

**Scope:** Cross-domain integration infrastructure only. No workflow redesign, Finance posting, AI, reporting, REST changes, or repository changes.

---

## Publisher Lifecycle

```
Domain service (future trigger)
  └── CrmCanonicalEventPublisher.publish*()
        └── getIntelligenceIntegrationService().publish()
              └── createIntelligenceEvent + enrichDurableEnvelope (ADR-013)
                    └── Durable IIL transport (crm-workspace)
                          └── Consumers: Finance · Intelligence · Analytics
```

| Stage | Component | Responsibility |
|-------|-----------|----------------|
| **Trigger** | CRM domain services *(future)* | Domain state transition |
| **Publish** | `CrmCanonicalEventPublisher` | Build ADR-014 envelope + deterministic idempotency key |
| **Transport** | IIL (`crm-workspace`) | Persist-before-ack durable delivery |
| **Consume** | Finance · Intelligence · Analytics | Separate missions — not in P-008.14 scope |

---

## Canonical Contracts (Version 1)

| Canonical Type | Entity | Publisher Method | Primary Consumer |
|----------------|--------|------------------|------------------|
| `crm.lead.created` | `lead` | `publishLeadCreated()` | Intelligence |
| `crm.lead.qualified` | `lead` | `publishLeadQualified()` | Intelligence · Workflow |
| `crm.opportunity.created` | `opportunity` | `publishOpportunityCreated()` | Intelligence |
| `crm.opportunity.closed` | `opportunity` | `publishOpportunityClosed()` | **Finance** · Intelligence |
| `crm.quote.created` | `quote` | `publishQuoteCreated()` | Intelligence |
| `crm.customer.created` | `customer` | `publishCustomerCreated()` | Intelligence · Search |
| `crm.customer.updated` | `customer` | `publishCustomerUpdated()` | Intelligence |
| `crm.salesorder.confirmed` | `salesorder` | `publishSalesOrderConfirmed()` | Finance · Inventory |
| `crm.revenue.recognized` | `revenue` | `publishRevenueRecognized()` | **Finance** |
| `crm.case.closed` | `case` | `publishCaseClosed()` | Intelligence |

### ADR-014 Envelope (required fields)

Every canonical publication includes:

- `eventId` — IIL-generated UUID
- `correlationId` — caller-supplied trace ID
- `causationId` — optional parent event reference
- `organizationId` — from `ServiceContext`
- `eventVersion` — `"1"` in payload (`CRM_CANONICAL_EVENT_VERSION`)
- `eventTimestamp` — ISO-8601 publish timestamp in payload
- `payload.canonicalEventType` — namespaced contract ID
- `payload.sourceDomain` — `"crm"`
- `payload.idempotencyKey` — deterministic dedupe key
- `auditMetadata.sourceDomain` — `"crm"`

### Idempotency key patterns

| Event | Pattern |
|-------|---------|
| Lead created | `{org}:crm-workspace:crm-lead-{leadId}-created-v1` |
| Lead qualified | `{org}:crm-workspace:crm-lead-{leadId}-qualified-v1` |
| Opportunity closed | `{org}:crm-workspace:crm-opportunity-{id}-closed-v1` |
| Revenue recognized | `{org}:crm-workspace:crm-revenue-{salesOrderId}-recognized-v1` |
| Customer updated | `{org}:crm-workspace:crm-customer-{id}-updated-v{version}` |

---

## Integration Policy

| Rule | Status |
|------|--------|
| **Publish only** | CRM emits canonical events — no consumers in this mission |
| **No Finance mutations** | Revenue flows to Finance via future consumer missions |
| **No workflow changes** | Service triggers deferred to workflow integration missions |
| **Durable IIL** | All publication via `getIntelligenceIntegrationService()` |

---

## Implementation Map

| File | Role |
|------|------|
| `lib/crm/events/CrmCanonicalEventPublisher.ts` | Canonical publish class + idempotency builder |
| `lib/crm/events/crmOutboundEvents.ts` | Version 1 contract constants |
| `lib/crm/events/crm-event-catalog.ts` | Catalogue aggregation + uniqueness guard |
| `lib/crm/events/index.ts` | Public exports |
| `lib/crm/createCrmWiring.ts` | Composition root — exposes `canonicalEventPublisher` |
| `lib/crm/services/crmEventPipelineRegistry.ts` | Registry — `canonicalPublisherReady: true` |
| `tests/lib/crm/CrmCanonicalPublisher.test.ts` | Envelope · idempotency · IIL · org isolation |

---

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npm test -- tests/lib/crm/CrmCanonicalPublisher.test.ts tests/lib/crm tests/platform/iil
```

---

## Remaining Work

| Item | Mission |
|------|---------|
| Wire publisher into domain service triggers | P-008.15+ |
| Finance CRM canonical consumer | Future Finance mission |
| JSON Schema registry | Gate 6 (`docs/11_Governance/EventContracts/`) |
| Legacy `CustomEvent` migration | Phase III |

---

*CRM Canonical Event Publishers · P-008.14 · Publish-only · ADR-014 compliant*
