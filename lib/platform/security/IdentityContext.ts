/**
 * Identity context derived from authenticated session (Mission P-015.6 · ADR-008).
 */

import type { Permission, RoleSlug, Session } from "@/types/auth";
import type { ServiceContext } from "@/types/services";
import { getPermissionsForRole } from "@/lib/identity/role-permissions";
import {
  resolveFinanceRolesForPlatformRole,
  resolveHcmRolesForPlatformRole,
  resolveOrganizationRole,
  resolvePlatformRole,
  type FinanceRole,
  type HcmRole,
} from "@/lib/platform/security/Role";

export type IdentityContext = {
  readonly userId: string;
  readonly organizationId: string;
  readonly workspaceId: string;
  readonly role: RoleSlug;
  readonly platformRole: ReturnType<typeof resolvePlatformRole>;
  readonly organizationRole: ReturnType<typeof resolveOrganizationRole>;
  readonly hcmRoles: readonly HcmRole[];
  readonly financeRoles: readonly FinanceRole[];
  readonly modulePermissions: readonly Permission[];
  readonly authenticated: boolean;
};

export function createIdentityContextFromSession(session: Session): IdentityContext {
  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    workspaceId: session.user.workspaceId,
    role: session.user.role,
    platformRole: resolvePlatformRole(session.user.role),
    organizationRole: resolveOrganizationRole(session.user.role),
    hcmRoles: resolveHcmRolesForPlatformRole(session.user.role),
    financeRoles: resolveFinanceRolesForPlatformRole(session.user.role),
    modulePermissions: session.user.permissions.length
      ? session.user.permissions
      : getPermissionsForRole(session.user.role),
    authenticated: true,
  };
}

export function createIdentityContextFromServiceContext(
  context: ServiceContext,
  options: { authenticated?: boolean; modulePermissions?: Permission[] } = {},
): IdentityContext {
  const modulePermissions = options.modulePermissions ?? getPermissionsForRole(context.role);

  return {
    userId: context.userId,
    organizationId: context.organizationId,
    workspaceId: context.workspaceId,
    role: context.role,
    platformRole: resolvePlatformRole(context.role),
    organizationRole: resolveOrganizationRole(context.role),
    hcmRoles: resolveHcmRolesForPlatformRole(context.role),
    financeRoles: resolveFinanceRolesForPlatformRole(context.role),
    modulePermissions,
    authenticated: options.authenticated ?? true,
  };
}

export function toServiceContext(identity: IdentityContext): ServiceContext {
  return {
    organizationId: identity.organizationId,
    workspaceId: identity.workspaceId,
    userId: identity.userId,
    role: identity.role,
  };
}
