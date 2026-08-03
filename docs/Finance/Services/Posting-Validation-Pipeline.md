# Posting Validation Pipeline

**Document ID:** FIN-SVC-003  
**Program:** P-009 — ORION Enterprise Finance  
**Mission:** P-009.8 — Finance Posting Validation Pipeline  
**Version:** 1.0  
**Status:** Implemented — Pre-Post Governance  
**Classification:** Platform Architecture · Finance Services  
**Date:** 3 August 2026

**Baseline:** [P-009.3 Finance Governance Rules](../Governance/P-009.3-Finance-Governance-Rules.md) · [Journal Posting Service](./Journal-Posting-Service.md) · [ES-FIN-002](../Engineering/ES-FIN-002-Finance-Engineering-Specification.md)

---

## Purpose

Documents the **Posting Validation Pipeline** — pre-post governance stages that execute before journal status mutation, general ledger posting, or event lineage completion.

**Scope:** Validation only. No reporting, analytics, workflow approvals, or external integrations.

---

## Architecture

```
JournalPostingService.executePostingPipeline()
  ├── load journal + lines
  ├── PostingValidationPipeline.validate()
  │     └── PostingValidationService (independent stage validators)
  │           ├── Organization
  │           ├── Fiscal Period
  │           ├── Idempotency
  │           ├── Account
  │           ├── Currency
  │           ├── Journal Balance
  │           ├── Authorization
  │           └── Budget
  ├── EventLineageRepository.record()      ← only after validation pass
  ├── JournalRepository.updateStatus()
  └── GeneralLedgerPostingService.postToLedger()
```

Each validator is independent — no validator calls another validator directly. The pipeline orchestrates execution and short-circuits on blocking outcomes.

---

## Execution Order

Fixed per P-009.3 §4.2:

| Order | Stage | Rule IDs | Blocking Outcomes |
|-------|-------|----------|-------------------|
| 1 | Organization | VAL-ORG-001/002 | FAIL |
| 2 | Fiscal Period | VAL-PER-001/002 | FAIL · STOP |
| 3 | Idempotency | VAL-IDP-001/002 | FAIL · STOP |
| 4 | Account | VAL-ACC-001/002 | FAIL · STOP |
| 5 | Currency | VAL-CUR-001/002 | FAIL |
| 6 | Journal Balance | VAL-BAL-001 | FAIL · STOP |
| 7 | Authorization | VAL-AUTH-001/002 | FAIL · STOP |
| 8 | Budget | BUD-001–004 | WARNING · STOP |

**Stage outcomes:** `pass` · `fail` · `warning` · `stop`

- **PASS** — continue to next stage
- **WARNING** — continue; warning recorded (budget soft limit)
- **FAIL / STOP** — halt pipeline; no journal mutation · no ledger mutation · no lineage completion

---

## Responsibilities

### PostingValidationPipeline

- Runs stages in canonical order
- Short-circuits on first blocking outcome
- Returns aggregate `PostingValidationResult` with warnings and stage audit trail

### PostingValidationService

- One method per stage (`validateStage`)
- Repository-backed checks only — no cross-stage calls
- Reuses `PeriodRulesEngine` for fiscal period validation

### JournalPostingService integration

Validation executes **after** journal existence/draft checks and **before**:

1. `EventLineageRepository.record(processing)`
2. `JournalRepository.updateStatus(posted)`
3. `GeneralLedgerPostingService.postToLedger()`

On validation failure the transaction rolls back with no side effects.

---

## Extension Points

| Extension | Mission |
|-----------|---------|
| Workflow approval gate (ADR-016) | Future |
| BudgetVarianceService hard/soft thresholds | P-009.9 |
| RBAC permission catalog (`finance.journal.post`) | ES-FIN-002 |
| Tax validation stage | Out of scope |
| Trial balance / reporting | Wave B |
| IIL outbound events | ADR-013/014 |

---

*Posting Validation Pipeline · P-009.8 · Governance before mutation*
