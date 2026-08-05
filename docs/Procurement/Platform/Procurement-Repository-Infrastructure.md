# Procurement Repository Infrastructure

**Document ID:** PROC-PLT-002  
**Program:** P-010 — ORION Enterprise Procurement  
**Mission:** P-010.4 — Procurement Repository Infrastructure  
**Version:** 1.0  
**Status:** Implemented — Infrastructure Layer  
**Classification:** Platform Architecture · Procurement  
**Authority:** Procurement Domain Lead · Platform Engineering Lead  
**Date:** 23 July 2026

**Baseline:** [Procurement-Platform-Foundation.md](./Procurement-Platform-Foundation.md) · CRM P-008.10 · Finance persistence factories · [ADR-015](../../11_Governance/ADR/ADR-015-Domain-Service-Boundaries.md)

---

## Purpose

Mission P-010.4 completes the **Procurement repository infrastructure** on top of the P-010.3 platform foundation. It provides organization-scoped persistence repositories, shared backing collections, PostgreSQL adapters, repository factories, and composition-root integration.

**Scope:** Infrastructure only — no purchasing workflows, RBAC, REST endpoints, or canonical events.

---

## Architecture

```
PlatformStore
  └── getProcurementBacking()
        └── createProcurementPersistenceRepositories()
              ├── InMemoryProcurementRepository
              └── PostgresProcurementRepository
                    └── createProcurementRepositories()
                          └── createProcurementWiring()
                                └── ProcurementFacade
```

| Component | Path | Role |
|-----------|------|------|
| **ProcurementPersistenceRepository** | `lib/procurement/persistence/ProcurementPersistenceRepository.ts` | Repository contract |
| **InMemoryProcurementRepository** | `lib/procurement/persistence/InMemoryProcurementRepository.ts` | In-memory adapter |
| **PostgresProcurementRepository** | `lib/procurement/persistence/PostgresProcurementRepository.ts` | PostgreSQL adapter |
| **createProcurementPersistenceRepositories** | `lib/procurement/persistence/createProcurementPersistenceRepositories.ts` | Provider selection factory |
| **createProcurementRepositories** | `lib/procurement/persistence/createProcurementRepositories.ts` | Bounded-context repository bundle |
| **procurementBackingCollections** | `lib/procurement/persistence/procurementBackingCollections.ts` | Collection registry + resolver |
| **ProcurementEntityPersister** | `lib/platform/persistence/procurement/ProcurementEntityPersister.ts` | SQL isolation boundary |

---

## Backing Collections

| Backing Key | Domain Catalog Name | PostgreSQL Collection |
|-------------|---------------------|------------------------|
| `vendors` | Suppliers | `procurement_vendor` |
| `vendorContacts` | VendorContacts | `procurement_vendor_contact` |
| `catalogs` | Catalogs | `procurement_catalog` |
| `catalogItems` | CatalogItems | `procurement_catalog_item` |
| `items` | Items | `procurement_item` |
| `requisitions` | PurchaseRequisitions | `procurement_requisition` |
| `purchaseApprovals` | PurchaseApprovals | `procurement_purchase_approval` |
| `rfqs` | RFQs | `procurement_rfq` |
| `quotations` | Quotations | `procurement_quotation` |
| `purchaseOrders` | PurchaseOrders | `procurement_purchase_order` |
| `purchaseContracts` | PurchaseContracts | `procurement_purchase_contract` |
| `goodsReceipts` | GoodsReceipts | `procurement_goods_receipt` |
| `receivingLines` | ReceivingLines | `procurement_receiving_line` |
| `supplierInvoices` | SupplierInvoices | `procurement_supplier_invoice` |
| `vendorScorecards` | VendorScorecards | `procurement_vendor_scorecard` |
| `organizationFoundations` | OrganizationFoundations | `procurement_organization_foundation` |
| `idempotencyKeys` | IdempotencyKeys | `procurement_idempotency_key` |
| `entityRegistry` | EntityRegistry | `procurement_entity_registry` |

---

## Repository Bundle

`createProcurementRepositories()` exposes bounded-context accessors that share one persistence adapter until domain services ship:

| Accessor | Bounded Context |
|----------|-----------------|
| `procurement` | Core persistence |
| `suppliers` | Supplier Management |
| `sourcing` | Sourcing |
| `requisitioning` | Requisitioning |
| `ordering` | Ordering |
| `receiving` | Receiving |

Provider selection occurs in `createProcurementPersistenceRepositories()`:

| Provider | Adapter |
|----------|---------|
| InMemory | `InMemoryProcurementRepository` |
| PostgreSQL / SQLite | `PostgresProcurementRepository` |

---

## Validation

| Gate | Command |
|------|---------|
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Repository tests | `npm test -- tests/lib/procurement/ProcurementRepositoryInfrastructure.test.ts` |
| Foundation tests | `npm test -- tests/lib/procurement/ProcurementPlatformFoundation.test.ts` |
| Platform contract | `npm test -- tests/lib/platform/store/PlatformStoreContract.test.ts` |

---

## Remaining Procurement Work

| Item | Status |
|------|--------|
| Repository infrastructure (this mission) | ✅ Implemented |
| Supplier management services | ⏳ P-010.5 |
| Requisitioning workflows | ⏳ P-010.6 |
| RBAC + REST | ⏳ P-010.8 |
| Canonical events | ⏳ P-010.9 |

---

*Procurement Repository Infrastructure · P-010.4 · Infrastructure only*
