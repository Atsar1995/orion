# Enterprise PostgreSQL Persistence

**Mission:** P-015.5 — Enterprise PostgreSQL Persistence Implementation  
**Status:** Implemented  
**ADR:** [ADR-007](../../11_Governance/ADR/ADR-007-Production-Persistence-Strategy.md)  
**Related:** [PlatformStore Architecture](../PlatformStore/PlatformStore-Architecture.md)

---

## Overview

ORION production persistence is delivered through **PostgreSQL** behind the **PlatformStore** abstraction. Domain repositories continue to depend only on `PlatformStore.getHcmBacking()` — never on SQL, drivers, or connection pools.

The implementation lives in:

| Layer | Location |
|-------|----------|
| Platform store provider | `lib/platform/store/PostgresPlatformStore.ts` |
| Connection & migrations | `lib/platform/persistence/` |
| HCM entity adapter | `lib/platform/persistence/hcm/` |

**No ORM** is used. The `pg` driver executes parameterized SQL through `DatabaseConnection`.

---

## Architecture

```mermaid
flowchart TB
  subgraph Domain
    Repos[HCM Repositories]
    Services[Business Services]
  end

  subgraph PlatformStore
    PS[PostgresPlatformStore]
    TM[PostgresTransactionManager]
    HCM[Postgres HCM Backing]
  end

  subgraph Persistence
    DC[DatabaseConnection]
    MR[MigrationRunner]
    HP[HcmEntityPersister]
  end

  DB[(PostgreSQL)]

  Services --> Repos
  Repos --> HCM
  PS --> TM
  PS --> HCM
  PS --> DC
  PS --> MR
  HCM --> HP
  HP --> DC
  TM --> DC
  MR --> DC
  DC --> DB
```

### Design principles

1. **PlatformStore remains the single persistence abstraction** for domain wiring.
2. **Repositories unchanged** — they receive `InMemoryHcmStore`-compatible backing maps.
3. **In-memory provider preserved** — development, CI unit tests, and local workflows use `ORION_STORE_ADAPTER=memory`.
4. **Configuration-only switching** — no code changes required to select provider.

---

## Provider Lifecycle

### Construction

`PlatformStoreFactory.createFromEnvironment()` reads:

- `ORION_STORE_ADAPTER` — `memory` | `postgres` | `sqlite`
- `ORION_DATABASE_URL` — PostgreSQL connection string (required for relational providers in production)

### Initialization (`initialize()`)

1. Open connection pool (`PostgresDatabaseConnection`)
2. Ping database
3. Run pending migrations when `ORION_MIGRATION_AUTO_RUN=true` (default)
4. Hydrate HCM backing from `hcm_entities` JSONB table
5. Wire `PostgresTransactionManager`

### Shutdown (`shutdown()`)

1. Flush pending HCM writes
2. Close connection pool gracefully

### Health

`checkHealth()` reports:

| Field | Description |
|-------|-------------|
| Connection status | Pool ping result |
| Migration status | Current vs latest schema version |
| Database version | PostgreSQL `server_version` |
| Provider type | `postgres` |
| Last check | ISO timestamp |

Health is surfaced through `PlatformStoreHealthReport` and the observability `platform_store` check.

---

## Migration Process

### Components

| Component | Role |
|-----------|------|
| `Migration` | Versioned up/down script contract |
| `MigrationRegistry` | Ordered migration set |
| `MigrationRunner` | Apply pending, track history, rollback |

### Version tracking

- `platform_schema_version` — applied migration versions
- `platform_migration_history` — execution audit (success/failure, direction)

### Bootstrap migration (`001_platform_bootstrap`)

Creates:

- Platform migration tables
- `hcm_entities` JSONB store for HCM collections

### Rollback

Enabled when `ORION_MIGRATION_ALLOW_ROLLBACK=true`. Use `MigrationRunner.rollback(steps)` operationally — not invoked automatically on startup.

---

## Configuration

### Required

| Variable | Description |
|----------|-------------|
| `ORION_STORE_ADAPTER` | Store provider (`postgres` for production) |
| `ORION_DATABASE_URL` | PostgreSQL connection URL |

### Connection pool

| Variable | Default | Description |
|----------|---------|-------------|
| `ORION_DB_POOL_MIN` | `1` | Minimum pool connections |
| `ORION_DB_POOL_MAX` | `10` | Maximum pool connections |
| `ORION_DB_CONNECT_TIMEOUT_MS` | `10000` | Connection timeout |
| `ORION_DB_IDLE_TIMEOUT_MS` | `30000` | Idle connection timeout |
| `ORION_DB_QUERY_TIMEOUT_MS` | `30000` | Query timeout |

### Retry

| Variable | Default | Description |
|----------|---------|-------------|
| `ORION_DB_RETRY_ATTEMPTS` | `3` | Transient failure retries |
| `ORION_DB_RETRY_DELAY_MS` | `250` | Base delay between retries |

### Migrations

| Variable | Default | Description |
|----------|---------|-------------|
| `ORION_MIGRATION_AUTO_RUN` | `true` | Run pending migrations on init |
| `ORION_MIGRATION_ALLOW_ROLLBACK` | `true` | Permit rollback operations |

### Production guardrails

- `ORION_STORE_ADAPTER=memory` is **rejected** in production runtime (ADR-007).
- `ORION_DATABASE_URL` is **required** when using `postgres` in production.

---

## HCM Persistence Model

HCM entities are stored in `hcm_entities`:

| Column | Purpose |
|--------|---------|
| `collection_name` | Logical map name (e.g. `employees`) |
| `entity_id` | Entity primary key |
| `organization_id` | Tenant scope (when present on payload) |
| `payload` | JSONB entity document |
| `updated_at` | Last mutation timestamp |

`PersistingMap` and `PersistingArray` wrappers write through to this table while preserving existing repository Map/Array usage.

Array collections (e.g. `employmentHistory`) use synthetic key `__array__`.

---

## Operational Guidance

### Staging / production startup

1. Ensure secrets provide `ORION_DATABASE_URL` (ADR-010).
2. Set `ORION_STORE_ADAPTER=postgres`.
3. Confirm migrations auto-run on first deploy (`ORION_MIGRATION_AUTO_RUN=true`).
4. Verify `/health` or observability `platform_store` check reports **healthy**.

### Development

Use in-memory store (default):

```bash
ORION_STORE_ADAPTER=memory
```

For local PostgreSQL testing:

```bash
ORION_STORE_ADAPTER=postgres
ORION_DATABASE_URL=postgresql://orion:orion@localhost:5432/orion_dev
```

### Backup & restore

Use native PostgreSQL backup/PITR per ADR-007 operational implications. Application does not manage backups directly.

### Troubleshooting

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| `degraded` health, pending migrations | Schema behind | Run app init or manual migration |
| `unhealthy` health | DB unreachable | Check URL, network, credentials |
| Init failure | Missing URL | Set `ORION_DATABASE_URL` |

---

## Testing

| Test suite | Coverage |
|------------|----------|
| `PlatformStoreContract.test.ts` | Shared contract (memory + postgres mock) |
| `PostgresPlatformStore.test.ts` | Provider lifecycle |
| `MigrationRunner.test.ts` | Migrations & rollback |
| `PersistenceHealth.test.ts` | Health model |
| `RepositoryCompatibility.test.ts` | HCM wiring compatibility |

Unit tests use `MockDatabaseConnection` — no live PostgreSQL required in default CI.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-01 | P-015.5 initial PostgreSQL persistence implementation |

---

*ORION Platform · docs/Platform/Persistence/*
