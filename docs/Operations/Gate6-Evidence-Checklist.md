# Gate 6 Evidence Checklist

**Mission:** P-011.3 — Gate 6 Operational Validation  
**Governance:** [P-017.1 §15](../00_Governance/P-017.1-Gate6-Master-Integration-Plan.md)  
**Purpose:** Track operational evidence required for Gate 6 sign-off and Gate 7 authorization

---

## Evidence Collection Matrix

| # | Evidence Item | Dimension | Automated (CI) | Staging (OPS-001) | Owner | Status |
|---|---------------|-----------|----------------|-------------------|-------|--------|
| 1 | Platform startup verification | Platform | ✅ | ⏳ Replay | Platform Engineering | ✅ Engineering |
| 2 | Platform shutdown verification | Platform | ✅ | ⏳ Replay | Platform Engineering | ✅ Engineering |
| 3 | PostgreSQL cold boot | PostgreSQL | ✅ | ⏳ Replay | Platform Engineering | ✅ Engineering |
| 4 | Warm restart with hydration survival | Recovery | ✅ | ⏳ Replay | Platform Engineering | ✅ Engineering |
| 5 | Multiple restart cycles (3×) | PostgreSQL | ✅ | ⏳ Replay | Platform Engineering | ✅ Engineering |
| 6 | Transaction rollback recovery | Recovery | ✅ | ⏳ Replay | Platform Engineering | ✅ Engineering |
| 7 | Organization isolation | PostgreSQL | ✅ | ⏳ Cross-tenant suite | Platform Engineering | ✅ Engineering |
| 8 | PlatformStore lifecycle | PlatformStore | ✅ | ⏳ Replay | Platform Engineering | ✅ Engineering |
| 9 | Composition root restoration | Composition Roots | ✅ | ⏳ Deploy verification | Platform Engineering | ✅ Engineering |
| 10 | Domain hydration (HCM · Finance · CRM · Procurement) | Domains | ✅ | ⏳ Replay | Platform Engineering | ✅ Engineering |
| 11 | Canonical event infrastructure | Canonical Events | ✅ | ⏳ Replay | Platform Engineering | ✅ Engineering |
| 12 | Health monitoring aggregation | Health | ✅ | ⏳ 72h window | Platform Ops | ⏳ OPS-002 |
| 13 | Security verification | Security | ✅ | ⏳ Staging scan | Security | ✅ Engineering |
| 14 | RBAC fail-closed enforcement | RBAC | ✅ | ⏳ Staging audit | Security | ✅ Engineering |
| 15 | REST health endpoints | REST | ✅ | ⏳ Staging probe | Platform Ops | ✅ Engineering |
| 16 | Persistence / migration readiness | Persistence | ✅ | ⏳ Live migrations | Platform Engineering | ✅ Engineering |
| 17 | Operational runbook registry | Operations | ✅ | ⏳ Ops review | Platform Ops | ✅ Engineering |
| 18 | Backup / DR metadata | Operations | ✅ | ⏳ DR drill | Platform Ops | ⏳ OPS-004 |
| 19 | Monitoring aggregation | Monitoring | ✅ | ⏳ 72h window | Platform Ops | ⏳ OPS-002 |
| 20 | Overall readiness report | Overall | ✅ | ⏳ Staging replay | Platform Ops | ⏳ Conditional |
| 21 | Gate 6 validation report | Overall | ✅ | ⏳ Live replay | Platform Ops | ⏳ Conditional |
| 22 | Live staging GA-001 | PostgreSQL | — | ⏳ Required | Platform Ops | ⏳ **OPS-001** |

---

## Validation Execution

### Automated (CI)

```bash
npx vitest run tests/lib/platform/operations/Gate6OperationalValidation.test.ts
npx vitest run tests/lib/platform/operations/
```

### Staging Replay (OPS-001)

1. Configure staging with live PostgreSQL (`NODE_ENV=staging`)
2. Execute `enterpriseReadinessService.executeGate6Validation(context)`
3. Archive report output to this checklist
4. Confirm verdict transitions from `conditional_pass` to `pass`

---

## Blocker Tracking

| ID | Severity | Description | Gate Target | Status |
|----|----------|-------------|-------------|--------|
| OPS-001 | P0 | Live staging PostgreSQL GA-001 evidence | Gate 6 | ⏳ Open |
| ENT-R-003 | P0 | Production PostgreSQL promotion evidence | Gate 6 | ⏳ Open |
| OPS-002 | P1 | 72h continuous health green | Gate 6 | ⏳ Open |
| OPS-003 | P1 | Performance baselines | Gate 7 | ⏳ Open |
| OPS-004 | P1 | DR drill with RTO/RPO | Gate 7 | ⏳ Open |

---

## Artifact Locations

| Artifact | Path |
|----------|------|
| Validation report | [Gate6-Operational-Validation-Report.md](./Gate6-Operational-Validation-Report.md) |
| Signoff report | [Gate6-Signoff-Report.md](./Gate6-Signoff-Report.md) |
| Enterprise readiness baseline | [Enterprise-Operations-Readiness.md](./Enterprise-Operations-Readiness.md) |
| PostgreSQL certification | [PostgreSQL-Operational-Certification.md](./PostgreSQL-Operational-Certification.md) |
| Test suite | `tests/lib/platform/operations/Gate6OperationalValidation.test.ts` |
| Service orchestrator | `lib/platform/operations/EnterpriseReadinessService.ts` |
| Report types | `lib/platform/operations/OperationalReadinessReport.ts` |

---

## Sign-Off Criteria

| Role | Required Evidence | Current |
|------|-------------------|---------|
| Platform Engineering | All CI scenarios green | ✅ |
| Platform Ops | Live staging replay + 72h health | ⏳ |
| Architecture Review Board | Gate 6 report + blocker review | ⏳ Conditional |
| Executive Sponsor | Gate 7 package readiness | ⏳ Conditional |

---

*Mission P-011.3 · ORION Enterprise Platform v2.0 · August 2026*
