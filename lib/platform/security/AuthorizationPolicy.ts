/**
 * Authorization policy primitives (Mission P-015.6 · ADR-009).
 */

import type { PermissionCode } from "@/lib/platform/security/Permission";
import type { IdentityContext } from "@/lib/platform/security/IdentityContext";
import { isSuperAdmin } from "@/lib/auth/roles";

export type AuthorizationPolicyInput = {
  readonly identity: IdentityContext;
  readonly permission: PermissionCode;
  readonly resourceOrganizationId?: string;
};

/** Default-deny policy with organization isolation and super-admin exception. */
export function evaluateOrganizationBoundary(input: AuthorizationPolicyInput): {
  allowed: boolean;
  reason: string;
  crossOrganization: boolean;
} {
  const { identity, resourceOrganizationId } = input;

  if (!resourceOrganizationId || resourceOrganizationId === identity.organizationId) {
    return {
      allowed: true,
      reason: "Organization boundary satisfied.",
      crossOrganization: false,
    };
  }

  if (isSuperAdmin(identity.role)) {
    return {
      allowed: true,
      reason: "Super administrator cross-organization access.",
      crossOrganization: true,
    };
  }

  return {
    allowed: false,
    reason: "Organization isolation violation.",
    crossOrganization: true,
  };
}

/** Returns true when mutating HTTP methods require explicit catalog coverage. */
export function isMutatingHttpMethod(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

/** Default deny when permission is unknown. */
export const DEFAULT_DENY_REASON = "Default deny — permission not granted.";
