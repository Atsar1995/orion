/**
 * Platform permission model (Mission P-015.6 · ADR-009).
 */

/** Canonical permission code — domain:resource:action (ABAC-ready string). */
export type PermissionCode = string;

/** Permission scope for organization isolation. */
export type PermissionScope = "platform" | "organization" | "domain";

/** Structured permission definition registered in {@link PermissionRegistry}. */
export type PermissionDefinition = {
  readonly code: PermissionCode;
  readonly description: string;
  readonly scope: PermissionScope;
  readonly domain?: string;
  readonly inherits?: readonly PermissionCode[];
};

/** Parses a permission code into domain, resource, and action segments. */
export function parsePermissionCode(code: PermissionCode): {
  domain: string;
  resource: string;
  action: string;
} | null {
  const parts = code.split(":");
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    return null;
  }

  return {
    domain: parts[0],
    resource: parts[1],
    action: parts[2],
  };
}

/** Builds a permission code from segments. */
export function buildPermissionCode(
  domain: string,
  resource: string,
  action: string,
): PermissionCode {
  return `${domain}:${resource}:${action}`;
}

/** Returns true when `candidate` matches or is implied by `granted`. */
export function permissionCodesMatch(granted: PermissionCode, candidate: PermissionCode): boolean {
  return granted === candidate;
}
