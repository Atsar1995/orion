# Journal Posting Service

**Document ID:** FIN-SVC-001  
**Program:** P-009 — ORION Enterprise Finance  
**Mission:** P-009.7C — Journal Posting Unit-of-Work  
**Version:** 1.0  
**Status:** Implemented — Orchestration Layer  
**Classification:** Platform Architecture · Finance Services  
**Date:** 3 August 2026

**Baseline:** [ES-FIN-002](../Engineering/ES-FIN-002-Finance-Engineering-Specification.md) · [Finance Journal Repository](../Persistence/Finance-Journal-Repository.md)

---

## Purpose

Documents the **Journal Posting Service** unit-of-work orchestration introduced in P-009.7C.

**Scope:** Transaction coordination and repository orchestration only — no accounting logic, GL mutation, validation rules, or IIL publishing.

---

## Responsibilities

| Component | Role |
|-----------|------|
| **JournalPostingService** | Coordinates posting pipeline within PlatformStore transaction |
| **DefaultPostingService** | Facade adapter from `ServiceContext` to `PostingContext` |
| **PostingContext** | Organization, journal, correlation, idempotency, metadata |
| **PostingResult** | Posted / duplicate outcome with lineage and transaction ids |
| **PostingTransaction** | Active UoW handle linking persistence transaction + context |

**Repositories used:**
- `JournalRepository` — load draft · update status to `posted`
- `EventLineageRepository` — idempotency · processing status metadata

**Explicitly excluded:** General Ledger, balances, fiscal period rules, approvals, IIL, executive intelligence.

---

## Transaction Lifecycle

```
post(PostingContext)
  ├── idempotency check (EventLineageRepository)
  ├── beginTransaction (PlatformStore TransactionManager)
  ├── load draft journal
  ├── record lineage (processing)
  ├── update journal status → posted
  ├── update lineage (completed)
  ├── commit OR rollback
  └── PostingResult
```

| Phase | Failure behaviour |
|-------|-------------------|
| Pre-check | Return duplicate result (no transaction) |
| Pipeline validation | Rollback · no journal mutation persisted (postgres pending discard) |
| Commit failure | Rollback · return dependency error |

PostgreSQL persistence uses `PostgresTransactionManager` to flush Finance entity writes on commit and discard on rollback (ADR-007).

---

## Repository Orchestration

```
createFinanceWiring(platformStore)
  └── JournalPostingService
        ├── journalRepository
        ├── eventLineageRepository
        └── platformStore.getTransactionManager()
```

Wiring exposes:
- `journalPosting` — direct orchestration API
- `posting` — `DefaultPostingService` facade for route/API layers

---

## Idempotency

Idempotency is enforced through **EventLineageRepository** metadata:

| Field | Usage |
|-------|--------|
| `idempotencyKey` | Primary duplicate detection key (`getByEventId`) |
| `correlationId` | Cross-service trace correlation |
| `eventId` | Optional inbound event reference |
| `processingStatus` | `processing` → `completed` lifecycle |

Repeated posts with the same completed idempotency key return `PostingResult.status = duplicate` without re-executing the pipeline.

---

## Architecture

```
PostingContext
  → JournalPostingService.post()
        → TransactionManager.beginTransaction()
        → JournalRepository (draft load · status update)
        → EventLineageRepository (metadata)
        → TransactionManager.commit() | rollback()
  → PostingResult
```

---

## Future Extension Points

| Extension | Mission |
|-----------|---------|
| GeneralLedgerRepository.updateOnPost | P-009.7D+ |
| ValidationService pre-post stages | P-009.3 governance |
| IdempotencyRepository.markProcessed | Optional parallel to lineage |
| IIL `finance.journal.posted` egress | ADR-013 · ADR-014 |
| Workflow approval gate | ADR-016 roadmap |

---

*Journal Posting Service · P-009.7C · Orchestration only*
