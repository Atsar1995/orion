# Supplier Management Services

**Document ID:** PROC-SVC-001  
**Program:** P-010 — ORION Enterprise Procurement  
**Mission:** P-010.7 — Supplier Management Services  
**Version:** 1.0  
**Status:** Implemented  
**Classification:** Procurement Services · Supplier Management  
**Date:** 5 August 2026

**Baseline:** [Procurement-Engineering-Specification.md](../Procurement-Engineering-Specification.md) · CRM P-008.15 · [Procurement-RBAC-Authorization.md](../Security/Procurement-RBAC-Authorization.md) · [Procurement-Canonical-Event-Publishers.md](../Integration/Procurement-Canonical-Event-Publishers.md)

---

## Purpose

Mission P-010.7 implements the **first Procurement business services** — supplier (vendor) lifecycle, vendor contacts, vendor scorecards, repository integration, RBAC enforcement, and post-persistence canonical event emission.

**Scope:** Supplier Management only. No REST migration, Finance integration, requisitions, purchase orders, goods receipt, or supplier invoices.

---

## Service Architecture

```
ProcurementFacade.suppliers
  ├── vendor: SupplierService
  ├── contacts: VendorContactService
  └── scorecards: VendorScorecardService
        ↓
  ProcurementPersistenceRepository (shared suppliers adapter)
        ↓
  PlatformStore Procurement backing (vendors · vendorContacts · vendorScorecards)
        ↓
  ProcurementCanonicalEventPublisher (vendor.created · vendor.updated)
```

| Service | Path | Responsibility |
|---------|------|----------------|
| `SupplierService` | `lib/procurement/services/SupplierService.ts` | Vendor lifecycle |
| `VendorContactService` | `lib/procurement/services/VendorContactService.ts` | Supplier contacts |
| `VendorScorecardService` | `lib/procurement/services/VendorScorecardService.ts` | Performance scorecards |

---

## Business Operations

### SupplierService

| Operation | RBAC | Canonical Event |
|-----------|------|-----------------|
| `listSuppliers()` | `procurement:supplier:read` | — |
| `getSupplier()` | `procurement:supplier:read` | — |
| `createSupplier()` | `procurement:supplier:write` | `procurement.vendor.created` |
| `updateSupplier()` | `procurement:supplier:write` | `procurement.vendor.updated` |
| `qualifySupplier()` | `procurement:vendor:approve` | `procurement.vendor.updated` |
| `activateSupplier()` | `procurement:supplier:write` | `procurement.vendor.updated` |
| `deactivateSupplier()` | `procurement:supplier:write` | `procurement.vendor.updated` |

### Vendor lifecycle

```
draft → qualified → active → inactive → active (reactivation)
         ↑ qualifySupplier()
                    ↑ activateSupplier()
                              ↑ deactivateSupplier()
```

### VendorContactService

| Operation | RBAC |
|-----------|------|
| `listContacts()` | `procurement:supplier:read` |
| `createContact()` | `procurement:supplier:write` |
| `updateContact()` | `procurement:supplier:write` |

### VendorScorecardService

| Operation | RBAC |
|-----------|------|
| `listScorecards()` | `procurement:supplier:read` |
| `createScorecard()` | `procurement:supplier:write` |
| `updateScorecard()` | `procurement:supplier:write` |

---

## Business Flow

```
Create Supplier
  → RBAC check
  → Validate (name · unique vendor code)
  → repository.upsert("vendors")
  → publishVendorCreated()
  → return VendorRecord

Update / Qualify / Activate / Deactivate
  → RBAC check
  → Load vendor (org-scoped)
  → repository.upsert("vendors")
  → publishVendorUpdated()
  → return VendorRecord
```

**Rule:** No canonical event is published before successful repository persistence. Validation failures throw before any write or publish.

---

## Persistence

| Collection | Entity |
|------------|--------|
| `vendors` | Supplier master |
| `vendorContacts` | Vendor contacts |
| `vendorScorecards` | Performance scorecards |

All operations use the shared `ProcurementPersistenceRepository` via `wiring.suppliers` — no direct SQL, no singleton repositories.

---

## Verification

```bash
npm run typecheck
npm test -- tests/lib/procurement/SupplierService.test.ts tests/lib/procurement/SupplierWorkflowEventEmission.test.ts
npm test -- tests/lib/procurement
```

---

## Remaining Work

| Item | Mission |
|------|---------|
| Requisition services | P-010.8+ |
| REST route migration | P-010.8+ |
| Finance inbound consumer | Future integration |

---

*Supplier Management · P-010.7 · First Procurement business services*
