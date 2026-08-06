# Runbook — Platform Shutdown

**Mission:** P-011.1 · **Category:** Shutdown  
**Related:** [Enterprise Operations Readiness](./Enterprise-Operations-Readiness.md)

---

## Objective

Gracefully shut down the ORION platform without data loss or connection leaks.

## Procedure

1. **Drain active HTTP connections**
   - Remove instance from load balancer
   - Wait for in-flight requests to complete (recommended: 30 seconds)

2. **Complete in-flight API requests**
   - Monitor request queue depth
   - Do not force-kill during active journal posting

3. **Close PlatformStore connection pool**
   ```typescript
   import { verifyPlatformShutdown } from "@/lib/platform/store/PlatformStoreFactory";
   const result = await verifyPlatformShutdown();
   ```

4. **Stop application process**
   - Send SIGTERM to Node.js process
   - Allow graceful exit (do not SIGKILL unless timeout exceeded)

## Verification

- `lifecycle_shutdown` check reports `shutdown` state
- No open database connections in pool monitor
- `post_shutdown_health` confirms expected shutdown state

## Recovery

After shutdown, execute [Platform Startup](./Runbook-Platform-Startup.md) to restore service.

---

*P-011.1 · ORION Enterprise Platform v2.0*
