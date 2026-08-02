# Security Hardening Guide

**Mission:** P-015.10 — Enterprise Security & Compliance Certification  
**Audience:** Platform Engineering · Security · DevOps  
**Last Updated:** August 2026

**Related:** [Enterprise Security Certification](./Enterprise-Security-Certification.md) · [Enterprise Identity & RBAC](./Enterprise-Identity-RBAC.md)

---

## Pre-Deployment Hardening Checklist

- [ ] Set `ORION_SESSION_SECRET` to strong random value (≥ 32 bytes)
- [ ] Set `ORION_AUTH_FAIL_CLOSED=true` in staging/production
- [ ] Configure `DATABASE_URL` / `ORION_DATABASE_URL` via secrets injection
- [ ] Remove `ORION_DEMO_PASSWORD` from production
- [ ] Set `ORION_LOG_FORMAT=json` in production
- [ ] Verify `npm test` including security compliance tests pass
- [ ] Run `securityCertification.certify()` — verdict not NO-GO

---

## Environment Variables

| Variable | Production | Purpose |
|----------|------------|---------|
| `ORION_SESSION_SECRET` | **Required** | HMAC session signing |
| `ORION_AUTH_FAIL_CLOSED` | `true` | Reject unauthenticated API access |
| `ORION_DATABASE_URL` | **Required** | PostgreSQL credentials |
| `ORION_STORE_ADAPTER` | `postgres` | Persistent store |
| `ORION_LOG_FORMAT` | `json` | Structured audit-friendly logs |
| `ORION_DEMO_PASSWORD` | **Must not be set** | Demo access disabled |

---

## Authentication Hardening

| Control | Implementation |
|---------|----------------|
| Session tokens | HMAC-signed via `session-token.ts` |
| Fail-closed | `createAuthenticationContext()` + HCM API context |
| No default context | `getHcmApiContext(request)` required on all HCM routes |
| Production enforcement | `NODE_ENV=production` enables fail-closed by default |

**Verify:**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/hcm/employees
# Expected: 401 (unauthenticated)
```

---

## Authorization Hardening

| Control | Implementation |
|---------|----------------|
| Default deny | Unknown permissions rejected |
| Organization isolation | Cross-org denied except super_admin (audited) |
| Route permissions | `hcm-permission-catalog.ts` maps routes → permissions |
| Least privilege | Role registry grants minimum permissions |

**Do not:** Bypass `AuthorizationService` or disable audit hooks.

---

## Secrets Hardening

| Rule | Status |
|------|--------|
| No hard-coded production secrets | ✅ Enforced |
| Secrets from environment only | ✅ ADR-010 |
| Weak default rejected in production | ✅ validateEnvironment |
| Cloud secret manager | 📋 Post-GA |

---

## PlatformStore & Database

| Control | Implementation |
|---------|----------------|
| `pg` server-externalized | `next.config.ts` serverExternalPackages |
| Lazy PostgreSQL load | PlatformStoreFactory require() |
| Parameterized queries | DatabaseConnection interface |
| Connection from env | StoreConfiguration.loadStoreConfiguration() |

---

## Audit & Logging

| Control | Implementation |
|---------|----------------|
| Authorization denials | `securityAuthorizationAuditHook` |
| Structured logging | `ORION_LOG_FORMAT=json` |
| Correlation IDs | `PlatformDiagnostics` / `PlatformLogger` |
| Health endpoints | No secret values exposed |

---

## Deployment Hardening

1. Build immutable artifact: `npm run build`
2. Inject secrets at runtime (not in image)
3. Deploy to staging first
4. Verify `/api/health/security` returns verdict ≠ NO-GO
5. Execute fail-closed smoke test on HCM APIs
6. Monitor audit logs for denial patterns

---

## Prohibited Actions

- ❌ Implement OAuth/OIDC/SSO/MFA under P-015.10 scope
- ❌ Disable fail-closed for performance
- ❌ Hard-code credentials in source
- ❌ Bypass organization isolation
- ❌ Remove authorization audit hooks
- ❌ Expose secrets in health endpoints

---

*Maintained under P-015.10 · Hardening only — no new features*
