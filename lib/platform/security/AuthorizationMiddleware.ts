/**
 * Authorization middleware helpers for API routes (Mission P-015.6 · ADR-009).
 */

import { getPermissionsForRole } from "@/lib/identity/role-permissions";
import type { PermissionCode } from "@/lib/platform/security/Permission";
import type { AuthenticationContext } from "@/lib/platform/security/AuthenticationContext";
import {
  createAuthenticationContext,
  isFailClosedEnabled,
  requiresAuthenticatedSession,
} from "@/lib/platform/security/AuthenticationContext";
import type { IdentityContext } from "@/lib/platform/security/IdentityContext";
import { toServiceContext } from "@/lib/platform/security/IdentityContext";
import {
  AuthorizationError,
  type AuthorizationResult,
} from "@/lib/platform/security/AuthorizationResult";
import type { AuthorizationOptions } from "@/lib/platform/security/AuthorizationService";
import {
  AuthorizationService,
  defaultAuthorizationService,
} from "@/lib/platform/security/AuthorizationService";
import {
  resolveFinanceRolesForPlatformRole,
  resolveHcmRolesForPlatformRole,
  resolveOrganizationRole,
  resolvePlatformRole,
} from "@/lib/platform/security/Role";
import type { ServiceContext } from "@/types/services";

export type AuthorizedRequestContext = {
  readonly authentication: AuthenticationContext;
  readonly identity: IdentityContext;
  readonly context: ServiceContext;
  readonly executiveName: string;
};

export type AuthorizationMiddlewareOptions = AuthorizationOptions & {
  readonly permission?: PermissionCode;
  readonly fallbackExecutiveName?: string;
  readonly authorizationService?: AuthorizationService;
};

const DEFAULT_EXECUTIVE_NAME = "Executive";

function createDevelopmentFallbackContext(): AuthorizedRequestContext {
  const fallbackContext: ServiceContext = {
    organizationId: "org-orania",
    workspaceId: "workspace-orania",
    userId: "user-executive",
    role: "executive",
  };

  return {
    authentication: createAuthenticationContext(null),
    identity: {
      userId: fallbackContext.userId,
      organizationId: fallbackContext.organizationId,
      workspaceId: fallbackContext.workspaceId,
      role: fallbackContext.role,
      platformRole: resolvePlatformRole(fallbackContext.role),
      organizationRole: resolveOrganizationRole(fallbackContext.role),
      hcmRoles: resolveHcmRolesForPlatformRole(fallbackContext.role),
      financeRoles: resolveFinanceRolesForPlatformRole(fallbackContext.role),
      modulePermissions: getPermissionsForRole(fallbackContext.role),
      authenticated: true,
    },
    context: fallbackContext,
    executiveName: DEFAULT_EXECUTIVE_NAME,
  };
}

/** API authorization middleware — authentication + optional permission assertion. */
export class AuthorizationMiddleware {
  constructor(
    private readonly authorizationService: AuthorizationService = defaultAuthorizationService,
  ) {}

  authorize(
    authentication: AuthenticationContext,
    options: AuthorizationMiddlewareOptions = {},
  ): AuthorizedRequestContext {
    if (requiresAuthenticatedSession(authentication)) {
      throw new AuthorizationError("UNAUTHORIZED", "Authentication required.");
    }

    if (!authentication.identity) {
      if (!isFailClosedEnabled()) {
        const fallback = createDevelopmentFallbackContext();
        if (options.permission) {
          const result = this.authorizationService.authorize(
            fallback.identity,
            options.permission,
            options,
          );
          if (!result.allowed) {
            throw new AuthorizationError("FORBIDDEN", result.reason, options.permission);
          }
        }
        return fallback;
      }
      throw new AuthorizationError("UNAUTHORIZED", "Authentication required.");
    }

    const identity = authentication.identity;
    const context = toServiceContext(identity);

    if (options.permission) {
      const result = this.authorizationService.authorize(identity, options.permission, options);
      if (!result.allowed) {
        throw new AuthorizationError("FORBIDDEN", result.reason, options.permission);
      }
    }

    return {
      authentication,
      identity,
      context,
      executiveName:
        authentication.session?.user.name ?? options.fallbackExecutiveName ?? DEFAULT_EXECUTIVE_NAME,
    };
  }

  evaluatePermission(
    identity: IdentityContext,
    permission: PermissionCode,
    options?: AuthorizationOptions,
  ): AuthorizationResult {
    return this.authorizationService.authorize(identity, permission, options);
  }
}

export const defaultAuthorizationMiddleware = new AuthorizationMiddleware();

/** Dev/test fallback when fail-closed authentication is disabled. */
export function resolveDevelopmentFallbackContext(): AuthorizedRequestContext {
  return createDevelopmentFallbackContext();
}
