# WP-A002 Phase 2B.1 — Live PostgreSQL RLS Certification

## Status

**CERTIFIED — PASS**

WP-A002 Phase 2B.1 persistence/RLS certification has been completed against a live PostgreSQL 16 instance.

## Environment

- PostgreSQL 16 running in Docker container `orion-pg-test`
- Privileged database connection: `orion`
- Restricted application database connection: `aurora_app`
- `aurora_app` verified as `NOBYPASSRLS`
- `aurora_app` verified as non-superuser and non-privileged for role/database administration
- Live test gate: `AURORA_LIVE_POSTGRES=1`
- Tenant database scope uses `SET LOCAL app.tenant_id`

No database credentials or passwords are recorded in this document.

## Migration Verification

The following Aurora migrations are present in the live test database:

1. `001_aurora_admin_tables`
2. `002_aurora_business_entity`
3. `003_aurora_config_tables`
4. `005_aurora_rls_policies`

Migration version `004` remains intentionally reserved for the deferred secrets migration.

## RLS Verification

RLS is enabled and forced on:

- `aurora_business_entity`
- `aurora_brand`
- `aurora_schedule`
- `aurora_workspace_config`

The live security suite passed all 11 tests:

**11/11 PASS**

Verified protections include:

- Cross-tenant business reads
- Cross-tenant brand reads
- Cross-tenant business writes
- Cross-tenant brand writes
- Cross-tenant workspace configuration access
- Cross-tenant schedule manipulation
- Cross-tenant brand/business attachment protection
- RLS enforcement when application tenant assertions are bypassed
- `SET LOCAL` tenant-context isolation after transaction commit
- Live PostgreSQL availability/configuration

The restricted `aurora_app` role was verified with:

- `rolsuper = false`
- `rolbypassrls = false`
- `rolcreatedb = false`
- `rolcreaterole = false`

## Regression Verification

Aurora regression suite:

- Test files: **28/28 passed**
- Tests: **129/129 passed**
- Live PostgreSQL RLS tests included: **11/11 passed**

Additional gates:

- TypeScript typecheck: **PASS**
- Aurora ESLint: **PASS**
- Production build: **PASS**

## Phase 2B.1 Implementation

The Phase 2B.1 implementation provides a dual-connection PostgreSQL test harness:

- Privileged connection for migrations, seed and system-scope operations
- Restricted `aurora_app` connection for tenant-scoped RLS verification

Production wiring remains unchanged for this slice.

The operator setup documentation and restricted PostgreSQL role SQL are included under:

`docs/AURORA/operator/`

## Certification Conclusion

**WP-A002 Phase 2B.1 LIVE POSTGRESQL RLS CERTIFICATION: PASS**

The PostgreSQL RLS security boundary has been verified against a live PostgreSQL 16 instance using a restricted application role with `NOBYPASSRLS`.

The Phase 2B.1 implementation is ready to be committed.

## Follow-up

Before using the local database environment for any shared or production-like purpose, rotate the temporary database credentials used during development.

The repository must not contain database passwords or connection credentials.
