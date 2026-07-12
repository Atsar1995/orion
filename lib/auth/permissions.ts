/**
 * ORION Identity — permission and authorization helpers.
 */

import type { Permission, RoleSlug, User } from "@/types/auth";
import { SystemRole as SystemRoleEnum, toSystemRole } from "@/lib/auth/roles";
import type { SystemRole } from "@/lib/auth/roles";

/** Builds a canonical permission key from module and action. */
export function permissionKey(permission: Permission): string {
  return `${permission.module}:${permission.action}`;
}

/** Parses a permission key into module and action components. */
export function parsePermissionKey(key: string): Permission | null {
  const separatorIndex = key.indexOf(":");

  if (separatorIndex <= 0 || separatorIndex === key.length - 1) {
    return null;
  }

  return {
    module: key.slice(0, separatorIndex),
    action: key.slice(separatorIndex + 1),
  };
}

/** Returns true when two permissions match on module and action. */
export function permissionsMatch(
  left: Permission,
  right: Permission,
): boolean {
  return left.module === right.module && left.action === right.action;
}

/** Returns true when the user holds the exact permission. */
export function hasPermission(
  user: Pick<User, "permissions">,
  permission: Permission,
): boolean {
  return user.permissions.some((entry) => permissionsMatch(entry, permission));
}

/** Returns true when the user holds a permission for the given module and action. */
export function canAccess(
  user: Pick<User, "permissions">,
  module: string,
  action = "read",
): boolean {
  return hasPermission(user, { module, action });
}

/** Returns true when the user holds any permission for the given module. */
export function canAccessModule(
  user: Pick<User, "permissions">,
  module: string,
): boolean {
  return user.permissions.some((entry) => entry.module === module);
}

/** Returns true when the user's role matches the expected role. */
export function hasRole(
  user: Pick<User, "role">,
  role: RoleSlug | SystemRole,
): boolean {
  return user.role === role;
}

/** Returns true when the user holds any of the provided roles. */
export function hasAnyRole(
  user: Pick<User, "role">,
  roles: Array<RoleSlug | SystemRole>,
): boolean {
  return roles.includes(user.role);
}

/** Returns true when the user is a Founder or Administrator. */
export function isPrivilegedRole(user: Pick<User, "role">): boolean {
  return hasAnyRole(user, [
    SystemRoleEnum.Founder,
    SystemRoleEnum.Administrator,
  ]);
}

/** Returns the list of modules the user may access based on granted permissions. */
export function getAccessibleModules(
  user: Pick<User, "permissions">,
): string[] {
  const modules = new Set(user.permissions.map((entry) => entry.module));
  return Array.from(modules).sort();
}

/** Validates that a role slug is a known {@link SystemRole}. */
export function isValidRole(role: string): role is RoleSlug {
  return toSystemRole(role as RoleSlug) !== null;
}
