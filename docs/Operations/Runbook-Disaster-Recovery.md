# Runbook — Disaster Recovery

**Mission:** P-011.1 · **Category:** Database / Incident  
**Related:** [Backup & Recovery Guide](../Platform/Operations/Backup-Recovery-Guide.md)

---

## Objective

Restore ORION platform from verified backup within defined RTO/RPO targets.

## Policy

| Metric | Target |
|--------|--------|
| RPO | 24 hours |
| RTO | 60 minutes |
| Retention | 30 days |

## Procedure

1. **Assess incident scope**
   - `GET /api/health/operations` — identify failed subsystem
   - Review operational diagnostics and structured logs

2. **Validate latest backup**
   ```typescript
   import { backupService } from "@/lib/platform/operations";
   const readiness = backupService.assessBackupReadiness();
   ```

3. **Stop write traffic**
   - Execute [Platform Shutdown](./Runbook-Platform-Shutdown.md)
   - Confirm no active transactions

4. **Restore database**
   - Restore PostgreSQL from verified backup artifact
   - Follow provider-specific restore procedure

5. **Reinitialize PlatformStore**
   - Run migrations via `PlatformStore.initialize()`
   - Verify migration version matches registry

6. **Execute recovery drill validation**
   ```typescript
   import { disasterRecoveryService } from "@/lib/platform/operations";
   const result = disasterRecoveryService.validateRecoveryReadiness();
   ```

7. **Verify health**
   - Execute [Operational Monitoring](./Runbook-Operational-Monitoring.md) runbook

## Post-Recovery

- Document incident timeline and root cause
- Schedule post-incident review within 5 business days
- Update OPS-001 evidence if staging environment affected

---

*P-011.1 · ORION Enterprise Platform v2.0*
