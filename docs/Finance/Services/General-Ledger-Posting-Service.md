# General Ledger Posting Service

**Document ID:** FIN-SVC-002  
**Program:** P-009 — ORION Enterprise Finance  
**Mission:** P-009.7D — General Ledger Posting Engine  
**Version:** 1.0  
**Status:** Implemented — First Accounting Behaviour  
**Classification:** Platform Architecture · Finance Services  
**Date:** 3 August 2026

**Baseline:** [Journal Posting Service](./Journal-Posting-Service.md) · [ES-FIN-002](../Engineering/ES-FIN-002-Finance-Engineering-Specification.md)

---

## Purpose

Documents the **General Ledger Posting Service** — the first accounting behaviour in ORION Finance Wave A.

**Scope:** Transactional GL mutation from posted journals within the existing posting unit-of-work. No trial balance, reporting, validation rules, or IIL publishing.

---

## Architecture

```
JournalPostingService.post()
  ├── JournalRepository (draft → posted)
  ├── EventLineageRepository (idempotency metadata)
  └── GeneralLedgerPostingService.postToLedger()
        ├── JournalRepository.listLines()
        ├── GeneralLedgerMutation[] (per line)
        └── GeneralLedgerRepository.applyMutations()
              ├── LedgerEntryRecord[]
              ├── LedgerBalanceRecord updates
              └── LedgerPostingRecord audit
```

---

## Ledger Mutation Lifecycle

| Step | Action |
|------|--------|
| 1 | Load posted journal lines |
| 2 | Build `GeneralLedgerMutation` per line (debit, credit, account, journal ref, timestamp) |
| 3 | `applyMutations()` persists entries and rolling balances |
| 4 | Return `LedgerPostingResult` with entry count and account ids |

**Explicitly excluded:** balance validation, account existence checks, fiscal period gates.

---

## Transaction Boundary

All GL mutations execute inside the **same PlatformStore transaction** started by `JournalPostingService`:

```
BEGIN
  Journal status → posted
  GeneralLedgerRepository.applyMutations()
  EventLineage → completed
COMMIT | ROLLBACK
```

On GL failure, journal status reverts to `draft` before rollback propagates.

PostgreSQL: `PostgresTransactionManager` flushes Finance entity writes on commit.

---

## Repository Extensions (P-009.7D)

| Method | Purpose |
|--------|---------|
| `applyMutations()` | Persist entries + update balances + audit posting |
| `getAccountBalance()` | Alias for account balance lookup |
| `getEntries()` | Query ledger entries by org / period / account / journal |

---

## Extension Points

| Extension | Mission |
|-----------|---------|
| Trial balance / reporting queries | Wave B |
| ValidationService pre-post (P-009.3) | Future |
| PostgreSQL durable GL collections | P-009.6 follow-up |
| IIL `finance.journal.posted` egress | ADR-013/014 |
| Sub-ledger allocation | Wave B |

---

*General Ledger Posting Service · P-009.7D · First accounting behaviour*
