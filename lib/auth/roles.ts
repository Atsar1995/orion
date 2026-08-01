/**
 * ORION Identity — system roles and role helpers.
 */

import type { RoleSlug, User } from "@/types/auth";

/** Predefined platform roles (Mission S1A). */
export enum SystemRole {
  SuperAdmin = "super_admin",
  OrganizationAdmin = "organization_admin",
  Executive = "executive",
  Manager = "manager",
  Analyst = "analyst",
  ReadOnly = "read_only",
  /** @deprecated Use {@link SystemRole.Executive} */
  Founder = "founder",
  /** @deprecated Use {@link SystemRole.OrganizationAdmin} */
  Administrator = "administrator",
  /** @deprecated Use {@link SystemRole.Analyst} */
  Staff = "staff",
  /** @deprecated Use {@link SystemRole.ReadOnly} */
  Guest = "guest",
  ServiceAccount = "service_account",
}

const LEGACY_ROLE_ALIASES: Record<string, SystemRole> = {
  founder: SystemRole.Executive,
  administrator: SystemRole.OrganizationAdmin,
  staff: SystemRole.Analyst,
  guest: SystemRole.ReadOnly,
};

/** Resolves a role slug or enum value to a {@link SystemRole}, if valid. */
export function toSystemRole(role: RoleSlug | SystemRole): SystemRole | null {
  if (Object.values(SystemRole).includes(role as SystemRole)) {
    return role as SystemRole;
  }

  return LEGACY_ROLE_ALIASES[role] ?? null;
}

export function isSuperAdmin(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.SuperAdmin || role === SystemRole.ServiceAccount;
}

export function isOrganizationAdmin(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.OrganizationAdmin || role === SystemRole.Administrator;
}

/** Returns true when the role is {@link SystemRole.Founder} or {@link SystemRole.Executive}. */
export function isFounder(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.Founder || role === SystemRole.Executive;
}

/** Returns true when the role is {@link SystemRole.Administrator}. */
export function isAdministrator(role: RoleSlug | SystemRole): boolean {
  return isOrganizationAdmin(role);
}

/** Returns true when the role is {@link SystemRole.Manager}. */
export function isManager(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.Manager;
}

/** Returns true when the role is {@link SystemRole.Staff} or {@link SystemRole.Analyst}. */
export function isStaff(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.Staff || role === SystemRole.Analyst;
}

/** Returns true when the role is {@link SystemRole.Guest} or {@link SystemRole.ReadOnly}. */
export function isGuest(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.Guest || role === SystemRole.ReadOnly;
}

/** Returns true when the role is {@link SystemRole.ServiceAccount}. */
export function isServiceAccount(role: RoleSlug | SystemRole): boolean {
  return role === SystemRole.ServiceAccount;
}

export function userIsFounder(user: Pick<User, "role">): boolean {
  return isFounder(user.role);
}

export function userIsAdministrator(user: Pick<User, "role">): boolean {
  return isAdministrator(user.role);
}

export function userIsManager(user: Pick<User, "role">): boolean {
  return isManager(user.role);
}

export function userIsStaff(user: Pick<User, "role">): boolean {
  return isStaff(user.role);
}

export function userIsGuest(user: Pick<User, "role">): boolean {
  return isGuest(user.role);
}

/** Human-readable label for a system role. */
export function getRoleLabel(role: RoleSlug | SystemRole): string {
  const labels: Record<SystemRole, string> = {
    [SystemRole.SuperAdmin]: "Super Admin",
    [SystemRole.OrganizationAdmin]: "Organization Admin",
    [SystemRole.Executive]: "Executive",
    [SystemRole.Manager]: "Manager",
    [SystemRole.Analyst]: "Analyst",
    [SystemRole.ReadOnly]: "Read Only",
    [SystemRole.Founder]: "Executive",
    [SystemRole.Administrator]: "Organization Admin",
    [SystemRole.Staff]: "Analyst",
    [SystemRole.Guest]: "Read Only",
    [SystemRole.ServiceAccount]: "Service Account",
  };

  const systemRole = toSystemRole(role);
  return systemRole ? labels[systemRole] : role;
}
