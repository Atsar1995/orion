# S1D Operations Handbook

## Daily Operations

### Health Monitoring

Poll `GET /api/health` every 60 seconds from your load balancer or monitoring system.

| Status | Action |
|--------|--------|
| `healthy` | No action |
| `degraded` | Review recent errors via observability logs |
| `unhealthy` | Investigate environment validation failures |

### Session Management

- Sessions expire after 8 hours (configured in Identity Service)
- Logout via profile menu or `POST /api/auth/logout`
- Audit events recorded in-memory (persistence pending)

## Incident Response

1. Check `/api/health` and `/api/health/readiness`
2. Review application logs for `[ORION:service]` and `[ORION:exception]` entries
3. Verify environment variables per Environment Configuration Guide
4. Roll back deployment if regression confirmed

## Performance Monitoring

Web Vitals are collected client-side and reported to `/api/health/metrics`:

- **FCP** — First Contentful Paint (target < 1.8s)
- **LCP** — Largest Contentful Paint (target < 2.5s)
- **CLS** — Cumulative Layout Shift (target < 0.1)
- **TTFB** — Time to First Byte

## Security Operations

- Security headers applied via middleware and `next.config.ts`
- RBAC enforced on all platform routes except public auth and health endpoints
- Run `npm run audit:production` weekly

## Backup & Recovery

Current alpha uses in-memory repositories (CRM, identity). Full persistence backup procedures will be documented when database backing ships.

## Contacts

Platform ownership: ORION Engineering (Super Admin workspace)
