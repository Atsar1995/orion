# Security Risk Register — P-015.10

**Register ID:** SRR-015.10-001  
**Mission:** P-015.10 — Enterprise Security & Compliance Certification  
**Last Updated:** 23 August 2026  
**Authority:** Security Architect

**Canonical Debt Register:** [docs/11_Governance/TECHNICAL_DEBT.md](../../11_Governance/TECHNICAL_DEBT.md)

---

## Summary

| Severity | Open | Accepted | Mitigated |
|----------|------|----------|-----------|
| **Critical** | 0 | 0 | 0 |
| **High** | 0 | 0 | 1 |
| **Medium** | 1 | 2 | 0 |
| **Low** | 0 | 1 | 0 |

---

## Open Findings

### DEP-F001 — Release Branch CI Not Extended

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | Open |
| **Domain** | Deployment |
| **ADR** | ADR-012 |
| **Description** | CI quality gate runs on `main` only, not `release/v1.0.1`. |
| **Recommendation** | Extend `.github/workflows/quality-gate.yml` to release branch (DEP-002). |
| **Owner** | Engineering Lead |
| **Target** | Wave 4 tail |

---

## Accepted Findings

### SEC-F001 — Development Session Secret Fallback

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Status** | Accepted |
| **Description** | `ORION_SESSION_SECRET` not set in development — dev fallback used. |
| **Mitigation** | `validateEnvironment()` rejects default secret in production. |
| **Target** | Set secret before staging |

### SEC-F002 — Cloud Secret Manager Not Integrated

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Status** | Accepted |
| **Description** | ADR-010 secret manager adapter deferred post-GA. |
| **Mitigation** | Environment-first secrets pattern active for GA. |
| **Target** | Post-GA |

---

## Mitigated Findings

### SEC-002 / TD-PLATFORM-002 — API Fail-Open (Resolved Wave 1)

| Field | Value |
|-------|-------|
| **Severity** | Critical (was) |
| **Status** | Mitigated |
| **Resolution** | P-015.6 RBAC · fail-closed HCM API context |
| **Evidence** | AuthorizationAudit AUTHZ-002 pass |

---

## Post-GA Roadmap (Not Risks)

| Item | Notes |
|------|-------|
| OAuth2 / OIDC | ADR-008 strategy · post-GA |
| SSO | Out of GA scope |
| MFA | Out of GA scope |
| Cloud IAM | ADR-010 adapter post-GA |

---

## Risk Escalation

| Condition | Action |
|-----------|--------|
| Critical finding open | NO-GO — block GA |
| High finding open | CONDITIONAL GO — 30-day remediation |
| Medium finding open | Track in debt register |
| Staging fail-closed fails | Escalate to Security Architect |

---

*Maintained under P-015.10 · Sync with TECHNICAL_DEBT.md on closure*
