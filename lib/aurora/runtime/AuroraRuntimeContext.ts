import type { AuroraPermission } from "@/lib/aurora/identity/aurora-permission-catalog";
import type { AuroraRole } from "@/lib/aurora/identity/aurora-role-permissions";
import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";

export interface AuroraRuntimeContext {
  readonly tenantId: string;
  readonly userId: string;
  readonly orionOrganizationId: string;
  readonly workspaceId: string;
  readonly roles: readonly AuroraRole[];
  readonly auroraPermissions: readonly AuroraPermission[];
  readonly brandId: string;
  readonly businessId: string;
  readonly locale: string;
  readonly timezone: string;
  readonly requestId: string;
  readonly correlationId: string;
  readonly sessionId?: string;
  readonly platformState: PlatformLifecycleState;
  readonly featureFlags: Readonly<Record<string, boolean>>;
}

export function withBrand(
  ctx: AuroraRuntimeContext,
  brandId: string,
): AuroraRuntimeContext {
  return { ...ctx, brandId };
}
