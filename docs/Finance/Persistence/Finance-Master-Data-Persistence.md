# Finance Master Data Persistence

**Document ID:** FIN-PST-002  
**Program:** P-009 — ORION Enterprise Finance  
**Mission:** P-009.13 — Finance Master Data PostgreSQL Persistence  
**Version:** 1.0  
**Status:** Implemented — Persistence Layer  
**Classification:** Platform Architecture · Finance Persistence  
**Date:** 3 August 2026

**Baseline:** [ES-FIN-002](../Engineering/ES-FIN-002-Finance-Engineering-Specification.md) · [Finance Platform Foundation](../Platform/Finance-Platform-Foundation.md) · [Finance Journal Repository](./Finance-Journal-Repository.md) · [P-009.11 Closure Program](../Certification/Finance-Gate5-Closure-Program.md)

---

## Purpose

Documents PostgreSQL persistence for **Finance master data collections** introduced in P-009.13.

**Scope:** Persistence behaviour only — no posting logic, reporting, workflow, or cross-domain events.

**Closes:** FIN-R-005 · contributes to TD-DOMAIN-PERSIST-001 resolution.

---

## Collections Persisted

| Collection | Constant | Backing field | Repository |
|------------|----------|---------------|------------|
| Chart of Accounts | `finance_account` | `accounts` | `ChartOfAccountsRepository` |
| Fiscal Periods | `finance_fiscal_period` | `fiscalPeriods` | `PeriodRepository` |
| Fiscal Years | `finance_fiscal_year` | `fiscalYears` | `PeriodRepository` |
| Fiscal Calendar | `finance_fiscal_calendar` | `fiscalCalendar.value` | `PeriodRepository` |
| Idempotency Keys | `finance_idempotency_key` | `idempotencyKeys` | `IdempotencyRepository` |

Exchange rates are **not modeled** as a standalone repository in Wave A and are out of scope for P-009.13.

General ledger collections remain in-memory until P-009.12.

---

## Architecture

```
PostgresPlatformStore.initialize()
  └── createPostgresFinanceStore(connection)
        ├── FinanceEntityPersister
        ├── FinancePersistingMap          → accounts, fiscalPeriods, fiscalYears
        ├── FinancePersistingFiscalCalendar → fiscalCalendar
        ├── FinancePersistingIdempotencyMap → idempotencyKeys
        └── (existing) journals, journalLines, eventLineage

createFinanceWiring(platformStore)
  └── createFinanceRepositories(backing, { platformStore, connection })
        ├── PostgresChartOfAccountsRepository   [relational runtime]
        ├── PostgresPeriodRepository
        ├── PostgresIdempotencyRepository
        └── InMemory* adapters                  [dev / CI default]
```

PostgreSQL collections are stored in the shared `finance_entities` JSONB table (ADR-007).

---

## Persistence Lifecycle

### Write path

1. Repository mutates PlatformStore backing collection (Map or scalar holder).
2. Persisting wrapper queues upsert/delete on `FinanceEntityPersister`.
3. Auto-flush runs on microtask when not inside a transaction.
4. `PostgresTransactionManager.commit()` flushes pending Finance writes before SQL `COMMIT`.
5. `PostgresPlatformStore.shutdown()` calls `flushPostgresFinanceStore()`.

### Hydration path

1. `createPostgresFinanceStore()` loads each master data collection via `loadCollection()`.
2. Hydration uses `Map.prototype.set.call()` to bypass persisting wrappers (no duplicate writes).
3. Fiscal calendar scalar is restored via `FinancePersistingFiscalCalendar.hydrate()`.
4. `ensureFinancePlatformBacking()` seeds only when `accounts.size === 0` (fresh store).

### Restart survival

```
Write master data → shutdown (flush) → re-initialize → hydrate → repository read → same state
```

Certified in `tests/lib/finance/FinanceMasterDataPersistence.test.ts`.

---

## Transaction Boundary

| Operation | Behaviour |
|-----------|-----------|
| `beginTransaction()` | Persister defers auto-flush |
| `commit()` | Persister flushes pending writes, then SQL commit |
| `rollback()` | Persister discards pending queue; unflushed writes never reach PostgreSQL |

In-memory Maps reflect uncommitted writes until process restart re-hydrates from PostgreSQL.

---

## PlatformStore Interaction

| Provider | Master data behaviour |
|----------|----------------------|
| **InMemoryPlatformStore** | Ephemeral Maps · seed on first access |
| **PostgresPlatformStore** | Persisting wrappers · hydrate on init · flush on shutdown |

`createFinanceRepositories()` activates PostgreSQL adapters when:

- PlatformStore is initialized
- Provider is PostgreSQL or SQLite
- Database connection is available

---

## Organization Isolation

All master data repositories enforce organization scoping:

- Chart of accounts: `organizationId` on record
- Fiscal periods/years/calendar: `organizationId` on record
- Idempotency keys: composite key `${organizationId}::${idempotencyKey}`

Cross-tenant reads return `null` / `false` without mutation.

---

## Test Coverage

| Scenario | Test file |
|----------|-----------|
| PostgreSQL adapter activation | `FinanceMasterDataPersistence.test.ts` |
| CoA create / update / delete restart | same |
| Fiscal period state restart | same |
| Idempotency key restart | same |
| Organization isolation | same |
| Transaction rollback | same |

---

## Related Risks

| Risk | Status after P-009.13 |
|------|------------------------|
| FIN-R-005 | **Closed** — master data durable on PostgreSQL path |
| FIN-R-006 | **Mitigating** — journal + lineage + master data durable; GL pending P-009.12 |
| TD-DOMAIN-PERSIST-001 | **Partially closed** — master data path complete |

---

*Finance Master Data Persistence · P-009.13 · Persistence only*
