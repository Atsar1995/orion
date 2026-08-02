# ADR-010 — Configuration & Secrets Management

**Identifier:** ADR-010  
**Mission:** P-015.3 — Production Architecture Decision Records  
**Status:** Accepted  
**Date:** 2026-08-01  
**Authors:** Chief Enterprise Architect  
**Reviewers:** Architecture Review Board · Platform Engineering Lead · Security Architect  
**Version:** 1.0

**Related:** [ADR-007 Persistence](./ADR-007-Production-Persistence-Strategy.md) · [ADR-008 Identity](./ADR-008-Enterprise-Identity-Authentication-Strategy.md)

---

## Problem Statement

ORION configuration and secrets are loaded from **environment variables** with basic validation (`validateEnvironment()`). There is no documented hierarchy for multi-environment deployment, no secrets rotation procedure, and no cloud secret manager integration pattern.

Production GA requires predictable configuration management and secure handling of session secrets, database credentials, and future API keys.

---

## Context

- Current: `ORION_SESSION_SECRET` · `ORION_DEMO_PASSWORD` · `NODE_ENV` validated in [lib/config/env.ts](../../../lib/config/env.ts).
- [P-015.1](../../00_Governance/P-015.1-Enterprise-Production-Readiness-Assessment.md): INF-006 secrets management gap · High priority Wave 2.
- GA requires documented pattern; full secret manager integration may complete in Wave 2 (P-015.8).

---

## Decision

ORION adopts a **hierarchical configuration model** with **environment-first secrets** for GA, and a **secret manager adapter interface** for cloud production.

### Configuration Hierarchy (lowest → highest precedence)

| Layer | Source | Example |
|-------|--------|---------|
| 1 | Defaults (non-secret) | Built-in dev defaults — never secrets |
| 2 | `.env.local` / `.env` | Developer machine — gitignored |
| 3 | Environment variables | Container/K8s env injection |
| 4 | Secret manager (production) | AWS Secrets Manager · Azure Key Vault · GCP Secret Manager |
| 5 | Runtime overrides | Feature flags — non-secret only |

**Rule:** Secrets **never** committed to git · never in client bundles · never logged.

### Secrets (v1.0.x GA minimum)

| Secret | Purpose | GA Requirement |
|--------|---------|----------------|
| `ORION_SESSION_SECRET` | Session signing | Required in production |
| `ORION_DATABASE_URL` | PostgreSQL connection (ADR-007) | Required in staging/production |
| API keys (future) | Integrations | Not GA — interface only |
| TLS certificates | Termination | Infrastructure layer · documented in deploy runbook |

### Configuration (non-secret)

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | development · test · production |
| `ORION_STORE_ADAPTER` | `postgres` \| `memory` — **memory blocked in production** |
| `ORION_LOG_LEVEL` | info · debug · warn |
| `ORION_ENV_NAME` | dev · staging · production |

### Secret Manager Adapter (Wave 2 implementation)

```typescript
interface SecretProvider {
  getSecret(key: string): Promise<string>;
}
```

- **LocalSecretProvider** — env vars (GA)
- **ManagedSecretProvider** — cloud API (post-GA hardening · Wave 2 P-015.8)

### Certificates

- TLS termination at load balancer or ingress — not in application code for GA.
- Internal mTLS between services — **deferred**; document as future Zero Trust item.

### Cloud Readiness

- 12-factor compliant: config in environment.
- Container images immutable; secrets injected at runtime.
- No cloud vendor lock-in for GA — adapter pattern for secret backends.

---

## Alternatives Considered

| Alternative | Pros | Cons | Reason Not Selected |
|-------------|------|------|---------------------|
| **Env + secret adapter (selected)** | Simple GA · cloud path | Manual rotation initially | **GA pragmatic** |
| **Vault-only from day one** | Enterprise grade | Ops burden for GA timeline | Wave 2 optional |
| **Config files in repo** | Easy dev | Secret leakage risk | Rejected |
| **Hardcoded secrets** | — | Security failure | Prohibited |

---

## Consequences

### Positive

- Clear secret inventory for security review (Wave 4).
- PostgreSQL credentials managed consistently with session secret.
- Cloud migration path without application rewrite.

### Negative

- Rotation procedures manual until ManagedSecretProvider ships.
- Developers must maintain `.env.example` documentation.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Secret in git commit | Low | Critical | Pre-commit · `.gitignore` · review |
| Stale `.env.example` | Medium | Low | Doc test · P-015.7 |
| DB URL misconfiguration | Medium | High | Startup validation · fail fast |
| Rotation downtime | Low | Medium | Dual-secret rotation procedure in runbook |

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| ADR-007 | Requires | DATABASE_URL |
| ADR-008 | Requires | SESSION_SECRET |
| P-015.8 | Mission | ManagedSecretProvider optional |

---

## Implementation Guidance

1. Extend `validateEnvironment()` for `ORION_DATABASE_URL` in production/staging.
2. Reject `ORION_STORE_ADAPTER=memory` when `NODE_ENV=production`.
3. Publish `.env.example` with all required keys documented.
4. Add startup check: missing secrets → process exit with clear error.
5. Wave 2: implement `ManagedSecretProvider` for chosen cloud.

---

## Future Review Criteria

- First cloud production deployment selected (AWS/Azure/GCP).
- Compliance requirement for HSM or Vault.
- Multi-tenant secret isolation.
- Certificate auto-renewal automation.

**Next review:** Wave 2 exit (P-015.8) or annual security review.

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-08-01 | Chief Enterprise Architect | Accepted — P-015.3 |

---

*ORION Architecture Decision Record · ADR-010 · docs/11_Governance/ADR/*
