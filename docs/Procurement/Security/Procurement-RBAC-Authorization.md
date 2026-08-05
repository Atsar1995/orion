# Procurement RBAC & Authorization

**Document ID:** PROC-SEC-001  
**Program:** P-010 — ORION Enterprise Procurement  
**Mission:** P-010.5 — Procurement RBAC & Authorization Framework  
**Version:** 1.0  
**Status:** Implemented — Security Foundation  
**Classification:** Platform Security · Procurement  
**Authority:** Procurement Domain Lead · Platform Security Lead  
**Date:** 5 August 2026

**Baseline:** [Procurement-Engineering-Specification.md](../Procurement-Engineering-Specification.md) · CRM P-008.12 · Finance P-009.14 · [ADR-009](../../11_Governance/ADR/ADR-009-RBAC-Permission-Model.md)

---

## Purpose

Mission P-010.5 implements the **Procurement RBAC and authorization framework** — permission catalog, role registry integration, domain authorization service, API context helpers, and fail-closed enforcement.

**Scope:** Security foundation only — no REST route migration, no business services, no workflows, no canonical events.

---

## Architecture

```
HTTP Request (future /api/procurement/*)
  → getProcurementApiContextForRequest()
  → resolveProcurementRoutePermission(method, pathname)
  → AuthorizationMiddleware.authorize()
  → ProcurementAuthorizationService
  → Platform AuthorizationService
  → RoleRegistry + PermissionEvaluator
```

| Component | Path |
|-----------|------|
| Permission catalog | `lib/procurement/security/procurement-permission-catalog.ts` |
| Authorization service | `lib/procurement/security/ProcurementAuthorizationService.ts` |
| API guards | `lib/procurement/security/ProcurementPermissionGuards.ts` |
| Bootstrap | `lib/procurement/security/index.ts` |
| Composition root | `createProcurementWiring()` → `authorization` |

---

## Permission Catalog (Version 1)

All permissions use `procurement:resource:action` format (ADR-009).

| Permission | Code |
|------------|------|
| Admin | `procurement:admin:manage` |
| Supplier read/write | `procurement:supplier:read` · `procurement:supplier:write` |
| Vendor approve | `procurement:vendor:approve` |
| Requisition | `procurement:requisition:read` · `.create` · `.approve` |
| RFQ | `procurement:rfq:read` · `.write` |
| Quotation | `procurement:quotation:read` · `.write` |
| Purchase order | `procurement:purchaseorder:read` · `.create` · `.approve` |
| Goods receipt | `procurement:goodsreceipt:read` · `.write` |
| Invoice | `procurement:invoice:read` · `.approve` |
| Contract | `procurement:contract:read` · `.write` |
| Audit | `procurement:audit:read` |
| Configuration | `procurement:configuration:manage` |
| Event replay | `procurement:event:replay` |
| Intelligence | `procurement:intelligence:read` |

Unknown mutating `/api/procurement/*` routes resolve to `procurement:unknown:write` (fail-closed).

---

## Role Model

| Role | Profile |
|------|---------|
| **Procurement Administrator** | Full catalog |
| **Procurement Director** | Approve requisitions · POs · invoices · contracts |
| **Procurement Manager** | Requisition + PO lifecycle |
| **Buyer** | Create requisitions · RFQ · quotations |
| **Purchasing Officer** | PO create + approve |
| **Receiving Officer** | Goods receipt write |
| **Supplier Manager** | Supplier master + vendor approve |
| **Procurement Auditor** | Read-only + audit |
| **Procurement ReadOnly** | Read-only across aggregates |

Roles map through `RoleRegistry` and `resolveProcurementRolesForPlatformRole()`.

Organization administrators receive all Procurement permissions. Super admin receives full catalog via `RoleRegistry.resolveEffectivePermissions()`.

---

## Fail-Closed Rules

| Condition | HTTP | Result |
|-----------|------|--------|
| Unauthenticated (fail-closed mode) | 401 | `UNAUTHORIZED` |
| Missing explicit grant | 403 | `FORBIDDEN` |
| Unknown mutating route | 403 | `procurement:unknown:write` denied |
| Cross-organization access | 403 | Organization boundary denial |

Procurement permissions do **not** fall back to legacy module permissions — explicit domain grants only (`PermissionEvaluator`).

---

## Validation

| Gate | Command |
|------|---------|
| Authorization tests | `npm test -- tests/lib/procurement/ProcurementAuthorization.test.ts` |
| Role registry | `npm test -- tests/lib/platform/security/RoleRegistry.test.ts` |
| Foundation wiring | `npm test -- tests/lib/procurement/ProcurementPlatformFoundation.test.ts` |

---

## Remaining Work

| Item | Mission |
|------|---------|
| REST route migration | P-010.8+ |
| Canonical event publisher | P-010.6 |
| Business service authorization hooks | P-010.7+ |

---

*Procurement RBAC · P-010.5 · Security foundation only*
