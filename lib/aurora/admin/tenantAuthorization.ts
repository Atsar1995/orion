import { AURORA_ERR_0403, AuroraError } from "@/lib/aurora/errors/AuroraError";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export const AURORA_PLATFORM_SYSTEM_TENANT_ID = "system";

export function assertTenantScope(ctx: AuroraRuntimeContext, tenantId: string): void {
  if (ctx.tenantId !== tenantId) {
    throw new AuroraError(AURORA_ERR_0403, "Tenant scope violation.", 403);
  }
}

/**
 * Platform catalog operations require the system tenant context (OQ-1).
 * Organization sessions always use organizationId as tenantId for tenant-scoped ops.
 */
export function assertPlatformAdminContext(ctx: AuroraRuntimeContext): void {
  if (ctx.tenantId !== AURORA_PLATFORM_SYSTEM_TENANT_ID) {
    throw new AuroraError(AURORA_ERR_0403, "Platform admin context required.", 403);
  }
  if (!ctx.auroraPermissions.includes("aurora.admin.tenant")) {
    throw new AuroraError(AURORA_ERR_0403, "Platform admin permission required.", 403);
  }
  if (ctx.contextSource !== "test-manual" && !ctx.sessionId) {
    throw new AuroraError(
      AURORA_ERR_0403,
      "Session-bound context required for platform admin operations.",
      403,
    );
  }
}

export function assertTenantAccess(ctx: AuroraRuntimeContext, tenantId: string): void {
  if (
    ctx.tenantId === AURORA_PLATFORM_SYSTEM_TENANT_ID &&
    ctx.auroraPermissions.includes("aurora.admin.tenant")
  ) {
    return;
  }
  assertTenantScope(ctx, tenantId);
}
