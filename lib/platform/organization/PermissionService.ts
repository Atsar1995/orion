import { getPermissionsForRole } from "@/lib/identity/role-permissions";
import { getRoleLabel, SystemRole } from "@/lib/auth/roles";
import type { PermissionMatrixEntry } from "@/types/organization";
import type { RoleSlug } from "@/types/auth";
import type { Permission } from "@/types/auth";

const MATRIX_MODULES = [
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

const MATRIX_ROLES: RoleSlug[] = [
  SystemRole.SuperAdmin,
  SystemRole.OrganizationAdmin,
  SystemRole.Executive,
  SystemRole.Manager,
  SystemRole.Analyst,
  SystemRole.ReadOnly,
];

/** Permission evaluation and matrix service (Mission P-005). */
export class PermissionService {
  getPermissionsForRole(role: RoleSlug): Permission[] {
    return getPermissionsForRole(role);
  }

  evaluate(userPermissions: Permission[], module: string, action = "read"): boolean {
    return userPermissions.some(
      (permission) => permission.module === module && permission.action === action,
    );
  }

  buildMatrix(): PermissionMatrixEntry[] {
    const entries: PermissionMatrixEntry[] = [];

    for (const role of MATRIX_ROLES) {
      const permissions = getPermissionsForRole(role);
      const permissionSet = new Set(permissions.map((entry) => `${entry.module}:${entry.action}`));

      for (const platformModule of MATRIX_MODULES) {
        entries.push({
          role,
          roleLabel: getRoleLabel(role),
          module: platformModule,
          canRead: permissionSet.has(`${platformModule}:read`),
          canWrite: permissionSet.has(`${platformModule}:write`),
        });
      }
    }

    return entries;
  }
}

export const permissionService = new PermissionService();
