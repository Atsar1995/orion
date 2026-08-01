import { getPermissionsForRole } from "@/lib/identity/role-permissions";
import { getRoleLabel } from "@/lib/auth/roles";
import {
  createPlatformAuditEntry,
  type OrganizationPlatformRepository,
} from "@/lib/platform/organization/repository/OrganizationPlatformRepository";
import { defaultOrganizationPlatformRepository } from "@/lib/platform/organization/repository/InMemoryOrganizationPlatformRepository";
import type { AssignRoleInput } from "@/types/organization";
import type { RoleSlug } from "@/types/auth";
import type { ServiceContext } from "@/types/services";

/** Role assignment service (Mission P-005). */
export class RoleService {
  constructor(
    private readonly repository: OrganizationPlatformRepository = defaultOrganizationPlatformRepository,
  ) {}

  listRoles(): { slug: RoleSlug; label: string }[] {
    const roles: RoleSlug[] = [
      "super_admin",
      "organization_admin",
      "executive",
      "manager",
      "analyst",
      "read_only",
    ];

    return roles.map((slug) => ({ slug, label: getRoleLabel(slug) }));
  }

  assignRole(
    input: AssignRoleInput,
    context: ServiceContext,
    actorName: string,
  ) {
    if (!["super_admin", "organization_admin"].includes(context.role)) {
      throw new Error("PERMISSION_DENIED");
    }

    const updated = this.repository.updateUserRole(
      input.userId,
      context.organizationId,
      input.role,
    );

    if (!updated) {
      return null;
    }

    this.repository.addAudit(
      createPlatformAuditEntry(
        context,
        actorName,
        "role.assigned",
        "user",
        input.userId,
        `Assigned role ${input.role}`,
      ),
    );

    return {
      user: updated,
      permissions: getPermissionsForRole(input.role),
    };
  }
}

export const roleService = new RoleService();
