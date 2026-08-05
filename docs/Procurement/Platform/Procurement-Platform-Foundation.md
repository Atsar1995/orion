# Procurement Platform Foundation

**Document ID:** PROC-PLT-001  
**Program:** P-010 — ORION Enterprise Procurement  
**Mission:** P-010.3 — Procurement Platform Foundation  
**Version:** 1.0  
**Status:** Implemented — Infrastructure Layer  
**Classification:** Platform Architecture · Procurement  
**Authority:** Procurement Domain Lead · Platform Engineering Lead  
**Date:** 23 July 2026

**Baseline:** [Procurement-Reference-Domain-Strategy.md](../Procurement-Reference-Domain-Strategy.md) · [ADR-007](../../11_Governance/ADR/ADR-007-Production-Persistence-Strategy.md) · [ADR-015](../../11_Governance/ADR/ADR-015-Domain-Service-Boundaries.md) · CRM reference (`lib/crm/createCrmWiring.ts`) · Finance reference (`lib/finance/createFinanceWiring.ts`)

---

## Purpose

This document describes the **Procurement platform foundation** introduced in Mission P-010.3. It covers persistence backing, repository wiring, PlatformStore integration, health monitoring, and the Procurement composition root.

**Scope:** Infrastructure only — no vendor management, requisition processing, workflow implementation, REST endpoints, RBAC, or canonical event processing.

---

## Architecture Summary

```
PlatformStore
  └── getProcurementBacking() → ProcurementStoreBacking
        └── createProcurementRepositories()
              └── InMemoryProcurementRepository | PostgresProcurementRepository
                    └── createProcurementWiring()
                          └── ProcurementFacade (public API)
```

| Component | Path | Role |
|-----------|------|------|
| **ProcurementStoreBacking** | `lib/procurement/persistence/ProcurementStoreBacking.ts` | Shared collection contract |
| **createProcurementStore** | `lib/procurement/persistence/createProcurementStore.ts` | Empty store factory + org foundation seed |
| **createProcurementRepositories** | `lib/procurement/persistence/createProcurementRepositories.ts` | Repository bundle |
| **ProcurementPlatformBacking** | `lib/procurement/persistence/ProcurementPlatformBacking.ts` | PlatformStore resolver |
| **createProcurementWiring** | `lib/procurement/createProcurementWiring.ts` | Composition root |
| **ProcurementFacade** | `lib/procurement/ProcurementFacade.ts` | Public entry (`procurementFacade`) |
| **procurementEventPipelineRegistry** | `lib/procurement/services/procurementEventPipelineRegistry.ts` | Event pipeline placeholder |
| **ProcurementEntityPersister** | `lib/platform/persistence/procurement/ProcurementEntityPersister.ts` | PostgreSQL `procurement_entities` adapter |

---

## PlatformStore Integration

| Provider | Procurement Backing |
|----------|---------------------|
| **InMemoryPlatformStore** | `createProcurementStore()` per store instance |
| **PostgresPlatformStore** | `createPostgresProcurementStore()` at initialize |

`PlatformStore.getProcurementBacking()` is mandatory on all providers per ADR-007 extension.

---

## Foundation Collections

| Collection | PostgreSQL Table Prefix | Purpose |
|------------|-------------------------|---------|
| `organizationFoundations` | `procurement_organization_foundation` | Org registration markers |
| `vendors` | `procurement_vendor` | Supplier aggregate placeholder |
| `vendorContacts` | `procurement_vendor_contact` | Supplier contact placeholder |
| `catalogs` | `procurement_catalog` | Catalog placeholder |
| `catalogItems` | `procurement_catalog_item` | Catalog item placeholder |
| `items` | `procurement_item` | Item reference placeholder |
| `requisitions` | `procurement_requisition` | Requisition placeholder |
| `purchaseApprovals` | `procurement_purchase_approval` | Approval placeholder |
| `rfqs` | `procurement_rfq` | RFQ placeholder |
| `quotations` | `procurement_quotation` | Quotation placeholder |
| `purchaseOrders` | `procurement_purchase_order` | PO placeholder |
| `purchaseContracts` | `procurement_purchase_contract` | Contract placeholder |
| `goodsReceipts` | `procurement_goods_receipt` | Receipt placeholder |
| `receivingLines` | `procurement_receiving_line` | Receiving line placeholder |
| `supplierInvoices` | `procurement_supplier_invoice` | Invoice placeholder |
| `vendorScorecards` | `procurement_vendor_scorecard` | Scorecard placeholder |
| `idempotencyKeys` | `procurement_idempotency_key` | Idempotency registry |
| `entityRegistry` | `procurement_entity_registry` | Entity registry |

Organization foundation markers use seed org `org-orania` and foundation version `P-010.3`.

---

## Health Integration

`HealthStatusService` reports `procurement_platform` when Procurement backing is available via PlatformStore.

---

## Remaining Procurement Work

| Item | Status |
|------|--------|
| Platform foundation (this mission) | ✅ Implemented |
| Full business persistence + domain services | ⏳ P-010.4 |
| Supplier management | ⏳ P-010.5 |
| Requisitioning workflows | ⏳ P-010.6 |
| RBAC permission catalog + REST | ⏳ P-010.8 |
| Canonical events + ADR-014 registry | ⏳ P-010.9 |
| Certification · Gate 5 | ⏳ P-010.11+ |

---

## Validation

| Gate | Command |
|------|---------|
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Tests | `npm test -- tests/lib/procurement/ProcurementPlatformFoundation.test.ts` |
| Build | `npm run build` |

---

*Procurement Platform Foundation · P-010.3 · Infrastructure only*
