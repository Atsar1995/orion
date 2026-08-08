import { AURORA_ERR_0403, AuroraError } from "@/lib/aurora/errors/AuroraError";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export const AURORA_PLATFORM_SYSTEM_TENANT_ID = "system";

export function assertTenantScope(ctx: AuroraRuntimeContext, tenantId: string): void {
  if (ctx.tenantId !== tenantId) {
    throw new AuroraError(AURORA_ERR_0403, "Tenant scope violation.", 403);
  }
}

export function assertPlatformAdminContext(ctx: AuroraRuntimeContext): void {
  if (ctx.tenantId !== AURORA_PLATFORM_SYSTEM_TENANT_ID) {
    throw new AuroraError(AURORA_ERR_0403, "Platform admin context required.", 403);
  }
  if (!ctx.roles.includes("aurora.admin")) {
    throw new AuroraError(AURORA_ERR_0403, "Admin role required.", 403);
  }
}

export function assertTenantAccess(ctx: AuroraRuntimeContext, tenantId: string): void {
  if (
    ctx.tenantId === AURORA_PLATFORM_SYSTEM_TENANT_ID &&
    ctx.roles.includes("aurora.admin")
  ) {
    return;
  }
  assertTenantScope(ctx, tenantId);
}
