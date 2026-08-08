import {
  assertPlatformAdminContext,
  assertTenantAccess as assertTenantScopeAccess,
  AURORA_PLATFORM_SYSTEM_TENANT_ID,
} from "@/lib/aurora/admin/tenantAuthorization";
import type { AuroraPermission } from "@/lib/aurora/identity/aurora-permission-catalog";
import { isAuroraAdminPermission } from "@/lib/aurora/identity/aurora-permission-catalog";
import { AURORA_ERR_0403, AuroraError, isAuroraError } from "@/lib/aurora/errors/AuroraError";
import type { AuroraLogger } from "@/lib/aurora/platform/services/AuroraLoggingService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export type AuthorizationAuditContext = {
  readonly operation?: string;
  readonly resource?: string;
};

export interface AuroraAuthorizationService {
  assertPermission(
    ctx: AuroraRuntimeContext,
    permission: AuroraPermission,
    audit?: AuthorizationAuditContext,
  ): void;
  assertBrandAccess(
    ctx: AuroraRuntimeContext,
    brandId: string,
    audit?: AuthorizationAuditContext,
  ): void;
  assertTenantAccess(
    ctx: AuroraRuntimeContext,
    tenantId: string,
    audit?: AuthorizationAuditContext,
  ): void;
  assertPlatformAdmin(ctx: AuroraRuntimeContext, audit?: AuthorizationAuditContext): void;
  hasPermission(ctx: AuroraRuntimeContext, permission: AuroraPermission): boolean;
}

export type DefaultAuroraAuthorizationServiceDeps = {
  readonly logger?: AuroraLogger;
};

export class DefaultAuroraAuthorizationService implements AuroraAuthorizationService {
  constructor(private readonly deps: DefaultAuroraAuthorizationServiceDeps = {}) {}

  assertPermission(
    ctx: AuroraRuntimeContext,
    permission: AuroraPermission,
    audit: AuthorizationAuditContext = {},
  ): void {
    if (
      ctx.roles.includes("aurora.agent.service") &&
      isAuroraAdminPermission(permission)
    ) {
      this.deny(ctx, permission, "Agent service identity cannot invoke admin permissions.", audit);
    }

    if (!this.hasPermission(ctx, permission)) {
      this.deny(ctx, permission, "Permission denied.", audit);
    }
  }

  assertBrandAccess(
    ctx: AuroraRuntimeContext,
    brandId: string,
    audit: AuthorizationAuditContext = {},
  ): void {
    if (!brandId) {
      this.deny(ctx, undefined, "Brand scope required.", audit);
    }
    if (ctx.brandId && ctx.brandId !== brandId) {
      this.deny(ctx, undefined, "Brand scope violation.", { ...audit, resource: brandId });
    }
  }

  assertTenantAccess(
    ctx: AuroraRuntimeContext,
    tenantId: string,
    audit: AuthorizationAuditContext = {},
  ): void {
    try {
      assertTenantScopeAccess(ctx, tenantId);
    } catch (error) {
      if (isAuroraError(error)) {
        this.logDenial(ctx, undefined, error.message, { ...audit, resource: tenantId });
      }
      throw error;
    }
  }

  assertPlatformAdmin(ctx: AuroraRuntimeContext, audit: AuthorizationAuditContext = {}): void {
    try {
      assertPlatformAdminContext(ctx);
    } catch (error) {
      if (isAuroraError(error)) {
        this.logDenial(ctx, "aurora.admin.tenant", error.message, {
          ...audit,
          resource: AURORA_PLATFORM_SYSTEM_TENANT_ID,
        });
      }
      throw error;
    }
  }

  hasPermission(ctx: AuroraRuntimeContext, permission: AuroraPermission): boolean {
    return ctx.auroraPermissions.includes(permission);
  }

  private deny(
    ctx: AuroraRuntimeContext,
    permission: AuroraPermission | undefined,
    message: string,
    audit: AuthorizationAuditContext,
  ): never {
    this.logDenial(ctx, permission, message, audit);
    throw new AuroraError(AURORA_ERR_0403, message, 403, permission ? { permission } : undefined);
  }

  private logDenial(
    ctx: AuroraRuntimeContext,
    permission: AuroraPermission | undefined,
    message: string,
    audit: AuthorizationAuditContext,
  ): void {
    this.deps.logger?.warn("Aurora authorization denied.", {
      userId: ctx.userId,
      tenantId: ctx.tenantId,
      permission,
      operation: audit.operation,
      resource: audit.resource,
      reason: message,
    });
  }
}
