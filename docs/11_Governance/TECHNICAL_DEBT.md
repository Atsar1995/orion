# ORION Technical Debt Register

**Version:** Wave 1 v1.0  
**Last Updated:** 23 August 2026  
**Authority:** Chief Enterprise Architect  
**Status:** Synchronized — P-015.7 Wave 1 Quality Gate  
**Previous Baseline:** v0.3 (30 July 2026 — REG-001 stale state)

---

## Purpose

This register tracks known technical debt, deferred features, and improvement backlog items across the ORION platform. Items are promoted from domain certification risk registers and engineering reviews into this central governance document as they are formally identified.

**Canonical location:** `docs/11_Governance/TECHNICAL_DEBT.md`  
**Domain registers:** HCM ([HCM-Technical-Debt-Register.md](../HCM/Engineering/HCM-Technical-Debt-Register.md)) · Platform certification reports in [`Certification/`](./Certification/)

---

## Summary (Wave 1 Exit — August 2026)

| Severity | Open | Resolved | Partial | Deferred | Accepted |
|----------|------|----------|---------|----------|----------|
| **Critical** | 0 | 2 | 0 | 0 | 0 |
| **High** | 3 | 2 | 0 | 0 | 0 |
| **Medium** | 5 | 0 | 1 | 0 | 0 |
| **Low** | 4 | 0 | 0 | 0 | 0 |

**REG-001 (Critical governance debt):** **Closed** — register synchronized with domain and platform debt as of P-015.7.

---

## Critical Items

### REG-001 — Central Register Out of Sync

| Field | Value |
|-------|-------|
| **ID** | REG-001 |
| **Domain** | Governance |
| **Severity** | Critical |
| **Source** | P-015.1 · ADR-004 |
| **Status** | **Resolved** (P-015.7) |
| **Description** | Central register stated "No technical debt identified" while domain registers documented P0 items. |
| **Mitigation** | Full sync in P-015.7 · ongoing domain register promotion |
| **Owner** | Chief Enterprise Architect |

### TD-HCM-001 — HCM Persistent Storage

| Field | Value |
|-------|-------|
| **ID** | TD-HCM-001 |
| **Domain** | HCM · Platform |
| **Severity** | Critical (P0 at GA) |
| **Source** | HCM-TD-001 · P-015.1 |
| **Status** | **Resolved** (P-015.5) |
| **Description** | HCM repositories used in-memory only; data lost on restart. |
| **Mitigation** | `PlatformStore` · PostgreSQL persistence layer · `PostgresPlatformStore` · HCM persister · migration tooling |
| **Owner** | Platform Engineering · HCM Lead |
| **Evidence** | `lib/platform/persistence/` · `lib/platform/store/PostgresPlatformStore.ts` · platform tests |

### SEC-002 / TD-PLATFORM-002 — API Fail-Open Default Context

| Field | Value |
|-------|-------|
| **ID** | TD-PLATFORM-002 |
| **Domain** | Platform Security |
| **Severity** | Critical |
| **Source** | P-015.1 · ADR-008 |
| **Status** | **Resolved** (P-015.6) |
| **Description** | Domain REST APIs accepted unauthenticated requests with default ServiceContext. |
| **Mitigation** | `getHcmApiContext(request)` fail-closed · platform RBAC · 401/403 mapping on HCM routes |
| **Owner** | Platform Engineering |
| **Evidence** | `lib/hcm/api/hcm-api-context.ts` · `lib/platform/security/` |

---

## High Items

### TD-HCM-005 — Fine-Grained HCM Permissions

| Field | Value |
|-------|-------|
| **ID** | TD-HCM-005 |
| **Domain** | HCM · Security |
| **Severity** | High (P0 at GA) |
| **Source** | HCM-TD-001 |
| **Status** | **Resolved** (P-015.6) |
| **Description** | HCM API routes did not enforce domain permission matrix. |
| **Mitigation** | HCM permission catalog · route-derived permissions · `AuthorizationService` integration |
| **Owner** | Platform Engineering |
| **Note** | Staging fail-closed certification pending Wave 2 ops environment |

### TD-PLATFORM-001 — Full Test Suite Doc Certification Drift

| Field | Value |
|-------|-------|
| **ID** | TD-PLATFORM-001 |
| **Domain** | Platform · CRM · Finance |
| **Severity** | High |
| **Source** | v1.0.1-rc1 certification |
| **Status** | **Resolved** (P-015.7) |
| **Description** | 6 certification tests failed — CRM docs in wrong path · Finance bootstrap mission drift. |
| **Mitigation** | CRM tests point to `docs/11_Governance/Certification/` · Finance tests align with P-009.7 workspace bootstrap |
| **Owner** | Engineering Lead |
| **Evidence** | **855/855** tests passing (23 Aug 2026) |

### TD-PLATFORM-003 — IIL EventBus In-Process Only

| Field | Value |
|-------|-------|
| **ID** | TD-PLATFORM-003 |
| **Domain** | Platform · IIL |
| **Severity** | High |
| **Source** | P-015.1 · AG-002 |
| **Status** | **Open** — Deferred Wave 2 |
| **Description** | Event bus is in-process; events lost on crash. |
| **Mitigation** | Durable queue ADR · Wave 2 implementation plan |
| **Owner** | Platform Engineering |
| **Target** | Wave 2 (P-015.8) |

