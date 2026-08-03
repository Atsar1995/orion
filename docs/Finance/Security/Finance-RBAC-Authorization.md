# Finance RBAC Authorization

**Document ID:** FIN-SEC-001  
**Program:** P-009 — ORION Enterprise Finance  
**Mission:** P-009.14 — Finance RBAC Permission Catalog & Fail-Closed Authorization  
**Version:** 1.0  
**Status:** Implemented — Security Layer  
**Classification:** Platform Architecture · Finance Security  
**Date:** 3 August 2026

**Baseline:** [ES-FIN-002 §6](../Engineering/ES-FIN-002-Finance-Engineering-Specification.md) · [P-009.3 Governance Rules §3](../Governance/P-009.3-Finance-Governance-Rules.md) · [ADR-009](../../11_Governance/ADR/ADR-009-Role-Based-Access-Control.md) · [P-009.11 Closure Program](../Certification/Finance-Gate5-Closure-Program.md)

**Closes:** FIN-R-004

---

## Purpose

Documents the authoritative Finance permission catalog and fail-closed authorization model introduced in P-009.14.

**Scope:** Security implementation only — no accounting behaviour, persistence, or workflow changes.

---

## Permission Catalog

Engineering codes use ADR-009 format `finance:resource:action`:

| Governance code | Engineering code |
|-----------------|------------------|
| `finance.admin` | `finance:admin:manage` |
| `finance.journal.create` | `finance:journal:create` |
| `finance.journal.post` | `finance:journal:post` |
| `finance.journal.reverse` | `finance:journal:reverse` |
| `finance.journal.read` | `finance:journal:read` |
| `finance.coa.read` | `finance:coa:read` |
| `finance.coa.write` | `finance:coa:write` |
| `finance.period.read` | `finance:period:read` |
| `finance.period.close` | `finance:period:close` |
| `finance.period.reopen` | `finance:period:reopen` |
| `finance.payment.read` | `finance:payment:read` |
| `finance.payment.write` | `finance:payment:write` |
| `finance.audit.read` | `finance:audit:read` |
| `finance.event.replay` | `finance:event:replay` |
| `finance.intelligence.read` | `finance:intelligence:read` |
| `finance.configuration.manage` | `finance:configuration:manage` |

Source: `lib/finance/security/finance-permission-catalog.ts`

---

## Role Mapping

Finance domain roles (permission bundles) are mapped from session `RoleSlug` via `resolveFinanceRolesForPlatformRole()`:

| Session role | Finance profile | Typical permissions |
|--------------|-----------------|---------------------|
| `organization_admin`, `administrator` | Finance Administrator | All Finance permissions |
| `service_account` | Finance Administrator + Accountant | Journal post, integration |
| `manager` | Controller | Post, close period, audit read |
| `staff`, `analyst` | Accountant | Create/post journals, read CoA |
| `executive`, `founder` | Executive | Intelligence + read-only inquiry |
| `read_only`, `guest` | Read Only | Read permissions only |

Role assignments registered in `lib/platform/security/RoleRegistry.ts`.

---

## Authorization Architecture

```
Finance API route
  └── getFinanceApiContextForRequest(request)
        ├── resolveFinanceRoutePermission(method, pathname)
        ├── createAuthenticationContext(session)
        └── defaultAuthorizationMiddleware.authorize()
              └── AuthorizationService
                    ├── Organization boundary check
                    ├── Module permission (finance read/write)
                    └── Domain permission (RoleRegistry + FinanceRole)

Finance service / validation
  └── FinanceAuthorizationService
        └── authorizeServiceContext(context, permission)
```

### Fail-closed policy

| Condition | HTTP | Behaviour |
|-----------|------|-----------|
| Unauthenticated (fail-closed enabled) | **401** | No dev fallback |
| Authenticated, permission denied | **403** | Default deny |
| Unmapped mutating Finance route | **403** | `finance:unknown:write` |
| Organization mismatch | **403** | Cross-tenant block |

Posting validation stage 7 (`authorization`) uses `finance:journal:post` instead of role allow-lists.

Period reopen uses `finance:period:reopen` instead of hard-coded executive/admin roles.

---

## Security Boundaries

| Layer | Control |
|-------|---------|
| API routes (31) | `getFinanceApiContextForRequest` on every handler |
| Posting validation | `FinanceAuthorizationService.canPostJournal()` |
| Period rules | `FinanceAuthorizationService.canReopenPeriod()` |
| Repository | Organization isolation (unchanged — P-009.13) |
| IIL integration | `service_account` retains post permission via role mapping |

---

## Test Coverage

| Scenario | Test file |
|----------|-----------|
| Route permission resolution | `FinanceAuthorization.test.ts` |
| Admin / accountant post grant | same |
| Read-only post deny | same |
| Unauthenticated deny | same |
| Cross-organization deny | same |
| Executive intelligence read | same |
| Controller close / replay deny | same |
| Service account integration post | same |

---

## Related Risks

| Risk | Status after P-009.14 |
|------|------------------------|
| FIN-R-004 API RBAC gap | **Closed** |

---

*Finance RBAC Authorization · P-009.14 · Security only*
