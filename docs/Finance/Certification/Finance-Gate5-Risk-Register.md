# Finance Gate 5 — Risk Register

**Mission:** P-009.10 — Finance Gate 5 Enterprise Certification  
**Document ID:** FIN-CERT-RISK-001  
**Assessment Date:** 3 August 2026  
**Last Synchronized:** 5 August 2026 (P-016.7)  
**Branch Baseline:** `develop/v2.0` @ `3f259d9`  
**Classification:** Internal — Finance Domain Certification

**Baseline:** [P-016.6 Architecture Baseline](../../00_Governance/P-016.6-Architecture-Baseline.md) · [Finance-GA001-Certification.md](./Finance-GA001-Certification.md)

---

## Risk Summary

| Severity | Open | Closed | Accepted | Mitigating |
|----------|-----:|-------:|---------:|-----------:|
| Critical | 0 | 0 | 0 | 0 |
| High | 1 | 4 | 0 | 0 |
| Medium | 2 | 1 | 2 | 1 |
| Low | 2 | 0 | 0 | 1 |

---

## High Risks

| ID | Risk | Impact | Likelihood | Owner | Mitigation | Status |
|----|------|--------|------------|-------|------------|--------|
| **FIN-R-001** | GL collections not durable on PostgreSQL path | Posted journals survive restart but ledger entries/balances lost | High | Platform Eng | Persist `ledgerEntries` / `ledgerBalances` via `FinanceEntityPersister` (P-009.12) | **Open** |
| **FIN-R-002** | IIL transport in-process only (TD-PLATFORM-003) | Cross-restart event loss; at-least-once not guaranteed | High | Platform Eng | ADR-013 durable adapter — P-009.16 | **Closed** — `9cddb12` |
| **FIN-R-003** | HCM does not publish canonical Finance contract events | End-to-end chain untested in production path | High | HCM Domain | P-009.15 native publishers | **Closed** — `869ad16` |
| **FIN-R-004** | Finance API routes lack fail-closed RBAC | Unauthorized posting/inquiry via REST surface | High | Platform Security | P-009.14 permission catalog + middleware | **Closed** — `f6a0935` |
| **FIN-R-005** | CoA / period / idempotency in-memory only | Master data and dedup state lost on restart | High | Finance Domain | P-009.13 Postgres persister | **Closed** — `12c4ab5` |

---

## Medium Risks

| ID | Risk | Impact | Likelihood | Owner | Mitigation | Status |
|----|------|--------|------------|-------|------------|--------|
| **FIN-R-006** | TD-DOMAIN-PERSIST-001 partially open | Finance not fully production-authoritative | Medium | Finance Domain | Journal + master data ✅; GL pending P-009.12 | **Mitigating** |
| **FIN-R-007** | GA-001 excludes Finance restart assertions | Regression undetected in operational cert | Medium | QA / Platform | P-009.17 Finance GA-001 suite | **Closed** — `65da475` |
| **FIN-R-008** | Bootstrap mission drift in cert tests (S-001.2) | False confidence from misaligned mission constants | Medium | Finance Domain | Align P-009.5/6 cert test expectations (P-009.18) | **Open** |
| **FIN-R-009** | Budget stage uses intelligence stub data | Soft-limit warnings not production-calibrated | Medium | Finance Domain | BudgetVarianceService in follow-on mission | **Accepted (Wave A)** |
| **FIN-R-010** | No outbound `finance.journal.posted` IIL event | Downstream intelligence cannot react to posts | Medium | Finance Domain | ADR-014 egress post-commit (Wave B) | **Accepted (Wave A)** |

---

## Low Risks

| ID | Risk | Impact | Likelihood | Owner | Mitigation | Status |
|----|------|--------|------------|-------|------------|--------|
| **FIN-R-011** | Stub services wired (tax, reconciliation, budget) | Confusion if invoked directly | Low | Finance Domain | Document stubs; gate API exposure | **Mitigated** |
| **FIN-R-012** | ADR-014 envelope fields incomplete on `IntelligenceEvent` | Contract validation partial | Low | Platform Eng | Extend envelope with `idempotencyKey`, `eventVersion` | **Open** — partial coverage exists |
| **FIN-R-013** | PostgreSQL GL restart test scoped to same session | Durability gap not caught by integration tests | Low | QA | Add GL persist + cross-restart GL cert test (P-009.12) | **Open** |

---

## Accepted Wave A Waivers

| Waiver | Rationale | Expiry |
|--------|-----------|--------|
| No outbound `finance.journal.posted` | Wave B scope (FIN-R-010) | Gate 6 or Wave B |
| No trial balance / reporting | Explicitly out of Wave A scope | Wave B |
| No workflow approval bindings | ADR-016 roadmap | Gate 6 |
| Budget/tax/reconciliation stubs | Wave A posting path does not depend on them | P-009.9+ missions |

**Removed:** In-memory IIL waiver — superseded by ADR-013 Implemented (P-009.16).

---

## Risk Trend

Wave A engineering (P-009.13–P-009.19) closed **5 of 6** high risks and established **two enterprise reference chains**. Remaining high risk is **GL PostgreSQL durability (FIN-R-001)**. CRM-R-003 closed at P-009.19. Architecture risks (ADR-014 registry) tracked in [P-016.7](../../00_Governance/P-016.7-Enterprise-Readiness-Update.md).

---

*Finance Gate 5 Risk Register · P-009.10 · Synchronized P-016.7*
