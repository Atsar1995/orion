import type { OrganizationPlatformRepository } from "@/lib/platform/organization/repository/OrganizationPlatformRepository";
import { defaultOrganizationPlatformRepository } from "@/lib/platform/organization/repository/InMemoryOrganizationPlatformRepository";
import type { OrgHierarchyNode, PlatformUser } from "@/types/organization";
import type { ServiceContext } from "@/types/services";

function detectCircularReporting(
  users: PlatformUser[],
  userId: string,
  managerId: string,
): boolean {
  let current: string | undefined = managerId;
  const visited = new Set<string>();

  while (current) {
    if (current === userId || visited.has(current)) {
      return true;
    }

    visited.add(current);
    current = users.find((entry) => entry.id === current)?.managerId;
  }

  return false;
}

/** Organizational hierarchy queries (Mission P-005). */
export class HierarchyService {
  constructor(
    private readonly repository: OrganizationPlatformRepository = defaultOrganizationPlatformRepository,
  ) {}

  buildTree(context: ServiceContext): OrgHierarchyNode {
    const orgId = context.organizationId;
    const organization = this.repository.findOrganization(orgId);
    const businessUnits = this.repository.listBusinessUnits(orgId);
    const departments = this.repository.listDepartments(orgId);
    const teams = this.repository.listTeams(orgId);
    const users = this.repository.listUsers(orgId);

    const orgNode: OrgHierarchyNode = {
      id: orgId,
      type: "organization",
      label: organization?.name ?? "Organization",
      children: businessUnits.map((unit) => ({
        id: unit.id,
        type: "business_unit",
        label: unit.name,
        parentId: orgId,
        children: departments
          .filter((dept) => dept.businessUnitId === unit.id)
          .map((dept) => ({
            id: dept.id,
            type: "department" as const,
            label: dept.name,
            parentId: unit.id,
            children: teams
              .filter((team) => team.departmentId === dept.id)
              .map((team) => ({
                id: team.id,
                type: "team" as const,
                label: team.name,
                parentId: dept.id,
                children: users
                  .filter((user) => user.teamId === team.id)
                  .map((user) => ({
                    id: user.id,
                    type: "user" as const,
                    label: user.name,
                    parentId: team.id,
                    metadata: { role: user.role, email: user.email },
                    children: [],
                  })),
              })),
          })),
      })),
    };

    return orgNode;
  }

  validateReporting(userId: string, managerId: string, context: ServiceContext): boolean {
    const users = this.repository.listUsers(context.organizationId);
    return !detectCircularReporting(users, userId, managerId);
  }

  getDirectReports(managerId: string, context: ServiceContext): PlatformUser[] {
    return this.repository
      .listUsers(context.organizationId)
      .filter((user) => user.managerId === managerId);
  }
}

export const hierarchyService = new HierarchyService();
