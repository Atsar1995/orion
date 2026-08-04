# CRM RBAC Authorization

**Document ID:** CRM-SEC-001  
**Program:** P-008 — ORION Enterprise CRM  
**Mission:** P-008.12 — CRM RBAC & Authorization Framework  
**Version:** 1.0  
**Status:** Implemented — Security Layer  
**Classification:** Platform Architecture · CRM Security  
**Date:** 4 August 2026

**Baseline:** [CRM-Reference-Domain-Architecture.md](../CRM-Reference-Domain-Architecture.md) · [ADR-008](../../11_Governance/ADR/ADR-008-Identity-Strategy.md) · [ADR-009](../../11_Governance/ADR/ADR-009-Role-Based-Access-Control.md) · [ADR-015](../../11_Governance/ADR/ADR-015-Domain-Service-Boundaries.md) · Finance reference (`lib/finance/security/`)

---

## Purpose

Documents the authoritative CRM permission catalog and fail-closed authorization model introduced in P-008.12.

**Scope:** Security implementation only — no CRM business logic, REST endpoint wiring, workflows, or canonical events.

---

## Permission Catalog

Engineering codes use ADR-009 format `crm:resource:action`:

| Governance code | Engineering code |
|-----------------|------------------|
| `crm.admin.manage` | `crm:admin:manage` |
| `crm.account.read` | `crm:account:read` |
| `crm.account.write` | `crm:account:write` |
| `crm.contact.read` | `crm:contact:read` |
| `crm.contact.write` | `crm:contact:write` |
| `crm.organization.read` | `crm:organization:read` |
| `crm.organization.write` | `crm:organization:write` |
| `crm.lead.read` | `crm:lead:read` |
| `crm.lead.create` | `crm:lead:create` |
| `crm.lead.qualify` | `crm:lead:qualify` |
| `crm.opportunity.read` | `crm:opportunity:read` |
| `crm.opportunity.write` | `crm:opportunity:write` |
| `crm.quote.read` | `crm:quote:read` |
| `crm.quote.write` | `crm:quote:write` |
| `crm.salesorder.read` | `crm:salesorder:read` |
| `crm.salesorder.write` | `crm:salesorder:write` |
| `crm.case.read` | `crm:case:read` |
| `crm.case.write` | `crm:case:write` |
| `crm.activity.read` | `crm:activity:read` |
| `crm.activity.write` | `crm:activity:write` |
| `crm.audit.read` | `crm:audit:read` |
| `crm.configuration.manage` | `crm:configuration:manage` |
| `crm.event.replay` | `crm:event:replay` |
| `crm.intelligence.read` | `crm:intelligence:read` |

Source: `lib/crm/security/crm-permission-catalog.ts`

---

## CRM Role Mapping

CRM domain roles (permission bundles) are mapped from session `RoleSlug` via `resolveCrmRolesForPlatformRole()`:

| Session role | CRM profile | Typical permissions |
|--------------|-------------|---------------------|
| `organization_admin`, `administrator` | CRM Administrator | All CRM permissions |
| `service_account` | CRM Administrator + Sales Executive | Integration + lead create |
| `executive`, `founder` | Sales Director | Full sales pipeline + intelligence |
| `manager` | Sales Manager | Qualify leads, quotes, opportunities |
| `staff`, `analyst` | Sales Executive | Create leads and opportunities |
| `read_only`, `guest` | CRM Read Only | Read permissions only |

Dedicated CRM role bundles registered in `lib/platform/security/RoleRegistry.ts`:

- CRM Administrator
- Sales Director
- Sales Manager
- Sales Executive
- Account Manager
- Customer Success
- Support Agent
- CRM Auditor
- CRM ReadOnly

---

## Authorization Architecture

```
CRM API route (future)
  └── getCrmApiContextForRequest(request)
        ├── resolveCrmRoutePermission(method, pathname)
        ├── createAuthenticationContext(session)
        └── defaultAuthorizationMiddleware.authorize()
              └── AuthorizationService
                    ├── Organization boundary check
                    └── Domain permission (RoleRegistry + CrmRole)

CRM composition root
  └── createCrmWiring()
        └── authorization: CrmAuthorizationService
              └── authorizeServiceContext(context, permission)
```

### Fail-closed policy

| Condition | HTTP | Behaviour |
|-----------|------|-----------|
| Unauthenticated (fail-closed enabled) | **401** | No dev fallback |
| Authenticated, permission denied | **403** | Default deny |
| Unmapped mutating CRM route | **403** | `crm:unknown:write` |
| Organization mismatch | **403** | Cross-tenant block |

CRM domain permissions use explicit grants only — no module permission fallback (mirrors Finance).

---

## Authorization Helpers

| Helper | Permission |
|--------|------------|
| `canCreateLead()` | `crm:lead:create` |
| `canQualifyLead()` | `crm:lead:qualify` |
| `canCreateOpportunity()` | `crm:opportunity:write` |
| `canCreateQuote()` | `crm:quote:write` |
| `canApproveQuote()` | `crm:quote:write` |
| `canCreateSalesOrder()` | `crm:salesorder:write` |
| `canManageAccount()` | `crm:account:write` |
| `canManageContact()` | `crm:contact:write` |
| `canManageCase()` | `crm:case:write` |
| `canReplayEvents()` | `crm:event:replay` |
| `canManageConfiguration()` | `crm:configuration:manage` |

---

## Test Coverage

| Scenario | Test file |
|----------|-----------|
| Permission catalog registration | `CrmAuthorization.test.ts` |
| Route permission resolution | same |
| Role bundle grants | same |
| Read-only write deny | same |
| Cross-organization deny | same |
| 401 unauthenticated | same |
| 403 unauthorized | same |
| CRM role registry | `RoleRegistry.test.ts` |

---

*CRM RBAC Authorization · P-008.12 · Authorization only*
