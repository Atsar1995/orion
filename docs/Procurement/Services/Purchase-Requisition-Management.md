# Purchase Requisition Management

**Document ID:** PROC-SVC-002  
**Program:** P-010 — ORION Enterprise Procurement  
**Mission:** P-010.8 — Purchase Requisition Management Services  
**Version:** 1.0  
**Status:** Implemented  
**Classification:** Procurement Services · Requisitioning  
**Date:** 5 August 2026

**Baseline:** [Procurement-Engineering-Specification.md](../Procurement-Engineering-Specification.md) · [Supplier-Management.md](./Supplier-Management.md) · CRM P-008.15

---

## Purpose

Mission P-010.8 implements **Purchase Requisition Management** — the second Procurement business domain. Covers requisition lifecycle, approval preparation, workflow transitions, RBAC, repository integration, and post-persistence canonical events.

**Scope:** Requisitioning only. No REST migration, Finance, Inventory, purchase orders, goods receipt, or supplier invoices.

---

## Service Architecture

```
ProcurementFacade.requisitions
  ├── purchase: PurchaseRequisitionService
  └── approval: PurchaseApprovalService
        ↓
  ProcurementPersistenceRepository (requisitioning adapter)
        ↓
  PlatformStore backing (requisitions · purchaseApprovals)
        ↓
  ProcurementCanonicalEventPublisher
```

---

## Workflow

```
draft ──submit──▶ submitted ──approve──▶ approved ──close──▶ closed
                    │                      │
                    ├──reject──▶ rejected   │
                    │                      │
         cancel ◀───┴──────────────────────┘
              (from draft or submitted)
```

Invalid transitions throw `INVALID_REQUISITION_TRANSITION`.

---

## Business Operations

### PurchaseRequisitionService

| Operation | RBAC | Canonical Event |
|-----------|------|-----------------|
| `listRequisitions()` | `procurement:requisition:read` | — |
| `getRequisition()` | `procurement:requisition:read` | — |
| `createRequisition()` | `procurement:requisition:create` | `procurement.requisition.created` |
| `updateRequisition()` | `procurement:requisition:create` | — (draft only) |
| `submitRequisition()` | `procurement:requisition:create` | — |
| `approveRequisition()` | `procurement:requisition:approve` | `procurement.requisition.approved` |
| `rejectRequisition()` | `procurement:requisition:approve` | — |
| `cancelRequisition()` | `procurement:requisition:create` | — |
| `closeRequisition()` | `procurement:requisition:approve` | — |

### PurchaseApprovalService

| Operation | Purpose |
|-----------|---------|
| `prepareApproval()` | Creates pending `purchaseApprovals` record on submit |
| `recordDecision()` | Records approved/rejected decision |
| `getApprovalForRequisition()` | Retrieves linked approval record |

---

## Business Flow

```
Create Requisition
  → RBAC · validate title · optional vendor lookup
  → upsert("requisitions")
  → publishRequisitionCreated()
  → return record

Submit
  → draft → submitted
  → prepareApproval()
  → return record

Approve
  → submitted → approved
  → recordDecision("approved")
  → publishRequisitionApproved()
  → return record
```

No canonical event is published before successful persistence.

---

## Verification

```bash
npm run typecheck
npm test -- tests/lib/procurement/PurchaseRequisitionService.test.ts tests/lib/procurement/PurchaseRequisitionWorkflow.test.ts
npm test -- tests/lib/procurement
```

---

## Remaining Work

| Item | Mission |
|------|---------|
| Purchase order services | P-010.9+ |
| REST route migration | P-010.10+ |

---

*Purchase Requisition Management · P-010.8 · Second Procurement business domain*
