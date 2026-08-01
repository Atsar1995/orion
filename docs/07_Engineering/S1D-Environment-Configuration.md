# S1D Environment Configuration Guide

## Required Variables

| Variable | Environment | Description |
|----------|-------------|-------------|
| `NODE_ENV` | All | `development`, `test`, or `production` |
| `ORION_SESSION_SECRET` | Production (required) | HMAC secret for session tokens. Minimum 32 random bytes. |

## Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ORION_DEMO_PASSWORD` | `orion-dev` | Demo user password for alpha. **Do not set in production.** |

## Validation

Environment validation runs at health check via `lib/config/env.ts`:

- **Production errors:** Missing `ORION_SESSION_SECRET`, default dev secret in use
- **Production warnings:** `ORION_DEMO_PASSWORD` set
- **Development warnings:** Missing `ORION_SESSION_SECRET` (uses dev fallback)

## Secret Handling

- Never commit secrets to the repository
- Rotate `ORION_SESSION_SECRET` on compromise — all sessions invalidate
- Use platform secret management (Azure Key Vault, AWS Secrets Manager, etc.)

## Example Production `.env`

```env
NODE_ENV=production
ORION_SESSION_SECRET=<64-char-random-hex>
```

## Example Development `.env.local`

```env
ORION_SESSION_SECRET=local-dev-secret-change-me
ORION_DEMO_PASSWORD=orion-dev
```