### TD-PLATFORM-004 — ES-092–095 Not Ratified

| Field | Value |
|-------|-------|
| **ID** | TD-PLATFORM-004 |
| **Domain** | Governance |
| **Severity** | High |
| **Source** | P-015.1 · AG-006 |
| **Status** | **Open** — Deferred Wave 2 |
| **Description** | Level 2 engineering standards ES-092–095 planned but not ratified. |
| **Mitigation** | P-013.4–7 parallel program |
| **Owner** | Chief Enterprise Architect |
| **Target** | Wave 2 exit |

### INF-011 / INF-012 / OPS-001–003 — Operational Maturity

| Field | Value |
|-------|-------|
| **ID** | OPS-001 (aggregate) |
| **Domain** | Operations |
| **Severity** | High |
| **Source** | P-015.1 |
| **Status** | **Open** — Wave 2 |
| **Description** | DR, backup/restore, deployment runbooks, staging environment incomplete. |
| **Mitigation** | P-015.8 Operational Readiness mission |
| **Owner** | Platform Engineering · CTO |
| **Target** | Wave 2 (2027 Q1) |

---

## Medium Items

### TD-HCM-002 — Payroll and Talent REST APIs

| Field | Value |
|-------|-------|
| **ID** | TD-HCM-002 |
| **Domain** | HCM |
| **Severity** | Medium |
| **Status** | **Open** |
| **Description** | Payroll/talent exposed on facade only; no REST routes. |
| **Target** | v1.1 / S-002 follow-on |

### TD-HCM-005-DEV — In-Memory Default in Development

| Field | Value |
|-------|-------|
| **ID** | TD-HCM-005-DEV |
| **Domain** | Platform |
| **Severity** | Medium |
| **Status** | **Partial** |
| **Description** | `PlatformStoreFactory` defaults to in-memory unless `DATABASE_URL` set. |
| **Mitigation** | Production/staging must set PostgreSQL env · Wave 2 CI staging gate |
| **Target** | Wave 2 |

### CRM / Finance Persistence

| Field | Value |
|-------|-------|
| **ID** | TD-DOMAIN-PERSIST-001 |
| **Domain** | CRM · Finance |
| **Severity** | Medium |
| **Status** | **Open** — Out of GA scope per P-015.1 |
| **Description** | CRM and Finance remain in-memory; not production-authoritative. |
| **Target** | Post-GA domain missions |

### AG-002 — Durable IIL Transport Plan

| Field | Value |
|-------|-------|
| **ID** | AG-002 |
| **Domain** | Architecture |
| **Severity** | Medium |
| **Status** | **Open** |
| **Target** | Wave 2 ADR |

### DEP-002 / INF-014 — CI Quality Gate Extension

| Field | Value |
|-------|-------|
| **ID** | DEP-002 |
| **Domain** | Engineering |
| **Severity** | Medium |
| **Status** | **Open** |
| **Description** | CI quality gate extension to `release/v1.0.1` branch pending |
| **Target** | Wave 2 |

---

## Low Items

### TD-HCM-003 — Operational Event Publication Layer

| Field | Value |
|-------|-------|
| **ID** | TD-HCM-003 |
| **Domain** | HCM |
| **Severity** | Low |
| **Status** | **Open** |
| **Description** | Inconsistent event publication paths between foundation and operational services. |

### TD-HCM-004 — Interview Repository Stub

| Field | Value |
|-------|-------|
| **ID** | TD-HCM-004 |
| **Domain** | HCM |
| **Severity** | Low |
| **Status** | **Open** |

### TD-HCM-006 — Domain Model Documents D-015, D-016

| Field | Value |
|-------|-------|
| **ID** | TD-HCM-006 |
| **Domain** | HCM · Documentation |
| **Severity** | Low |
| **Status** | **Open** |

### Lint Warnings (Engineering Hygiene)

| Field | Value |
|-------|-------|
| **ID** | ENG-LINT-001 |
| **Domain** | Engineering |
| **Severity** | Low |
| **Status** | **Accepted** (Wave 1) |
| **Description** | 62 ESLint warnings — predominantly unused variables in tests and types. |
| **Target** | Incremental cleanup Wave 2 |

---

## Debt Entry Format

When items are added, each entry shall include:

| Field | Description |
|-------|-------------|
| ID | Unique identifier (e.g., TD-001) |
| Title | Short description |
| Domain | Affected domain or platform |
| Severity | Critical / High / Medium / Low |
| Source | Certification report, ADR, or engineering review |
| Status | Open / Resolved / Partial / Deferred / Accepted |
| Mitigation | Planned resolution |
| Owner | Responsible team or role |
| Target | Milestone or phase |

---

## Change Log

| Date | Version | Change |
|------|---------|--------|
| 30 Jul 2026 | v0.3 | Initial baseline — no entries |
| 23 Aug 2026 | v1.0 | P-015.7 sync — REG-001 closed · Wave 1 P0 items resolved · backlog classified |

---

*See also: [ARCHITECTURE_BASELINE_v0.3.md](./Architecture/ARCHITECTURE_BASELINE_v0.3.md) · [P-015.7 Wave 1 Completion Report](../00_Governance/P-015.7-Wave1-Completion-Report.md) · Domain certification in [`Certification/`](./Certification/)*
