# WP-A002 Phase 2B — Restricted Postgres Role Readiness

Dual-connection live RLS certification uses two PostgreSQL roles:

| Role | Connection env var | Purpose |
|------|-------------------|---------|
| `orion` (privileged) | `ORION_DATABASE_URL` | Migrations, system seed/cleanup, `AuroraSystemDbScope` |
| `aurora_app` (restricted) | `AURORA_APP_DATABASE_URL` | Tenant repositories, `AuroraTenantDbScope`, RLS assertions |

## Operator setup

1. Ensure migrations `001`, `002`, `003`, and `005` are applied on the target database.
2. Run the operator SQL script as `orion` (or another superuser):

   `docs/AURORA/operator/create-aurora-app-role.sql`

   Replace `<database_name>` and `<aurora_app_password>` before execution. **Do not commit credentials.**

3. Set session environment variables for live RLS tests:

   ```powershell
   $env:AURORA_LIVE_POSTGRES = "1"
   $env:ORION_DATABASE_URL = "postgresql://orion:<password>@localhost:5432/orion_staging"
   $env:AURORA_APP_DATABASE_URL = "postgresql://aurora_app:<password>@localhost:5432/orion_staging"
   ```

4. Run the live RLS suite:

   ```powershell
   npx vitest run tests/aurora/integration/security/postgresRls.test.ts
   ```

## `aurora_app` minimum privileges

- `CONNECT` on database; `USAGE` on `public`
- `SELECT` on `aurora_tenant` (FK checks)
- `SELECT`, `INSERT`, `UPDATE`, `DELETE` on:
  - `aurora_business_entity`
  - `aurora_brand`
  - `aurora_workspace_config`
  - `aurora_schedule`
- `EXECUTE` on `aurora_current_tenant_id()` and `aurora_enforce_brand_business_tenant_match()`
- **No** access to `aurora_schema_version` or `aurora_migration_history`
- **No** `SUPERUSER` or `BYPASSRLS`

## Verification queries (read-only)

```sql
SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname IN ('orion', 'aurora_app');

SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class
WHERE relname IN (
  'aurora_business_entity',
  'aurora_brand',
  'aurora_schedule',
  'aurora_workspace_config'
);
```

Expected for certification:

- `aurora_app`: `rolsuper = false`, `rolbypassrls = false`
- All four tables: `relrowsecurity = true`, `relforcerowsecurity = true`
