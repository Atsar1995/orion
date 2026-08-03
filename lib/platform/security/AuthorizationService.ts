/**
 * Authorization service — platform-wide RBAC engine (Mission P-015.6 · ADR-009).
 */

import { canAccess } from "@/lib/auth/permissions";
import type { PermissionCode } from "@/lib/platform/security/Permission";
import {
  allowResult,
  AuthorizationError,
  denyResult,
  type AuthorizationResult,
} from "@/lib/platform/security/AuthorizationResult";
import {
  DEFAULT_DENY_REASON,
  evaluateOrganizationBoundary,
} from "@/lib/platform/security/AuthorizationPolicy";
import type { IdentityContext } from "@/lib/platform/security/IdentityContext";
import { toServiceContext } from "@/lib/platform/security/IdentityContext";
import type { PermissionEvaluator } from "@/lib/platform/security/PermissionEvaluator";
import { defaultPermissionEvaluator } from "@/lib/platform/security/PermissionEvaluator";
import type { PermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import { defaultPermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { getPermissionsForRole } from "@/lib/identity/role-permissions";
import type { ServiceContext } from "@/types/services";

export type AuthorizationAuditHook = (input: {
  result: AuthorizationResult;
  identity: IdentityContext;
  resourceOrganizationId?: string;
  crossOrganization: boolean;
}) => void;

export type AuthorizationOptions = {
  readonly resourceOrganizationId?: string;
  readonly skipAudit?: boolean;
};

/** Platform authorization engine — default deny · org isolation · audit hooks. */
export class AuthorizationService {
  private auditHook: AuthorizationAuditHook | null = null;

  constructor(
    private readonly permissionRegistry: PermissionRegistry = defaultPermissionRegistry,
    private readonly permissionEvaluator: PermissionEvaluator = defaultPermissionEvaluator,
  ) {}

  setAuditHook(hook: AuthorizationAuditHook | null): void {
    this.auditHook = hook;
  }

  authorize(
    identity: IdentityContext,
    permission: PermissionCode,
    options: AuthorizationOptions = {},
  ): AuthorizationResult {
    if (!identity.authenticated) {
      const result = denyResult(permission, "Authentication required.");
      this.maybeAudit(result, identity, options, false);
      return result;
    }

    const boundary = evaluateOrganizationBoundary({
      identity,
      permission,
      resourceOrganizationId: options.resourceOrganizationId,
    });

    if (!boundary.allowed) {
      const result = denyResult(permission, boundary.reason, true);
      this.maybeAudit(result, identity, options, boundary.crossOrganization);
      return result;
    }

    if (!this.permissionRegistry.has(permission) && permission.startsWith("platform:")) {
      const result = denyResult(permission, "Unknown platform permission.");
      this.maybeAudit(result, identity, options, boundary.crossOrganization);
      return result;
    }

    const moduleAllowed = this.evaluateModuleAccess(identity, permission);
    const domainAllowed = this.permissionEvaluator.evaluate({ identity, permission });
    const [domain] = permission.split(":");

    const authorized =
      domain === "finance" ? domainAllowed : moduleAllowed && domainAllowed;

    if (authorized) {
      const result = allowResult(
        permission,
        boundary.crossOrganization
          ? "Cross-organization access granted with audit."
          : "Permission granted.",
      );
      if (boundary.crossOrganization) {
        this.maybeAudit(result, identity, options, true);
      }
      return result;
    }

    const result = denyResult(permission, DEFAULT_DENY_REASON, true);
    this.maybeAudit(result, identity, options, boundary.crossOrganization);
    return result;
  }

  assert(
    identity: IdentityContext,
    permission: PermissionCode,
    options: AuthorizationOptions = {},
  ): AuthorizationResult {
    const result = this.authorize(identity, permission, options);
    if (!result.allowed) {
      throw new AuthorizationError("FORBIDDEN", result.reason, permission);
    }
    return result;
  }

  authorizeServiceContext(
    context: ServiceContext,
    permission: PermissionCode,
    options: AuthorizationOptions & { authenticated?: boolean } = {},
  ): AuthorizationResult {
    const identity = createIdentityContextFromServiceContext(context, {
      authenticated: options.authenticated ?? true,
      modulePermissions: getPermissionsForRole(context.role),
    });

    return this.authorize(identity, permission, options);
  }

  private evaluateModuleAccess(identity: IdentityContext, permission: PermissionCode): boolean {
    const [domain] = permission.split(":");
    if (domain === "platform") {
      return true;
    }

    const moduleName = domain === "hcm" ? "executive" : domain;
    const action = permission.endsWith(":read") ? "read" : "write";
    return canAccess({ permissions: [...identity.modulePermissions] }, moduleName, action);
  }

  private maybeAudit(
    result: AuthorizationResult,
    identity: IdentityContext,
    options: AuthorizationOptions,
    crossOrganization: boolean,
  ): void {
    if (options.skipAudit || !this.auditHook) {
      return;
    }

    if (!result.allowed || crossOrganization) {
      this.auditHook({
        result: { ...result, audited: true },
        identity,
        resourceOrganizationId: options.resourceOrganizationId,
        crossOrganization,
      });
    }
  }
}

export const defaultAuthorizationService = new AuthorizationService();

export function authorizeServiceContext(
  context: ServiceContext,
  permission: PermissionCode,
  options?: AuthorizationOptions,
): AuthorizationResult {
  return defaultAuthorizationService.authorizeServiceContext(context, permission, options);
}

export function assertServiceContext(
  context: ServiceContext,
  permission: PermissionCode,
  options?: AuthorizationOptions,
): ServiceContext {
  defaultAuthorizationService.authorizeServiceContext(context, permission, options);
  return context;
}

export function serviceContextFromIdentity(identity: IdentityContext): ServiceContext {
  return toServiceContext(identity);
}
