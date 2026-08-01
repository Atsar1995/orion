import { SystemRole } from "@/lib/auth/roles";
import type { Permission, RoleSlug } from "@/types/auth";

const ALL_MODULES = [
  "executive",
  "mission-control",
  "intelligence",
  "engineering",
  "configuration",
  "crm",
  "finance",
  "hospitality",
  "marketing",
  "integrations",
  "settings",
  "users",
] as const;

function readAll(): Permission[] {
  return ALL_MODULES.flatMap((module) => [
    { module, action: "read" },
    { module, action: "write" },
  ]);
}

function readModules(modules: readonly string[]): Permission[] {
  return modules.map((module) => ({ module, action: "read" }));
}

function readWriteModules(modules: readonly string[]): Permission[] {
  return modules.flatMap((module) => [
    { module, action: "read" },
    { module, action: "write" },
  ]);
}

/** Resolves module permissions for a platform role (Mission S1A RBAC). */
export function getPermissionsForRole(role: RoleSlug): Permission[] {
  switch (role) {
    case SystemRole.SuperAdmin:
      return readAll();
    case SystemRole.OrganizationAdmin:
      return readWriteModules([
        "executive",
        "mission-control",
        "intelligence",
        "configuration",
        "crm",
        "finance",
        "hospitality",
        "marketing",
        "integrations",
        "settings",
        "users",
      ]);
    case SystemRole.Executive:
      return readWriteModules([
        "executive",
        "mission-control",
        "intelligence",
        "crm",
        "finance",
        "hospitality",
        "marketing",
        "integrations",
      ]);
    case SystemRole.Manager:
      return readWriteModules(["executive", "crm", "finance", "hospitality", "marketing"]);
    case SystemRole.Analyst:
      return readModules(["executive", "intelligence", "crm", "finance", "marketing"]);
    case SystemRole.ReadOnly:
      return readModules(["executive", "mission-control", "crm", "finance"]);
    case "founder":
      return getPermissionsForRole(SystemRole.Executive);
    case "administrator":
      return getPermissionsForRole(SystemRole.OrganizationAdmin);
    case "manager":
      return getPermissionsForRole(SystemRole.Manager);
    case "staff":
      return getPermissionsForRole(SystemRole.Analyst);
    case "guest":
      return getPermissionsForRole(SystemRole.ReadOnly);
    case "service_account":
      return getPermissionsForRole(SystemRole.SuperAdmin);
    default:
      return readModules(["executive"]);
  }
}
