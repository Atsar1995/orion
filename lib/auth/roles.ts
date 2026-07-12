/**
 * ORION Identity — system roles and role helpers.
 */

import type { RoleSlug, User } from "@/types/auth";

/** Predefined platform roles. */
export enum SystemRole {
  Founder = "founder",
  Administrator = "administrator",
  Manager = "manager",
  Staff = "staff",
  Guest = "guest",
  ServiceAccount = "service_account",
}

/** Resolves a role slug or enum value to a {@link SystemRole}, if valid. */
export function toSystemRole(role: RoleSlug | SystemRole): SystemRole | null {
  if (Object.values(SystemRole).includes(role as SystemRole)) {
    return role as SystemRole;
  }

  return null;
}

/** Returns true when the role is {@link SystemRole.Founder}. */
export function isFounder(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.Founder;
}

/** Returns true when the role is {@link SystemRole.Administrator}. */
export function isAdministrator(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.Administrator;
}

/** Returns true when the role is {@link SystemRole.Manager}. */
export function isManager(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.Manager;
}

/** Returns true when the role is {@link SystemRole.Staff}. */
export function isStaff(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.Staff;
}

/** Returns true when the role is {@link SystemRole.Guest}. */
export function isGuest(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.Guest;
}

/** Returns true when the role is {@link SystemRole.ServiceAccount}. */
export function isServiceAccount(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.ServiceAccount;
}

/** Returns true when the user holds the {@link SystemRole.Founder} role. */
export function userIsFounder(user: Pick<User, "role">): boolean {
  return isFounder(user.role);
}

/** Returns true when the user holds the {@link SystemRole.Administrator} role. */
export function userIsAdministrator(user: Pick<User, "role">): boolean {
  return isAdministrator(user.role);
}

/** Returns true when the user holds the {@link SystemRole.Manager} role. */
export function userIsManager(user: Pick<User, "role">): boolean {
  return isManager(user.role);
}

/** Returns true when the user holds the {@link SystemRole.Staff} role. */
export function userIsStaff(user: Pick<User, "role">): boolean {
  return isStaff(user.role);
}

/** Returns true when the user holds the {@link SystemRole.Guest} role. */
export function userIsGuest(user: Pick<User, "role">): boolean {
  return isGuest(user.role);
}

/** Human-readable label for a system role. */
export function getRoleLabel(role: RoleSlug | SystemRole): string {
  const labels: Record<SystemRole, string> = {
    [SystemRole.Founder]: "Founder",
    [SystemRole.Administrator]: "Administrator",
    [SystemRole.Manager]: "Manager",
    [SystemRole.Staff]: "Staff",
    [SystemRole.Guest]: "Guest",
    [SystemRole.ServiceAccount]: "Service Account",
  };

  const systemRole = toSystemRole(role);
  return systemRole ? labels[systemRole] : role;
}
