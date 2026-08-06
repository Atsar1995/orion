# Runbook — Operational Monitoring

**Mission:** P-011.1 · **Category:** Health  
**Related:** [Enterprise Operations Readiness](./Enterprise-Operations-Readiness.md)

---

## Objective

Verify platform health after deploy, recovery, or on continuous monitoring schedule.

## Health Endpoints

| Endpoint | Purpose | Expected |
|----------|---------|----------|
| `GET /api/health` | Liveness | `healthy` or `degraded` |
| `GET /api/health/readiness` | Release readiness | Score ≥ threshold |
| `GET /api/health/operations` | Operational aggregation | All critical checks pass |
| `GET /api/health/security` | Security posture | Fail-closed active |
| `GET /api/health/metrics` | Performance baselines | Within thresholds |

## Registered Health Checks

| Check | Subsystem |
|-------|-----------|
| `environment` | Configuration validation |
| `logging` | Structured logging |
| `errors` | Client error rate |
| `platform_store` | PlatformStore health |
| `hcm_platform` | HCM domain backing |
| `finance_platform` | Finance domain backing |
| `crm_platform` | CRM domain backing |
| `procurement_platform` | Procurement domain backing |
| `platform_security` | RBAC and security catalog |
| `platform_store_live` | Async PostgreSQL probe (staging+) |
| `rbac_fail_closed` | Authorization enforcement |
| `backup_readiness` | Backup policy compliance |
| `disaster_recovery` | DR procedure readiness |

## Continuous Monitoring (Gate 6)

- **72-hour green window** on staging required before Gate 6 sign-off
- Alert on `unhealthy` status or 3+ consecutive `degraded` readings
- Monitor DLQ depth when durable IIL transport enabled (Gate 7)

## Programmatic Verification

```typescript
import { enterpriseReadinessService } from "@/lib/platform/operations";

const health = enterpriseReadinessService.verifyHealth();
const report = await enterpriseReadinessService.generateReadinessReport();
```

## Escalation

| Severity | Condition | Action |
|----------|-----------|--------|
| P0 | `unhealthy` on staging/production | Execute incident response |
| P1 | `degraded` > 15 minutes | Investigate subsystem |
| P2 | Budget/performance warnings | Schedule remediation |

---

*P-011.1 · ORION Enterprise Platform v2.0*
