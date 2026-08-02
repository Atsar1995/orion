# ADR-008 — Enterprise Identity & Authentication Strategy

**Identifier:** ADR-008  
**Mission:** P-015.3 — Production Architecture Decision Records  
**Status:** Accepted  
**Date:** 2026-08-01  
**Authors:** Chief Enterprise Architect  
**Reviewers:** Architecture Review Board · Security Architect · Platform Engineering Lead  
**Version:** 1.0

**Related:** [ADR-009 RBAC](./ADR-009-Role-Based-Access-Control.md) · [ADR-007 Persistence](./ADR-007-Production-Persistence-Strategy.md)

---

## Problem Statement

ORION must authenticate users and establish **trustworthy tenant context** for every API and facade operation before GA. Current gaps include: demo/default `ServiceContext` fallback when session is absent on domain APIs, SSO not implemented (TD-004), and identity persistence still in-memory for some platform entities.

Production GA requires a **documented, enforceable authentication strategy** that preserves organization isolation and prepares for enterprise IdP integration without blocking v1.0.x timeline.

---

## Context

- Existing implementation: JWT session cookie (`SESSION_COOKIE_NAME`) · `middleware.ts` route protection · `getServerSession()` · `getDecisionServiceContext()` for API context.
- [P-015.1](../../00_Governance/P-015.1-Enterprise-Production-Readiness-Assessment.md): SEC-002 — API fail-open with `DEFAULT_CONTEXT` is a **Critical** production risk.
- [Handbook](../../00_Governance/ORION_Enterprise_Architecture_Handbook_v1.0.md): every operation scoped by `ServiceContext.organizationId`.
- GA scope (P-015.1 §10.3): session auth sufficient for v1.0.x; SSO explicitly out of GA scope but must be architected.

---

## Decision

ORION adopts a **layered identity strategy** for Enterprise GA:

### Authentication (v1.0.x GA)

1. **Primary mechanism** — Signed **HTTP-only session cookie** (JWT or signed payload) issued by ORION identity service after credential validation.
2. **Production secrets** — `ORION_SESSION_SECRET` required in production; weak defaults rejected by `validateEnvironment()` (existing).
3. **Fail-closed domain APIs** — All `/api/hcm/*` and future domain REST routes **must return 401** when session is absent or invalid. **No default `ServiceContext`** in production code paths.
4. **Middleware** — Continue Executive Shell session enforcement via `middleware.ts`; health/auth API paths exempt per existing pattern.
5. **Demo mode** — Explicit `NODE_ENV=development` only; demo users (`demo-users.ts`) disabled in production builds.

### Organization Isolation

1. **ServiceContext** — Every authenticated request resolves `{ organizationId, workspaceId, userId, role }` from session — never from client-supplied body alone.
2. **Cross-org access** — Prohibited unless SuperAdmin role with explicit audit (see ADR-009).
3. **Persistence** — Organization scope enforced at repository adapter layer (ADR-007).

### Future SSO / OIDC / OAuth2 (Post-GA — Architected Now)

1. **Identity provider abstraction** — Introduce `IdentityProvider` interface: `LocalCredentialsProvider` (GA) · `OidcProvider` (future).
2. **OIDC/OAuth2** — Enterprise GA **does not require** SSO; v1.1+ implements OIDC authorization code flow with same session cookie output.
3. **MFA readiness** — Session payload reserves `mfaVerified: boolean`; MFA enforcement deferred but schema-compatible.
4. **TD-004** — SSO providers tracked as P2 debt; not GA blocker with documented limitation.

### Session Strategy

| Aspect | Decision |
|--------|----------|
| Storage | Server-validated signed cookie · no localStorage tokens for session |
| Rotation | Secret rotation procedure in ADR-010 |
| Expiry | Configurable TTL · refresh on activity (implementation P-015.6) |
| Revocation | Session version/id in payload for future denylist |

---

## Alternatives Considered

| Alternative | Pros | Cons | Reason Not Selected |
|-------------|------|------|---------------------|
| **Session cookie (selected)** | Fits Next.js · existing code · HTTP-only | Stateful session ops at scale | **GA path** — extend existing |
| **Bearer JWT only (API)** | Stateless API clients | Dual auth models · Brief/SSR complexity | Deferred — add alongside session for API clients in v1.1 |
| **SSO-only for GA** | Enterprise sales | Blocks GA timeline · TD-004 | Rejected for v1.0.x scope |
| **API keys for domain APIs** | Simple automation | Weak for interactive exec UX | Developer Platform future (ES-060) |
| **Default context fallback** | Dev convenience | **Production security failure** | **Removed** per SEC-002 |

---

## Consequences

### Positive

- Clear GA auth boundary; aligns with zero-trust direction.
- OIDC path defined without rework of ServiceContext model.
- Organization isolation preserved — foundation for RBAC (ADR-009).

### Negative

- External API consumers need session or future bearer token support.
- SSO customers wait until post-GA OIDC implementation.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missed API routes without auth | Medium | High | Audit all `/api/hcm/*` · integration tests · P-015.7 |
| Session fixation | Low | Medium | Secure cookie flags · rotation on login |
| Secret leakage | Low | High | ADR-010 secrets pattern |
| SSO demand before OIDC ships | Medium | Commercial | Document GA limitation · design partner contract |

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| ADR-009 | Enables | Authorization after authentication |
| ADR-007 | Enables | Persistent user/org optional for GA |
| ADR-010 | Requires | Session secret management |
| P-015.7 | Mission | Fail-closed implementation |

---

## Implementation Guidance

1. Replace `DEFAULT_CONTEXT` fallback in `getDecisionServiceContext()` for domain API paths with 401 response helper.
2. Centralize API auth in domain context resolvers (`getHcmApiContext()` pattern for all domains).
3. Add `IdentityProvider` interface in `lib/identity/` — `LocalCredentialsProvider` implements GA.
4. Session payload must include `organizationId` — validate on every token verify.
5. Document GA auth limitation in release notes: local credentials only.

---

## Future Review Criteria

- First enterprise SSO customer contracted.
- MFA regulatory requirement in target market.
- Public API / partner automation scale (bearer tokens).
- Multi-workspace users across organizations.

**Next review:** Post-GA (v1.1 planning) or SSO epic approval.

---

## Related Documents

| Document | Location |
|----------|----------|
| ES-059 (Zero Trust) | Referenced in G-001 — alignment ongoing |
| env validation | [lib/config/env.ts](../../../lib/config/env.ts) |
| middleware | [middleware.ts](../../../middleware.ts) |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-01 | Chief Enterprise Architect | Accepted — P-015.3 |

---

*ORION Architecture Decision Record · ADR-008 · docs/11_Governance/ADR/*
