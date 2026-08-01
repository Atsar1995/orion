# Enterprise HCM Technical Debt Register

**Document ID:** HCM-TD-001  
**Parent:** [ES-HCM-001](./ES-HCM-001_Enterprise_HCM_Engineering_Specification.md)  
**Canonical Register:** [docs/11_Governance/TECHNICAL_DEBT.md](../../11_Governance/TECHNICAL_DEBT.md)

---

## Summary

Enterprise HCM v1.0 delivers complete domain services, facade integration, foundation and time REST APIs, IIL events, and workflow orchestration. The items below are **known limitations** — not blockers for domain service usage via `hcmFacade`.

`hcmFacade.getDomainStatus().readyForEnterpriseHcmCertification` remains `false` until debt items TD-HCM-001 through TD-HCM-004 are resolved.

---

## Active Items

### TD-HCM-001 — Persistent Storage

| Field | Value |
|-------|-------|
| **Priority** | High |
| **Status** | Open |
| **Description** | All repositories use `InMemoryHcmStore`. Data does not survive process restart. |
| **Impact** | Not production-ready for stateful deployments |
| **Mitigation** | Repository interfaces designed for swap-in persistent implementations |
| **Target** | Post v1.0 infrastructure mission |

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
| **Priority** | Medium |
| **Status** | Open |
| **Description** | API routes use platform session context but do not enforce HCM-specific permission matrix. |
| **Impact** | All authenticated users with API access can invoke HCM operations |
| **Mitigation** | Organization isolation still enforced |
| **Target** | Platform permissions integration |

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
| In-memory store for v1.0 | Accelerates mission delivery; repository interfaces preserve migration path |
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

*Maintained under S-002.8. Update when debt items are resolved or new items discovered.*
