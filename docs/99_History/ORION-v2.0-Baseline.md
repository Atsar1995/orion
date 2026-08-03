# ORION Enterprise Platform v2.0 — Architecture Baseline

**Document ID:** BASELINE-v2.0-001  
**Version:** 1.0  
**Effective Date:** 3 August 2026  
**Branch:** `develop/v2.0` @ `65da475`  
**Platform Version:** 0.2.0  
**Authority:** Architecture Review Board · Chief Enterprise Architect

**Authoritative baseline:** [P-016.6 Architecture Baseline](../00_Governance/P-016.6-Architecture-Baseline.md)  
**Milestone history:** [ORION-v2.0-Milestone-2026-08.md](./ORION-v2.0-Milestone-2026-08.md)  
**Fork point from v1.0:** `release/v1.0.1` @ `12af9c4`

---

## Baseline Statement

ORION v2.0 baseline (August 2026) establishes:

1. **Wave 1 constitutional ADRs Accepted** — ADR-013 · ADR-014 · ADR-015 · ADR-020 ([P-016.5](../00_Governance/P-016.5-Architecture-Review-Board-Ratification.md))
2. **ADR-013 Durable IIL Implemented** — P-009.16
3. **Finance Gate 5 Wave A engineering complete** — P-009.5 through P-009.17 (CONDITIONAL GO)
4. **HCM → Finance durable event chain certified** — native publish · durable transport · Finance consumer
5. **GA-001 extended to Finance production path** — P-009.17

---

## Certification Posture

| Scope | Verdict |
|-------|---------|
| Finance Gate 5 Wave A | **CONDITIONAL GO** |
| Finance GA-001 operational path | **CONDITIONAL GO** |
| v2.0 GA release | **NO-GO** |

**Primary production blocker:** FIN-R-001 — General Ledger PostgreSQL persistence.

---

## ADR Status at Baseline

| ADR | Status |
|-----|--------|
| ADR-013 | **Implemented** |
| ADR-014 | **Accepted · Partially Implemented** |
| ADR-015 | **Accepted · Partially Implemented** |
| ADR-020 | **Accepted · Partially Implemented** |

See [P-016.6 §4](../00_Governance/P-016.6-Architecture-Baseline.md#4-adr-matrix) for traceability matrix.

---

## Technical Debt at Baseline

Synchronized in [TECHNICAL_DEBT.md](../11_Governance/TECHNICAL_DEBT.md) (P-016.6):

- **Closed:** TD-PLATFORM-003 · AG-002 · FIN-R-002 · FIN-R-003 · FIN-R-004 · FIN-R-005 · FIN-R-007
- **Open (high):** FIN-R-001 · TD-DOMAIN-PERSIST-001 (partial)
- **Open (ops):** OPS-001 aggregate

---

*ORION v2.0 Baseline · docs/99_History/ · Ratified P-016.6*
