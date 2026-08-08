import {
  AURORA_DEFAULT_LOCALE,
  AURORA_DEFAULT_TIMEZONE,
} from "@/lib/aurora/constants";
import type { AuroraPermission } from "@/lib/aurora/identity/aurora-permission-catalog";
import type { AuroraRole } from "@/lib/aurora/identity/aurora-role-permissions";
import { resolveAuroraPermissions } from "@/lib/aurora/identity/aurora-role-permissions";
import type {
  AuroraContextSource,
  AuroraRuntimeContext,
} from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";

export type { AuroraRole };

export function createAuroraRuntimeContext(
  input: Partial<AuroraRuntimeContext> & Pick<AuroraRuntimeContext, "tenantId" | "userId">,
  platformState: PlatformLifecycleState = "ready",
): AuroraRuntimeContext {
  const roles = input.roles ?? (["aurora.viewer"] as const);
  const auroraPermissions =
    input.auroraPermissions ??
    [...resolveAuroraPermissions(roles)];

  return {
    tenantId: input.tenantId,
    userId: input.userId,
    orionOrganizationId: input.orionOrganizationId ?? input.tenantId,
    workspaceId: input.workspaceId ?? "",
    roles,
    auroraPermissions,
    brandId: input.brandId ?? "",
    businessId: input.businessId ?? input.tenantId,
    locale: input.locale ?? AURORA_DEFAULT_LOCALE,
    timezone: input.timezone ?? AURORA_DEFAULT_TIMEZONE,
    requestId: input.requestId ?? crypto.randomUUID(),
    correlationId: input.correlationId ?? crypto.randomUUID(),
    sessionId: input.sessionId,
    contextSource: input.contextSource ?? "test-manual",
    platformState,
    featureFlags: input.featureFlags ?? {},
  };
}

/** Explicit test/manual context helper — defaults to platform-admin-capable roles for WP-A001 tests. */
export function createTestAuroraRuntimeContext(
  input: Partial<AuroraRuntimeContext> & Pick<AuroraRuntimeContext, "tenantId" | "userId">,
  platformState: PlatformLifecycleState = "ready",
): AuroraRuntimeContext {
  return createAuroraRuntimeContext(
    {
      ...input,
      roles: input.roles ?? (["aurora.admin"] as const),
      contextSource: "test-manual",
    },
    platformState,
  );
}

export function withBrandContext(
  ctx: AuroraRuntimeContext,
  brandId: string,
): AuroraRuntimeContext {
  return { ...ctx, brandId };
}

export function permissionsToArray(
  permissions: readonly AuroraPermission[] | ReadonlySet<AuroraPermission>,
): readonly AuroraPermission[] {
  return permissions instanceof Set ? [...permissions] : [...permissions];
}

export type { AuroraContextSource };
