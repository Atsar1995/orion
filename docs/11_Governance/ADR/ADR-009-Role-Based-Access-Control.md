# ADR-009 — Role-Based Access Control (RBAC)

**Identifier:** ADR-009  
**Mission:** P-015.3 — Production Architecture Decision Records  
**Status:** Accepted  
**Date:** 2026-08-01  
**Authors:** Chief Enterprise Architect  
**Reviewers:** Architecture Review Board · HCM Domain Lead · Security Architect  
**Version:** 1.0

**Remediates:** [TD-HCM-005](../../HCM/Engineering/HCM-Technical-Debt-Register.md) · [P-015.1 SEC-001](../../00_Governance/P-015.1-Enterprise-Production-Readiness-Assessment.md)

---

## Problem Statement

ORION enforces **UI route-level** permissions via middleware (`canAccessPathWithPayload`) and defines role-to-module mappings in `role-permissions.ts`, but **domain REST APIs do not enforce fine-grained permissions**. Any authenticated user with API access can invoke HCM operations within their organization (TD-HCM-005).

Enterprise GA requires **authorization** — not just authentication — on domain mutation and sensitive read APIs.

---

## Context

- Existing: `SystemRole` enum · `getPermissionsForRole()` · module `{ module, action: read|write }` permissions · UI route map.
- HCM: 48 REST routes · organization isolation yes · permission matrix no.
- [Handbook](../../00_Governance/ORION_Enterprise_Architecture_Handbook_v1.0.md): rules in engines; authorization at API/facade boundary.
- GA scope: **HCM domain RBAC required**; CRM/Finance enforcement deferred to post-GA with same pattern.

---

## Decision

ORION implements a **two-layer RBAC model** for Enterprise GA:

### Layer 1 — Platform RBAC (existing · extended)

- **Roles:** `SuperAdmin` · `OrganizationAdmin` · `Executive` · `Manager` · `Employee` · `Viewer` (existing `SystemRole` / `RoleSlug`).
- **Permissions:** Module-level `{ module, action }` pairs from `getPermissionsForRole()`.
- **Scope:** Executive Shell routes · workspace navigation · platform APIs.

### Layer 2 — Domain Permission Hooks (new · GA)

- **Platform Permission Service** — `lib/platform/auth/PermissionService.ts` (new) evaluates:
  1. Authenticated session present (ADR-008)
  2. Organization match (`ServiceContext.organizationId`)
  3. Platform role allows module access
  4. Domain-specific permission (HCM permission codes)
- **Domain hooks** — Each domain registers a `DomainPermissionCatalog` mapping API operations to required permissions.
- **HCM catalog (GA)** — Permission codes aligned with ES-HCM-001 operations (e.g., `hcm:employee:write`, `hcm:time:approve`, `hcm:org:admin`).
- **Evaluation point** — HCM API route handlers invoke `permissionService.assert(context, 'hcm:...')` before facade call; facade remains free of HTTP concerns.
- **Default deny** — Missing permission mapping on a mutating route = **deny** (forces explicit catalog coverage).

### Policy Model

```
ALLOW if:
  session.valid
  AND context.organizationId matches resource org
  AND platformRole permits module
  AND domainPermission granted (role → permission matrix)
ELSE: 403 Forbidden
```

### Organization Boundaries

- Permissions never grant cross-organization access except `SuperAdmin` with **audit log entry** for every cross-org operation.
- Repository layer remains second line of defense (org-scoped queries).

### Future ABAC Compatibility

- Permission codes are **strings** — future attributes (`departmentId`, `costCenter`) attach as ABAC constraints without renaming codes.
- `PermissionService` interface accepts optional `ResourceContext` for ABAC Phase 2.
- No ABAC engine in v1.0.x GA.

---

## Alternatives Considered

| Alternative | Pros | Cons | Reason Not Selected |
|-------------|------|------|---------------------|
| **Platform + domain hooks (selected)** | Reusable · HCM-first · handbook-aligned | Two-layer complexity | **Selected** |
| **Platform module RBAC only** | Simple | Too coarse for HCM mutations | Insufficient for GA |
| **Per-route hardcoded checks** | Fast | Unmaintainable · 48 routes | Rejected |
| **External policy engine (OPA/Cedar)** | Enterprise ABAC | Infra overhead for GA | Deferred to v2+ |
| **Facade-level authorization** | Central | Violates layering (HTTP concerns) | Rejected — API layer only |

---

## Consequences

### Positive

- Closes TD-HCM-005 · enables GA security criterion G5.
- Pattern reusable for Finance (P-009) and CRM elevation.
- ABAC path preserved without rework.

### Negative

- HCM permission matrix design and test effort (P-015.6).
- Role-permission maintenance as HCM API grows.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Permission matrix incomplete | Medium | High | Default deny · certification tests per route class |
| Role explosion | Medium | Medium | Start with 6 platform roles · 3 HCM role profiles for GA |
| Performance overhead | Low | Low | In-memory permission cache per request |
| CRM/Finance gap post-GA | Medium | Medium | Document limitation · Wave 2+ for other domains |

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| ADR-008 | Requires | Authentication before authorization |
| ADR-007 | Enables | Optional persistent role assignments later |
| P-015.6 | Mission | Implementation |
| ES-HCM-001 | Spec | Operation catalog |

---

## Implementation Guidance

1. Define `HCM_PERMISSION_CATALOG` in `lib/hcm/auth/` mapping route + method → permission code.
2. Implement `PermissionService.assert()` throwing `ForbiddenError` mapped to HTTP 403 envelope.
3. Add `HcmPermissionIntegration.test.ts` — deny unauthorized role · allow authorized.
4. Map platform roles to HCM permission sets:
   - **OrganizationAdmin** — full HCM within org
   - **Manager** — read all · write team scope (time approve)
   - **Employee** — self-service subset
   - **Executive** — read-heavy + approval where configured
5. SuperAdmin cross-org: audit via `ComplianceService` / platform audit.
6. Do not implement CRM/Finance domain hooks in v1.0.x GA unless time permits — document gap.

---

## Future Review Criteria

- P-009 Finance requires financial permission codes (segregation of duties).
- ABAC requirement (department-scoped data).
- Partner API access (Developer Platform).
- Permission admin UI.

**Next review:** P-009 Gate 4 or v1.1.0 planning.

---

## Related Documents

| Document | Location |
|----------|----------|
| role-permissions | [lib/identity/role-permissions.ts](../../../lib/identity/role-permissions.ts) |
| TD-HCM-005 | [HCM-Technical-Debt-Register.md](../../HCM/Engineering/HCM-Technical-Debt-Register.md) |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-01 | Chief Enterprise Architect | Accepted — P-015.3 |

---

*ORION Architecture Decision Record · ADR-009 · docs/11_Governance/ADR/*
