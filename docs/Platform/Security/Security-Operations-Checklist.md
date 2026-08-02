# Security Operations Checklist

**Mission:** P-015.10 — Enterprise Security & Compliance Certification  
**Classification:** Operational · Internal  
**Last Updated:** August 2026

**Related:** [Security Hardening Guide](./Security-Hardening-Guide.md) · [Operations Runbook](../Operations/Operations-Runbook.md)

---

## Daily Operations

- [ ] Review `/api/health/security` verdict
- [ ] Check authorization denial rate in audit logs
- [ ] Confirm no unhealthy security health checks
- [ ] Monitor for unexpected cross-org access attempts

---

## Weekly Operations

- [ ] Run `securityCertification.certify()` in staging
- [ ] Review Security Risk Register open items
- [ ] Verify CI quality gate green on main
- [ ] Check for dependency vulnerability advisories

---

## Pre-Release Operations

- [ ] Full test suite green (including security compliance tests)
- [ ] `ORION_SESSION_SECRET` set in target environment
- [ ] Fail-closed verified on staging HCM APIs
- [ ] Security certification verdict ≠ NO-GO
- [ ] Backup verified before deploy
- [ ] Rollback runbook reviewed

---

## Incident Response (Security)

| Step | Action |
|------|--------|
| 1 | Assess `/api/health/security` scorecard |
| 2 | Identify failing compliance checks |
| 3 | Review audit logs for authorization anomalies |
| 4 | Execute [Incident Response runbook](../Operations/Operations-Runbook.md#incident-response) |
| 5 | If credential compromise suspected — rotate `ORION_SESSION_SECRET` |
| 6 | Post-incident review within 48 hours |

---

## Credential Rotation

| Secret | Procedure |
|--------|-----------|
| `ORION_SESSION_SECRET` | Generate new secret · deploy · invalidate existing sessions |
| `DATABASE_URL` | Rotate DB password · update env · restart platform |
| Demo credentials | Remove `ORION_DEMO_PASSWORD` from production |

---

## Compliance Verification

```typescript
import { securityCertification } from "@/lib/platform/security/compliance";

const report = securityCertification.certify();

// Required for release:
// report.verdict !== "NO-GO"
// report.dashboard.scorecard.criticalFindings === 0
// report.wave4ExitCriteria.every(c => c.met) — staging dependent
```

---

## Escalation Matrix

| Condition | Escalate To | Timeline |
|-----------|-------------|----------|
| Critical finding | CEA + Security Architect | Immediate |
| Fail-closed disabled in prod | Platform Eng Lead | 1 hour |
| Cross-org access granted incorrectly | HCM Lead + Security | 4 hours |
| CI security tests failing | Engineering Lead | 24 hours |

---

*Maintained under P-015.10 · Align with Security Risk Register*
