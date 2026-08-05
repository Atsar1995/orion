# CRM Gate 5 — Risk Register

**Mission:** P-008.16 — CRM Gate 5 Enterprise Certification  
**Document ID:** CRM-CERT-RISK-001  
**Assessment Date:** 4 August 2026  
**Last Synchronized:** 4 August 2026 (P-016.6)  
**Branch Baseline:** `develop/v2.0` @ `4a5d27b`  
**Classification:** Internal — CRM Domain Certification

**Baseline:** [P-016.6 Architecture Baseline](../../00_Governance/P-016.6-Architecture-Baseline.md) · [CRM-Reference-Domain-Architecture.md](../CRM-Reference-Domain-Architecture.md)

---

## Risk Summary

| Severity | Open | Closed | Accepted | Mitigating |
|----------|-----:|-------:|---------:|-----------:|
| Critical | 0 | 0 | 0 | 0 |
| High | 3 | 0 | 0 | 0 |
| Medium | 5 | 0 | 2 | 1 |
| Low | 3 | 0 | 0 | 0 |

---

## High Risks

| ID | Risk | Impact | Likelihood | Owner | Priority | Mitigation | Mission | Target Release | Status |
|----|------|--------|------------|-------|----------|------------|---------|----------------|--------|
| **CRM-R-001** | `PostgresCrmRepository` SQL placeholders only — no query execution | All CRM data lost on restart; Postgres path non-functional | High | Platform Eng | P1 | Implement query execution via `CrmEntityPersister` + restart survival tests | P-008.17 | Gate 6 | **Open** |
| **CRM-R-002** | Business logic uses TD-002 in-memory singleton path | Dual repository path; wiring bypassed by API singletons | High | CRM Domain | P1 | Route all services through `createCrmWiring()` repos; retire `defaultCrmRepository` singletons | P-008.18 | Gate 6 | **Open** |
| **CRM-R-003** | Finance has no CRM canonical event consumer | `crm.revenue.recognized` / `crm.salesorder.confirmed` never reach Finance posting | High | Finance Domain | P1 | Implement `FinanceCrmEventConsumer` for ADR-014 canonical types | P-009.19 | Gate 6 | **Open** |

---

## Medium Risks

| ID | Risk | Impact | Likelihood | Owner | Priority | Mitigation | Mission | Target Release | Status |
|----|------|--------|------------|-------|----------|------------|---------|----------------|--------|
| **CRM-R-004** | Legacy engine event shims active alongside canonical publisher | Dual publication; consumer confusion; contract drift | Medium | CRM Domain | P2 | Deprecate `publishCommercialEngineEvent` et al. after consumer migration | P-008.20 | Gate 6 | **Open** |
| **CRM-R-005** | Case/SalesOrder services minimal — no REST routes | Case close event only testable via service; no API surface | Medium | CRM Domain | P2 | Add case management REST + full SalesOrder lifecycle | P-008.21 | Wave B+ | **Open** |
| **CRM-R-006** | API singletons in `lib/crm/index.ts` bypass composition root DI | Inconsistent wiring; test/production drift | Medium | CRM Domain | P2 | Converge exports to `crmFacade` / `createCrmWiring()` only | P-008.18 | Gate 6 | **Mitigating** |
| **CRM-R-007** | EventContracts registry (`docs/11_Governance/EventContracts/`) absent | No central contract validation for cross-domain consumers | Medium | Platform Eng | P2 | Create registry per ADR-014 Gate 6 requirement | P-014.5 | Gate 6 | **Accepted (Gate 6)** |
| **CRM-R-008** | `CRM-Platform-Foundation.md` mission status outdated | Documentation drift; false pending status for P-008.10–13 | Medium | CRM Domain | P3 | Update foundation doc to reflect completed missions | P-008.22 | Gate 6 | **Open** |
| **CRM-R-009** | Seven sub-facades remain; unified service surface incomplete | Architectural complexity; ADR-015 convergence gap | Medium | CRM Domain | P2 | Converge to single `CrmService` orchestration layer | P-008.19 | Gate 6 | **Open** |
| **CRM-R-010** | GA-001 excludes CRM restart assertions | Regression undetected in operational cert | Medium | QA / Platform | P2 | Add CRM Postgres restart-survival GA scenario | P-008.23 | Gate 6 | **Open** |

---

## Low Risks

| ID | Risk | Impact | Likelihood | Owner | Priority | Mitigation | Mission | Target Release | Status |
|----|------|--------|------------|-------|----------|------------|---------|----------------|--------|
| **CRM-R-011** | IIL transport in-process only (TD-PLATFORM-003) | Cross-restart event loss; at-least-once not guaranteed | Low | Platform Eng | P3 | ADR-013 durable adapter (shared with Finance) | P-009.16 | Gate 6 | **Open** |
| **CRM-R-012** | ADR-014 envelope fields incomplete on legacy `IntelligenceEvent` shims | Contract validation partial on dual-publication path | Low | Platform Eng | P3 | Retire shims (CRM-R-004) or extend envelope | P-008.20 | Gate 6 | **Open** |
| **CRM-R-013** | `CrmFacade.readyForCertification` remains `false` | Status flag not flipped post-certification | Low | CRM Domain | P3 | Set `true` after CRM-R-001/002/003 closed | P-008.24 | Post-Gate 6 | **Open** |

---

## Accepted Wave B Waivers

| Waiver | Rationale | Expiry |
|--------|-----------|--------|
| EventContracts registry (CRM-R-007) | Gate 6 platform governance scope | Gate 6 |
| Case management REST surface (CRM-R-005 partial) | Event emission certified; API deferred | Wave B+ |
| Legacy dual event publication (CRM-R-004) | HCM convergence pattern; safe until consumer migration | Gate 6 |
| In-memory IIL for dev/staging | TD-PLATFORM-003 shared platform debt | Gate 6 or executive waiver |

---

## Risk Trend

CRM Gate 5 (P-008.9–P-008.15) closed **zero** high risks — all three high risks are **newly identified at certification** and expected for Wave B scope. Security risks that blocked Finance Gate 5 (API RBAC) are **closed for CRM** at P-008.13. Primary production blockers are **persistence activation (CRM-R-001)**, **repository path convergence (CRM-R-002)**, and **Finance consumer (CRM-R-003)**.

Architecture risks (facade convergence, EventContracts registry) tracked in [P-016.6](../../00_Governance/P-016.6-Architecture-Baseline.md).

---

## Production Blockers Summary

| Blocker | Risk ID | Required for Unconditional GO |
|---------|---------|-------------------------------|
| Postgres query activation | CRM-R-001 | Yes |
| TD-002 singleton retirement | CRM-R-002 | Yes |
| Finance CRM consumer | CRM-R-003 | Yes |
| Durable IIL transport | CRM-R-011 / TD-PLATFORM-003 | Yes (or waiver) |
| GA-001 CRM restart test | CRM-R-010 | Recommended |

---

*CRM Gate 5 Risk Register · P-008.16 · Synchronized P-016.6*
