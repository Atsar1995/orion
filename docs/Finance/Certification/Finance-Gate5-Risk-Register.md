# Finance Gate 5 — Risk Register

**Mission:** P-009.10 — Finance Gate 5 Enterprise Certification  
**Document ID:** FIN-CERT-RISK-001  
**Assessment Date:** 3 August 2026  
**Classification:** Internal — Finance Domain Certification

---

## Risk Summary

| Severity | Open | Accepted | Mitigated |
|----------|-----:|---------:|----------:|
| Critical | 0 | 0 | 0 |
| High | 5 | 1 | 2 |
| Medium | 4 | 2 | 3 |
| Low | 3 | 2 | 1 |

---

## High Risks

| ID | Risk | Impact | Likelihood | Owner | Mitigation | Status |
|----|------|--------|------------|-------|------------|--------|
| **FIN-R-001** | GL collections not durable on PostgreSQL path | Posted journals survive restart but ledger entries/balances lost | High | Platform Eng | Persist `ledgerEntries` / `ledgerBalances` via `FinanceEntityPersister` | **Open** |
| **FIN-R-002** | IIL transport in-process only (TD-PLATFORM-003) | Cross-restart event loss; at-least-once not guaranteed | High | Platform Eng | ADR-013 durable adapter; acknowledge after post-commit | **Open** |
| **FIN-R-003** | HCM does not publish canonical Finance contract events | End-to-end chain untested in production path | High | HCM Domain | Emit `hcm.workforce.cost.recorded` / `hcm.expense.approved` from payroll/expense | **Open** |
| **FIN-R-004** | Finance API routes lack fail-closed RBAC | Unauthorized posting/inquiry via REST surface | High | Platform Security | `finance-permission-catalog.ts` + route middleware (ES-FIN-002) | **Open** |
| **FIN-R-005** | CoA / period / idempotency in-memory only | Master data and dedup state lost on restart | High | Finance Domain | Extend Postgres persister to Wave A collections | **Open** |

---

## Medium Risks

| ID | Risk | Impact | Likelihood | Owner | Mitigation | Status |
|----|------|--------|------------|-------|------------|--------|
| **FIN-R-006** | TD-DOMAIN-PERSIST-001 partially open | Finance not fully production-authoritative | Medium | Finance Domain | Close journal path ✅; extend to GL/CoA | **Mitigating** |
| **FIN-R-007** | GA-001 excludes Finance restart assertions | Regression undetected in operational cert | Medium | QA / Platform | Extend GA001 with finance posting restart scenario | **Open** |
| **FIN-R-008** | Bootstrap mission drift in cert tests (S-001.2) | False confidence from misaligned mission constants | Medium | Finance Domain | Align P-009.5/6 cert test expectations | **Open** |
| **FIN-R-009** | Budget stage uses intelligence stub data | Soft-limit warnings not production-calibrated | Medium | Finance Domain | BudgetVarianceService in follow-on mission | **Accepted (Wave A)** |
| **FIN-R-010** | No outbound `finance.journal.posted` IIL event | Downstream intelligence cannot react to posts | Medium | Finance Domain | ADR-014 egress post-commit (Wave B) | **Accepted (Wave A)** |

---

## Low Risks

| ID | Risk | Impact | Likelihood | Owner | Mitigation | Status |
|----|------|--------|------------|-------|------------|--------|
| **FIN-R-011** | Stub services wired (tax, reconciliation, budget) | Confusion if invoked directly | Low | Finance Domain | Document stubs; gate API exposure | **Mitigated** |
| **FIN-R-012** | ADR-014 envelope fields incomplete on `IntelligenceEvent` | Contract validation partial | Low | Platform Eng | Extend envelope with `idempotencyKey`, `eventVersion` | **Open** |
| **FIN-R-013** | PostgreSQL GL restart test scoped to same session | Durability gap not caught by integration tests | Low | QA | Add GL persist + cross-restart GL cert test | **Open** |

---

## Accepted Wave A Waivers

| Waiver | Rationale | Expiry |
|--------|-----------|--------|
| In-memory IIL for dev/cert | ADR-013 spike acceptable per P-016.5 CONDITIONAL GO | Gate 6 or production cutover |
| No trial balance / reporting | Explicitly out of Wave A scope | Wave B |
| No workflow approval bindings | ADR-016 roadmap | Gate 6 |
| Budget/tax/reconciliation stubs | Wave A posting path does not depend on them | P-009.9+ missions |

---

## Risk Trend

Wave A reduced architectural uncertainty significantly (posting stack, validation, HCM consumer). Remaining high risks cluster around **production durability** (GL, IIL, master data) and **security surface** (API RBAC), not core posting logic correctness.

---

*Finance Gate 5 Risk Register · P-009.10 · Assessment only*
