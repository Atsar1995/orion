import { assertTenantAccess as assertTenantScopeAccess } from "@/lib/aurora/admin/tenantAuthorization";
import type { AuroraPermission } from "@/lib/aurora/identity/aurora-permission-catalog";
import { isAuroraAdminPermission } from "@/lib/aurora/identity/aurora-permission-catalog";
import { AURORA_ERR_0403, AuroraError } from "@/lib/aurora/errors/AuroraError";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export interface AuroraAuthorizationService {
  assertPermission(ctx: AuroraRuntimeContext, permission: AuroraPermission): void;
  assertBrandAccess(ctx: AuroraRuntimeContext, brandId: string): void;
  assertTenantAccess(ctx: AuroraRuntimeContext, tenantId: string): void;
  hasPermission(ctx: AuroraRuntimeContext, permission: AuroraPermission): boolean;
}

export class DefaultAuroraAuthorizationService implements AuroraAuthorizationService {
  assertPermission(ctx: AuroraRuntimeContext, permission: AuroraPermission): void {
    if (
      ctx.roles.includes("aurora.agent.service") &&
      isAuroraAdminPermission(permission)
    ) {
      throw new AuroraError(
        AURORA_ERR_0403,
        "Agent service identity cannot invoke admin permissions.",
        403,
      );
    }

    if (!this.hasPermission(ctx, permission)) {
      throw new AuroraError(AURORA_ERR_0403, "Permission denied.", 403, { permission });
    }
  }

  assertBrandAccess(ctx: AuroraRuntimeContext, brandId: string): void {
    if (!brandId) {
      throw new AuroraError(AURORA_ERR_0403, "Brand scope required.", 403);
    }
    if (ctx.brandId && ctx.brandId !== brandId) {
      throw new AuroraError(AURORA_ERR_0403, "Brand scope violation.", 403);
    }
  }

  assertTenantAccess(ctx: AuroraRuntimeContext, tenantId: string): void {
    assertTenantScopeAccess(ctx, tenantId);
  }

  hasPermission(ctx: AuroraRuntimeContext, permission: AuroraPermission): boolean {
    return ctx.auroraPermissions.includes(permission);
  }
}
