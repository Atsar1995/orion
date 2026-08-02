# Enterprise HCM Technical Debt Register

**Document ID:** HCM-TD-001  
**Parent:** [ES-HCM-001](./ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)  
**Canonical Register:** [docs/11_Governance/TECHNICAL_DEBT.md](../../11_Governance/TECHNICAL_DEBT.md)  
**Last Updated:** 23 August 2026 — P-015.7 Wave 1 sync

---

## Summary

Enterprise HCM v1.0 delivers complete domain services, facade integration, foundation and time REST APIs, IIL events, and workflow orchestration. Wave 1 missions P-015.5 (PostgreSQL persistence) and P-015.6 (RBAC) resolve the two P0 items that blocked enterprise HCM certification.

`hcmFacade.getDomainStatus().readyForEnterpriseHcmCertification` may advance to `true` upon staging persistence and RBAC verification (Wave 2 operational gate).

---

## Active Items

### TD-HCM-001 — Persistent Storage

| Field | Value |
|-------|-------|
| **Priority** | High → **P0 (resolved)** |
| **Status** | **Resolved** (P-015.5) |
| **Description** | All repositories used `InMemoryHcmStore`. Data did not survive process restart. |
| **Resolution** | `PlatformStore` abstraction · PostgreSQL persistence · HCM persister · migration runner · integration tests |
| **Evidence** | `lib/platform/persistence/` · `lib/platform/store/PostgresPlatformStore.ts` · `tests/lib/platform/` |
| **Note** | In-memory adapter remains for local dev when `DATABASE_URL` unset |

### TD-HCM-002 — Payroll and Talent REST APIs

| Field | Value |
|-------|-------|
| **Priority** | Medium |
| **Status** | Open |
| **Description** | P-012.7 and P-012.8 services exposed on facade only. No `app/api/hcm/payroll` or `app/api/hcm/talent` routes. |
| **Impact** | External HTTP consumers cannot access payroll/talent without custom integration |
| **Mitigation** | Full facade API available programmatically |
| **Target** | S-002.x follow-on or v1.1 |

### TD-HCM-003 — Operational Event Publication Layer

| Field | Value |
|-------|-------|
| **Priority** | Low |
| **Status** | Open |
| **Description** | Time, payroll, and talent events publish from within domain services. Foundation events publish via facade event wrapper. Pattern inconsistency. |
| **Impact** | Minor — both paths reach IIL correctly |
| **Mitigation** | Documented in Architecture Guide |
| **Target** | Refactor when touching event infrastructure |

### TD-HCM-004 — Interview Repository Stub

| Field | Value |
|-------|-------|
| **Priority** | Low |
| **Status** | Open |
| **Description** | `InterviewRepository` interface exists; scheduling updates application status without dedicated interview persistence. |
| **Impact** | Interview records not independently queryable |
| **Mitigation** | `scheduleInterview` advances application workflow |
| **Target** | Recruitment enhancement mission |

### TD-HCM-005 — Fine-Grained HCM Permissions

| Field | Value |
|-------|-------|
| **Priority** | Medium → **P0 (resolved)** |
| **Status** | **Resolved** (P-015.6) |
| **Description** | API routes used platform session context but did not enforce HCM-specific permission matrix. |
| **Resolution** | HCM permission catalog · route-derived permissions on all 38 HCM API routes · fail-closed 401/403 · platform security health check |
| **Evidence** | `lib/hcm/auth/hcm-permission-catalog.ts` · `lib/platform/security/` · `tests/lib/platform/security/` |
| **Note** | Production/staging fail-closed verification scheduled Wave 2 |

### TD-HCM-006 — Domain Model Documents (D-015, D-016)

| Field | Value |
|-------|-------|
| **Priority** | Low |
| **Status** | Open |
| **Description** | Canonical domain model (D-015) and governance framework (D-016) not yet published. Types in `types/hcm-*` serve as de facto model. |
| **Impact** | Architecture documentation references planned artifacts |
| **Mitigation** | ES-HCM-001 and type definitions align with implementation |

---

## Justified Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Single `hcmFacade` export | Prevents repository bypass; simplifies consumer contracts |
| In-memory store for local dev | Accelerates developer workflow; PostgreSQL required for staging/production |
| Foundation events via facade wrapper | Ensures consistent IIL publication without modifying service business rules |
| `CustomEvent` + `hcmEventType` payload | Aligns with platform IIL conventions; avoids event type proliferation |
| No payroll/talent REST in v1.0 | S-002.7 scope limited to foundation + time route rationalization |

---

## Deferred Enhancements (Not Debt)

- HCM executive workspace UI (`/hcm` route)
- Finance payroll posting integration
- Multi-country statutory payroll rules
- Advanced workforce analytics dashboards

---

*Maintained under S-002.8 · Synced with central register P-015.7 · Update when debt items are resolved or new items discovered.*
