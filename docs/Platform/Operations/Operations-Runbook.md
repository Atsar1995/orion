# ORION Platform Operations Runbook

**Mission:** P-015.8 — Enterprise Operational Readiness  
**Authority:** Platform Engineering Lead  
**Classification:** Operational · Internal  
**Last Updated:** August 2026

**Related:** [Enterprise Operational Readiness](./Enterprise-Operational-Readiness.md) · [Backup & Recovery Guide](./Backup-Recovery-Guide.md) · [ADR-012](../../11_Governance/ADR/ADR-012-Deployment-Release-Strategy.md)

---

## Quick Reference

| Runbook | ID | Trigger |
|---------|-----|---------|
| [Platform Startup](#platform-startup) | `platform-startup` | Deploy · restart · recovery |
| [Platform Shutdown](#platform-shutdown) | `platform-shutdown` | Maintenance · deploy |
| [Incident Response](#incident-response) | `incident-response` | Outage · degraded health |
| [Migration Execution](#migration-execution) | `migration-execution` | Schema change |
| [Release Deployment](#release-deployment) | `release-deployment` | RC → staging → production |
| [Emergency Rollback](#emergency-rollback) | `emergency-rollback` | Failed deploy |
| [Health Verification](#health-verification) | `health-verification` | Post-deploy · post-recovery |

Programmatic registry: `runbookRegistry` in `lib/platform/operations/RunbookRegistry.ts`

---

## Platform Startup

**Runbook ID:** `platform-startup`

### Prerequisites

- PostgreSQL instance available (staging/production)
- Environment variables configured (see Enterprise-Operational-Readiness.md)
- Database backup verified if recovering from incident

### Steps

1. **Verify environment**
   ```bash
   npm run typecheck
   ```
   Confirm `DATABASE_URL` and `ORION_STORE_PROVIDER=postgresql` are set.

2. **Initialize platform store**
   - PlatformStore initializes on first server request via `ensureDefaultPlatformStoreInitialized()`
   - Migrations run automatically during initialization

3. **Start application**
   ```bash
   npm run build
   npm run start
   ```

4. **Verify health**
   ```bash
   curl -s http://localhost:3000/api/health | jq .
   curl -s http://localhost:3000/api/health/operations | jq .
   ```

5. **Confirm checks**
   - `environment` → healthy
   - `platform_store_live` → healthy
   - `rbac_fail_closed` → healthy (production)
   - `platform_security` → healthy

### Rollback

If startup fails, execute [Emergency Rollback](#emergency-rollback).

---

## Platform Shutdown

**Runbook ID:** `platform-shutdown`

### Steps

1. Drain active connections (remove from load balancer)
2. Wait for in-flight API requests to complete (30s grace period)
3. Stop application process
4. PlatformStore connection pool closes on process exit

### Notes

- No explicit `shutdown()` call required for graceful Next.js stop in current architecture
- For forced shutdown, PostgreSQL connections are released by pool timeout

---

## Incident Response

**Runbook ID:** `incident-response`

### Severity Classification

| Level | Condition | Response Time |
|-------|-----------|---------------|
| **SEV-1** | `/api/health` returns 503 | Immediate |
| **SEV-2** | Status `degraded` on operations endpoint | 30 minutes |
| **SEV-3** | Single subsystem degraded | Next business day |

### Steps

1. **Assess** — `GET /api/health/operations`
2. **Identify** — review failing check names in response
3. **Mitigate** — execute targeted runbook:
   - `platform_store_live` unhealthy → [Database Recovery](./Backup-Recovery-Guide.md#database-recovery)
   - `rbac_fail_closed` degraded → verify `ORION_FAIL_CLOSED` env
   - `deployment_readiness` degraded → verify CI artifacts
4. **Communicate** — notify Program Director and CEA for SEV-1
5. **Review** — post-incident review within 48 hours

---

## Migration Execution

**Runbook ID:** `migration-execution`

### Steps

1. **Pre-migration backup**
   ```typescript
   backupService.createBackup({ provider: "postgresql", tables: ["platform_migrations", "..."] });
   ```

2. **Review pending migrations**
   - Check `platform_store_live` health check for migration status

3. **Apply migrations**
   - Restart application or trigger PlatformStore re-initialization

4. **Verify**
   - `migration_execution` staging check → healthy
   - Execute [Health Verification](#health-verification)

### Rollback

If migration fails, execute [Database Recovery](./Backup-Recovery-Guide.md#database-recovery) or migration rollback procedure via `DisasterRecoveryService.getProcedure("migration_rollback")`.

---

## Release Deployment

**Runbook ID:** `release-deployment`

### Pre-deploy Checklist

- [ ] `npm run typecheck` — pass
- [ ] `npm run lint` — 0 errors
- [ ] `npm test` — full suite green
- [ ] `npm run build` — pass
- [ ] Release branch CI green (when DEP-002 resolved)

### Steps

1. Build production artifact: `npm run build`
2. Deploy to staging environment
3. Run staging validation: `operationalReadinessService.validateStaging()`
4. Execute [Health Verification](#health-verification)
5. Monitor `/api/health/operations` for 15 minutes
6. Promote to production (Gate 7 approval required for GA)

---

## Emergency Rollback

**Runbook ID:** `emergency-rollback`

### Steps

1. Identify last known-good release tag (e.g., `v1.0.1-rc1`)
2. Deploy previous artifact to affected environment
3. Verify database migration compatibility (no forward-only breaking migrations)
4. Execute [Health Verification](#health-verification)
5. Notify stakeholders

### Recovery procedure reference

`DisasterRecoveryService.getProcedure("release_rollback")`

---

## Health Verification

**Runbook ID:** `health-verification`

### Steps

1. **Liveness**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health
   ```
   Expected: `200` (or `503` if unhealthy — investigate)

2. **Operational readiness**
   ```bash
   curl -s http://localhost:3000/api/health/operations | jq '.data.readiness.scores'
   ```

3. **Required checks (all environments)**
   - `environment` → healthy
   - `platform_store` → healthy or degraded (in-memory dev)
   - `platform_security` → healthy

4. **Staging/production additional checks**
   - `platform_store_live` → healthy
   - `rbac_fail_closed` → healthy
   - `backup_readiness` → healthy or degraded (initial deploy)

5. **Metrics review**
   ```bash
   curl -s http://localhost:3000/api/health/metrics | jq .
   ```

---

## Monitoring & Alerting Thresholds

Per ADR-011 · configured in `DEFAULT_ALERT_THRESHOLDS`:

| Signal | Degraded | Unhealthy |
|--------|----------|-----------|
| Recent client errors | ≥ 3 | ≥ 10 |
| IIL queue depth | ≥ 25 | ≥ 100 |
| DB pool utilization | ≥ 80% | ≥ 95% |

---

*Maintained under P-015.8 · Update when operational procedures change*
