# Runbook — Platform Startup

**Mission:** P-011.1 · **Category:** Startup  
**Related:** [Enterprise Operations Readiness](./Enterprise-Operations-Readiness.md)

---

## Objective

Start the ORION platform with validated persistence, migrations, and health checks.

## Prerequisites

- `DATABASE_URL` configured (staging/production)
- `ORION_STORE_PROVIDER=postgresql` (staging/production)
- Migration readiness flag set

## Procedure

1. **Verify environment variables**
   - `DATABASE_URL` — PostgreSQL connection string
   - `ORION_STORE_PROVIDER` — `postgresql` for staging/production
   - `NODE_ENV` — `staging` or `production`

2. **Initialize PlatformStore**
   ```typescript
   import { verifyPlatformStartup } from "@/lib/platform/store/PlatformStoreFactory";
   const result = await verifyPlatformStartup();
   ```

3. **Run database migrations**
   - Migrations execute automatically via `PlatformStore.initialize()` when `migration.autoRun` is enabled

4. **Start application process**
   ```bash
   npm run build && npm start
   ```

5. **Verify health endpoints**
   - `GET /api/health` — liveness (expect `healthy` or `degraded`)
   - `GET /api/health/readiness` — readiness assessment
   - `GET /api/health/operations` — operational aggregation

## Success Criteria

- `verifyPlatformStartup()` returns `healthy` or `degraded`
- `platform_store` and `platform_security` checks pass
- All Gate 5 domain checks (`hcm_platform`, `finance_platform`, `crm_platform`, `procurement_platform`) registered

## Rollback

If startup fails, do not route traffic. Review health check messages and execute [Platform Shutdown](./Runbook-Platform-Shutdown.md) before retry.

---

*P-011.1 · ORION Enterprise Platform v2.0*
