import {
  createPlatformAuditEntry,
  type OrganizationPlatformRepository,
} from "@/lib/platform/organization/repository/OrganizationPlatformRepository";
import { defaultOrganizationPlatformRepository } from "@/lib/platform/organization/repository/InMemoryOrganizationPlatformRepository";
import type { InviteUserInput, OrganizationHealthSnapshot, PlatformUser } from "@/types/organization";
import type { ServiceContext } from "@/types/services";
import { UserStatus } from "@/types/auth";

/** User management extending platform identity (Mission P-005). */
export class UserManagementService {
  constructor(
    private readonly repository: OrganizationPlatformRepository = defaultOrganizationPlatformRepository,
  ) {}

  listUsers(context: ServiceContext): PlatformUser[] {
    return this.repository.listUsers(context.organizationId);
  }

  getUser(id: string, context: ServiceContext): PlatformUser | null {
    return this.repository.findUser(id, context.organizationId);
  }

  inviteUser(input: InviteUserInput, context: ServiceContext, actorName: string): PlatformUser {
    if (!["super_admin", "organization_admin"].includes(context.role)) {
      throw new Error("PERMISSION_DENIED");
    }

    if (input.managerId) {
      const manager = this.repository.findUser(input.managerId, context.organizationId);
      if (!manager) {
        throw new Error("MANAGER_NOT_FOUND");
      }
    }

    try {
      const user = this.repository.createUser(context.organizationId, input);
      this.repository.addAudit(
        createPlatformAuditEntry(
          context,
          actorName,
          "user.invited",
          "user",
          user.id,
          user.email,
        ),
      );
      return user;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "INVALID_EMAIL") throw error;
        if (error.message === "DUPLICATE_USER") throw error;
      }

      throw error;
    }
  }

  getExecutiveProfile(userId: string, context: ServiceContext) {
    return this.repository.getExecutiveProfile(userId, context.organizationId);
  }

  getOrganizationHealth(context: ServiceContext): OrganizationHealthSnapshot {
    const org = this.repository.findOrganization(context.organizationId);
    const users = this.repository.listUsers(context.organizationId);
    const delegations = this.repository.listDelegations(context.organizationId);
    const activeUsers = users.filter((user) => user.status === UserStatus.Active);

    const leadership = users
      .filter((user) => ["executive", "organization_admin", "super_admin"].includes(user.role))
      .map((user) => ({
        name: user.name,
        title:
          this.repository.getExecutiveProfile(user.id, context.organizationId)?.title ??
          (user.role === "organization_admin" || user.role === "super_admin"
            ? "Administrator"
            : "Executive"),
        role: user.role,
      }));

    const departments = this.repository.listDepartments(context.organizationId);
    const vacantCriticalRoles = departments
      .filter((dept) => !dept.headUserId)
      .map((dept) => `${dept.name} — head role vacant`);

    const healthScore = Math.min(
      100,
      60 +
        Math.round((activeUsers.length / Math.max(users.length, 1)) * 20) +
        (vacantCriticalRoles.length === 0 ? 15 : 0) +
        (delegations.filter((entry) => entry.active).length > 0 ? 5 : 0),
    );

    return {
      organizationId: context.organizationId,
      organizationName: org?.name ?? "Organization",
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      vacantCriticalRoles,
      leadershipStructure: leadership,
      activeDelegations: delegations.filter((entry) => entry.active).length,
      healthScore,
      summary:
        vacantCriticalRoles.length === 0
          ? "Leadership structure is fully staffed with active delegations in place."
          : `${vacantCriticalRoles.length} critical role(s) require assignment.`,
    };
  }
}

export const userManagementService = new UserManagementService();
