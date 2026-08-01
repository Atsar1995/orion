# S1D Troubleshooting Guide

## Authentication

### Cannot sign in

1. Verify demo credentials: `founder@orion.dev` / `orion-dev` (alpha)
2. Check `ORION_DEMO_PASSWORD` if overridden
3. Review login API validation errors in server logs

### Redirect loop on login

1. Clear `orion_session` cookie
2. Verify `ORION_SESSION_SECRET` is consistent across instances
3. Check middleware logs for RBAC failures

## Dashboard & Brief

### Morning Brief unavailable

1. Check CRM and finance provider registration
2. Review `[ORION:data]` log entries
3. Verify Intelligence Bus providers in `lib/intelligence/register-executive-providers.ts`

### Dashboard shows empty state

1. Confirm orchestrator pipeline runs (`getDashboardSnapshot`)
2. Check `/api/health/readiness` for degraded scores

## Performance

### Slow initial load

1. Review Web Vitals at `/api/health/metrics`
2. Confirm font `display: swap` is active
3. Command palette uses dynamic import — verify no SSR errors

### High CLS

1. Check loading skeletons match final layout
2. Review Brief status banner and header sticky positioning

## Offline

- Offline banner appears when `navigator.onLine` is false
- Cached brief may show stale lifecycle state

## Health Endpoints

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/readiness
curl http://localhost:3000/api/health/metrics
```

## Error Recovery

- Platform routes: use **Retry** on error boundary
- Global errors: navigate to `/brief` or sign in again
- Clear browser cache if stale client bundle suspected

## Escalation

Review Release Readiness Dashboard and Production Checklist before CTO sign-off.
