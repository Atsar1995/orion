# Runbook — Production Deployment

**Mission:** P-011.1 · **Category:** Deployment  
**Related:** [Enterprise Operations Readiness](./Enterprise-Operations-Readiness.md)

---

## Objective

Deploy a release candidate to staging or production with validated rollback capability.

## Prerequisites

- CI quality gate passed on release branch
- Staging GA-001 evidence current (OPS-001)
- Rollback artifact identified

## Procedure

1. **Verify CI quality gate**
   ```typescript
   import { deploymentHealth } from "@/lib/platform/operations";
   const report = deploymentHealth.assess();
   ```

2. **Build production artifact**
   ```bash
   npm run build
   ```

3. **Deploy to target environment**
   - Staging first (mandatory before production)
   - Record deployment correlation ID

4. **Run staging smoke tests**
   - Enterprise test suite: `npm test`
   - Health verification runbook

5. **Monitor health endpoints (15 minutes)**
   - `/api/health` — continuous liveness
   - `/api/health/operations` — operational aggregation
   - Confirm all domain platform checks green

## Rollback

If health degrades during monitoring window:

1. Deploy previous known-good release tag
2. Verify database migration compatibility
3. Execute [Operational Monitoring](./Runbook-Operational-Monitoring.md)
4. Notify stakeholders

## Gate 7 Evidence

- Deployment rollback drill on staging (required before GA)
- Blue/Green path validation (Gate 7 target)

---

*P-011.1 · ORION Enterprise Platform v2.0*
