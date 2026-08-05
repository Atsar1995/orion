# CRM PostgreSQL Persistence

**Document ID:** CRM-PERS-001  
**Program:** P-008 — ORION Enterprise CRM  
**Mission:** P-008.17 — CRM PostgreSQL Persistence Activation & Restart Certification  
**Version:** 1.0  
**Status:** Implemented — Production Persistence Layer  
**Classification:** Platform Architecture · CRM Persistence  
**Date:** 5 August 2026

**Baseline:** [CRM-Platform-Foundation.md](../Platform/CRM-Platform-Foundation.md) · [CRM-Gate5-Certification-Report.md](../Certification/CRM-Gate5-Certification-Report.md) · [ADR-007](../../11_Governance/ADR/ADR-007-PlatformStore-PostgreSQL-Persistence-Strategy.md) · Finance reference (`createPostgresFinanceStore.ts`)

**Risk Closed:** CRM-R-001

---

## Purpose

Documents production PostgreSQL persistence activation for the CRM domain. Mission P-008.17 replaces placeholder SQL scaffolding with operational Map-wrapper persistence through `CrmEntityPersister`, mirroring the Finance persistence architecture (P-009.12 · P-009.13).

---

## Architecture Summary

```
PlatformStore.initialize()
  └── createPostgresCrmStore(connection)
        ├── CrmEntityPersister
        ├── CrmPersistingMap wrappers (14 collections)
        └── hydrate from crm_entities

Repository mutation
  └── backing Map.set() / delete()
        └── CrmEntityPersister.queueUpsert() / queueDelete()
              └── flushPending() → INSERT INTO crm_entities ... ON CONFLICT DO UPDATE

PlatformStore.shutdown()
  └── flushPostgresCrmStore(persister)
```

| Component | Path | Role |
|-----------|------|------|
| **CrmEntityPersister** | `lib/platform/persistence/crm/CrmEntityPersister.ts` | SQL executor + pending write queue |
| **CrmPersistingMap** | Same | Auto-persist Map wrapper for aggregates |
| **createPostgresCrmStore** | `lib/platform/persistence/crm/createPostgresCrmStore.ts` | Persisting store factory + hydration |
| **PostgresCrmRepository** | `lib/crm/persistence/PostgresCrmRepository.ts` | Postgres adapter (extends in-memory logic) |
| **createCrmPersistenceRepositories** | `lib/crm/persistence/createCrmPersistenceRepositories.ts` | Factory with Postgres gate |
| **crmPostgresPersistence** | `lib/crm/persistence/crmPostgresPersistence.ts` | `canUsePostgresCrmPersistence()` gate |

---

## Durable Collections

| Backing Field | Collection Constant | Entity Type |
|---------------|---------------------|-------------|
| `organizationFoundations` | `crm_organization_foundation` | Foundation marker |
| `accounts` | `crm_account` | Aggregate |
| `contacts` | `crm_contact` | Aggregate |
| `organizations` | `crm_organization` | Aggregate |
| `leads` | `crm_lead` | Aggregate |
| `opportunities` | `crm_opportunity` | Aggregate |
| `quotes` | `crm_quote` | Aggregate |
| `activities` | `crm_activity` | Aggregate |
| `cases` | `crm_case` | Aggregate |
| `salesOrders` | `crm_sales_order` | Aggregate |
| `notes` | `crm_note` | Aggregate |
| `attachments` | `crm_attachment` | Aggregate |
| `idempotencyKeys` | `crm_idempotency_key` | Org-scoped dedup bucket |
| `entityRegistry` | `crm_entity_registry` | Registry entry |

Schema: `crm_entities` table (bootstrap migration) with JSONB payload, org index, collection index.

---

## Restart Sequence

```
1. Write via CrmPersistenceRepository.upsert()
2. Map wrapper queues upsert → microtask flush → crm_entities
3. PlatformStore.shutdown() → flushPostgresCrmStore()
4. New PostgresPlatformStore(same connection)
5. PlatformStore.initialize() → createPostgresCrmStore() hydrates all collections
6. createCrmPersistenceRepositories() reads restored backing
```

Hydration uses `Map.prototype.set.call()` to bypass persisting wrappers and avoid duplicate writes on load.

---

## Transaction Rules

| Event | Persister Behaviour | PostgreSQL |
|-------|---------------------|------------|
| `beginTransaction()` | Defer auto-flush (`transactionDepth++`) | SQL `BEGIN` |
| `commit()` | `flushPending()` then SQL `COMMIT` | Durably persisted |
| `rollback()` | `discardPending()` — queued writes dropped | SQL `ROLLBACK` |

CRM persister is wired into `PostgresTransactionManager` alongside HCM and Finance persisters.

**Rule:** Successful commit → persist. Rollback → discard changes. No partial persistence.

---

## Organization Isolation

- All aggregate reads filter by `organizationId` in `InMemoryCrmRepository`
- Upserts include `organizationId` in payload; persisted to `crm_entities.organization_id`
- Cross-tenant access returns `null` / empty list

---

## Activation Gate

Postgres adapters activate when:

1. `DatabaseConnection` is available
2. `PlatformStore.isInitialized()` is true
3. Provider is PostgreSQL or SQLite (implemented)

See `canUsePostgresCrmPersistence()` in `crmPostgresPersistence.ts`.

---

## Certification

Restart survival certified in `tests/lib/crm/CrmPersistenceRestart.test.ts`:

- Single and multiple aggregate persistence
- Organization isolation across restart
- Idempotency key + entity registry survival
- Aggregate removal persistence
- Transaction rollback (uncommitted writes discarded)
- Transaction commit + restart survival

**CRM-R-001:** CLOSED

---

*CRM PostgreSQL Persistence · P-008.17 · Production persistence layer*
