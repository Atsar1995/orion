# Procurement REST API Convergence

**Document ID:** PROC-API-001  
**Program:** P-010 — ORION Enterprise Procurement  
**Mission:** P-010.12 — Procurement REST API Convergence  
**Version:** 1.0  
**Status:** Implemented  
**Classification:** Procurement API · REST Convergence  
**Date:** 5 August 2026

**Baseline:** [Procurement-Engineering-Specification.md](../Procurement-Engineering-Specification.md) · [Procurement-RBAC-Authorization.md](../Security/Procurement-RBAC-Authorization.md) · CRM P-008.13

---

## Purpose

Mission P-010.12 exposes Procurement business services through enterprise REST APIs under `/api/procurement/*`. All routes use fail-closed authorization, the Procurement composition root, and PlatformStore-backed repositories.

**Scope:** REST convergence only. No new business logic, endpoint redesign, Finance/Inventory/Warehouse integration, or supplier invoice posting.

---

## REST Architecture

```
HTTP Request (/api/procurement/*)
        ↓
getProcurementApiContextForRequest()
        ↓
resolveProcurementRoutePermission()  [fail-closed]
        ↓
ProcurementFacade / pre-bound service exports
        ↓
Business Service (RBAC + validation)
        ↓
ProcurementPersistenceRepository
        ↓
PlatformStore (ProcurementStoreBacking)
        ↓
JSON Response { success, data | error }
```

---

## Authorization Flow

| Outcome | Condition |
|---------|-----------|
| **401 UNAUTHORIZED** | No session when `ORION_AUTH_FAIL_CLOSED=true` |
| **403 FORBIDDEN** | Authenticated user lacks required permission |
| **403 FORBIDDEN** | Unknown mutating route → `procurement:unknown:write` |
| **200/201** | Authorized request; service executes |

Route permissions are resolved automatically from `procurement-permission-catalog.ts` when handlers call `getProcurementApiContextForRequest(request)`.

---

## API Coverage

| Domain | Base Path | Service |
|--------|-----------|---------|
| Suppliers | `/api/procurement/vendors` | `procurementSupplierService` |
| Vendor Contacts | `/api/procurement/vendors/[id]/contacts` | `procurementVendorContactService` |
| Vendor Scorecards | `/api/procurement/vendors/[id]/scorecards` | `procurementVendorScorecardService` |
| Requisitions | `/api/procurement/requisitions` | `procurementRequisitionService` |
| Approvals | `/api/procurement/requisitions/[id]/approval` | `procurementApprovalService` |
| Purchase Orders | `/api/procurement/purchase-orders` | `procurementPurchaseOrderService` |
| Contracts | `/api/procurement/contracts` | `procurementPurchaseContractService` |
| Goods Receipts | `/api/procurement/goods-receipts` | `procurementGoodsReceiptService` |
| Receiving Lines | `/api/procurement/goods-receipts/[id]/lines` | `procurementReceivingLineService` |
| Supplier Invoices | `/api/procurement/invoices` | Stub (501 — P-010.13) |
| Executive | `/api/procurement/executive/dashboard` | `procurementFacade.getWorkspaceView()` |

**Route count:** 38 route handlers across 38 files.

---

## Response Envelope

All routes return:

```json
{ "success": true, "data": { ... } }
```

or

```json
{ "success": false, "error": "ERROR_CODE" }
```

Shared helpers live in `lib/procurement/api/procurementApiResponse.ts`.

---

## Validation Summary

| Area | Status |
|------|--------|
| Fail-closed RBAC | All routes use `getProcurementApiContextForRequest` |
| Facade / service wiring | Pre-bound exports from `@/lib/procurement` |
| Repository path | Services → `ProcurementPersistenceRepository` → PlatformStore |
| Organization isolation | Enforced at repository layer |
| API authorization tests | `ProcurementApiAuthorization.test.ts` |
| No singleton repositories in routes | Routes never import persistence directly |

---

## Next Mission

**P-010.13** — Supplier Invoice Management Services and invoice route activation.
