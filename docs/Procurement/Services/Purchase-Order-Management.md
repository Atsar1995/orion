# Purchase Order Management

**Document ID:** PROC-SVC-003  
**Program:** P-010 — ORION Enterprise Procurement  
**Mission:** P-010.9 — Purchase Order Management Services  
**Version:** 1.0  
**Status:** Implemented  
**Classification:** Procurement Services · Purchase Ordering  
**Date:** 5 August 2026

**Baseline:** [Procurement-Engineering-Specification.md](../Procurement-Engineering-Specification.md) · [Purchase-Requisition-Management.md](./Purchase-Requisition-Management.md) · CRM P-008.15

---

## Purpose

Mission P-010.9 extends Procurement from approved requisitions into formal purchasing. Implements purchase order lifecycle, contract linkage, approval workflow, RBAC, repository integration, and post-persistence canonical events.

**Scope:** Purchase ordering and contracts only. No REST migration, goods receipt, inventory, finance consumers, or supplier invoices.

---

## Service Architecture

```
ProcurementFacade.orders
  ├── purchase: PurchaseOrderService
  └── contracts: PurchaseContractService
        ↓
  ProcurementPersistenceRepository (ordering adapter)
        ↓
  PlatformStore backing (purchaseOrders · purchaseContracts)
        ↓
  ProcurementCanonicalEventPublisher
```

---

## Workflow

```
draft ──submit──▶ submitted ──approve──▶ approved ──close──▶ closed
                    │
                    └──cancel──▶ cancelled (from draft or submitted)
```

Amendments allowed on `draft`, `submitted`, and `approved` — not after closure or cancellation.

---

## Business Operations

### PurchaseOrderService

| Operation | RBAC | Canonical Event |
|-----------|------|-----------------|
| `listPurchaseOrders()` | `procurement:purchaseorder:read` | — |
| `getPurchaseOrder()` | `procurement:purchaseorder:read` | — |
| `createPurchaseOrder()` | `procurement:purchaseorder:create` | `procurement.purchaseorder.created` |
| `updatePurchaseOrder()` | `procurement:purchaseorder:create` | — (draft only) |
| `submitPurchaseOrder()` | `procurement:purchaseorder:create` | — |
| `approvePurchaseOrder()` | `procurement:purchaseorder:approve` | `procurement.purchaseorder.approved` |
| `amendPurchaseOrder()` | `procurement:purchaseorder:create` | — |
| `cancelPurchaseOrder()` | `procurement:purchaseorder:create` | — |
| `closePurchaseOrder()` | `procurement:purchaseorder:approve` | — |

### PurchaseContractService

| Operation | RBAC |
|-----------|------|
| `getContract()` | `procurement:contract:read` |
| `createContract()` | `procurement:contract:write` |
| `updateContract()` | `procurement:contract:write` |

---

## Linkage Rules

| Link | Validation |
|------|------------|
| Requisition | Must be `approved` or `closed` when `requisitionId` supplied |
| Contract | Must exist; vendor must match purchase order vendor |
| Vendor | Required; must exist in organization scope |

---

## Verification

```bash
npm run typecheck
npm test -- tests/lib/procurement/PurchaseOrderService.test.ts tests/lib/procurement/PurchaseOrderWorkflow.test.ts
npm test -- tests/lib/procurement
```

---

## Remaining Work

| Item | Mission |
|------|---------|
| Goods receipt services | P-010.10+ |
| REST route migration | P-010.10+ |

---

*Purchase Order Management · P-010.9 · Third Procurement business domain*
