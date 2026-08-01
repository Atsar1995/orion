# S1D Deployment Guide

## Overview

ORION deploys as a Next.js 16 application with Node.js 20+. This guide covers production deployment for the Executive Operating System platform.

## Prerequisites

- Node.js 20 LTS or later
- npm 10+
- Production secrets configured (see Environment Configuration Guide)

## Build & Deploy

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

## Production Checklist

1. Set `ORION_SESSION_SECRET` to a cryptographically strong random value
2. Remove or unset `ORION_DEMO_PASSWORD` in production
3. Set `NODE_ENV=production`
4. Configure reverse proxy TLS termination (HTTPS)
5. Verify `/api/health` returns `healthy`
6. Run `npm run audit:production` before release

## Health Verification

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Platform health for load balancers |
| `GET /api/health/readiness` | Release readiness assessment |
| `GET /api/health/metrics` | Web Vitals and performance metrics |

## Release Readiness Dashboard

Super Admins can review readiness at `/engineering/readiness`.

## Rollback

1. Revert to previous deployment artifact
2. Clear session cookies if identity configuration changed
3. Verify `/api/health` status

## Support

See Troubleshooting Guide and Operations Handbook in this directory.
