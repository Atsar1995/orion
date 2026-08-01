# S1D Production Checklist

## Pre-Deploy

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] `npm run audit:production` passes
- [ ] `ORION_SESSION_SECRET` set (production)
- [ ] Demo credentials disabled (production)
- [ ] TLS configured at reverse proxy

## Post-Deploy

- [ ] `GET /api/health` returns `healthy`
- [ ] Sign-in flow works (`/login` → `/brief`)
- [ ] RBAC redirects unauthorized users correctly
- [ ] Release Readiness Dashboard reviewed (`/engineering/readiness`)
- [ ] Web Vitals baseline captured

## Accessibility (WCAG 2.2 AA targets)

- [ ] Skip to content link functional
- [ ] Keyboard navigation (⌘K palette, Brief shortcuts)
- [ ] Focus rings visible on interactive elements
- [ ] ARIA labels on header, alerts, loading states
- [ ] Color contrast meets design system tokens

## Security

- [ ] Security headers present (X-Frame-Options, CSP, etc.)
- [ ] Auth API input validation active
- [ ] No secrets in client bundle
- [ ] Engineering routes restricted to Super Admin

## Observability

- [ ] Structured logging active
- [ ] Error boundaries report to observability store
- [ ] Health endpoints accessible to monitoring

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Engineering | | | |
| CTO | | | |
