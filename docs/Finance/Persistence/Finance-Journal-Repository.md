# Finance Journal Repository

**Document ID:** FIN-PST-001  
**Program:** P-009 — ORION Enterprise Finance  
**Mission:** P-009.7B — Finance Repository Implementation  
**Version:** 1.0  
**Status:** Implemented — Persistence Layer  
**Classification:** Platform Architecture · Finance Persistence  
**Date:** 3 August 2026

**Baseline:** [ES-FIN-002](../Engineering/ES-FIN-002-Finance-Engineering-Specification.md) · [Finance Platform Foundation](../Platform/Finance-Platform-Foundation.md) · [P-009.7A Repository Infrastructure](../../lib/finance/persistence/)

---

## Purpose

Documents the **Journal** and **Event Lineage** repository implementations introduced in P-009.7B.

**Scope:** Repository persistence behaviour only — no journal posting, ledger mutation, validation, or IIL processing.

---

## Repository Lifecycle

```
createFinanceWiring(platformStore)
  └── createFinancePersistenceRepositories({ platformStore, connection })
        ├── InMemoryJournalRepository(backing)            [dev / CI default]
        ├── InMemoryEventLineageRepository(backing)
        ├── PostgresJournalRepository(backing, connection)  [relational runtime]
        └── PostgresEventLineageRepository(backing, connection)
```

| Operation | JournalRepository | EventLineageRepository |
|-----------|-------------------|------------------------|
| Create | `createDraft()` · `save()` | `record()` |
| Read | `getById()` · `listByOrganization()` · `listByPeriod()` | `getByEventId()` · `getByCorrelationId()` |
| Update | `updateStatus()` (metadata only) | `updateProcessingStatus()` · `incrementReplayCount()` |
| Delete | `deleteDraft()` (draft only) | — |
| Exists | `exists()` | `exists()` |

All operations enforce **organization isolation** via `organizationId` scoping.

---

## Persistence Architecture

```
PlatformStore
  └── getFinanceBacking()
        ├── journals: Map<id, JournalEntryRecord>
        ├── journalLines: Map<org::journalId, JournalLineRecord[]>
        └── eventLineage: Map<id, EventLineageRecord>
              └── FinanceEntityPersister (PostgreSQL)
                    ├── finance_journal
                    ├── finance_journal_line
                    └── finance_event_lineage
```

PostgreSQL collections are stored in the `finance_entities` JSONB table (ADR-007 · P-009.6).

---

## PlatformStore Interaction

| Provider | Behaviour |
|----------|-----------|
| **InMemoryPlatformStore** | Ephemeral backing · in-memory repositories |
| **PostgresPlatformStore** | `createPostgresFinanceStore()` hydrates backing · persisting maps flush on shutdown |

`PostgresPlatformStore.getDatabaseConnection()` is passed into `createFinancePersistenceRepositories()` so PostgreSQL repository adapters activate automatically when the store is initialized.

`PostgresTransactionManager` coordinates HCM and Finance persister flush boundaries during unit-of-work commits.

---

## Restart Survival

1. Repository writes mutate PlatformStore backing collections.
2. Persisting map wrappers queue upserts to `finance_entities`.
3. `PlatformStore.shutdown()` flushes pending Finance entity writes.
4. On re-initialization, `createPostgresFinanceStore()` hydrates journals, lines, and lineage into backing maps.
5. Repositories resume against restored backing — no domain logic required.

Certification: `tests/lib/finance/FinanceJournalRepository.test.ts` · restart survival scenario.

---

## Remaining Wave A Work

| Item | Status |
|------|--------|
| Journal / lineage repository persistence (this mission) | ✅ Implemented |
| Journal post unit-of-work | ⏳ P-009.7C+ (PostingService) |
| General ledger balance mutation | ⏳ Out of scope |
| Validation engine integration | ⏳ Out of scope |
| Durable IIL inbound processor | ⏳ ADR-013 implementation |

---

*Finance Journal Repository · P-009.7B · Infrastructure only*
