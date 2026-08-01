import { getPermissionsForRole } from "@/lib/identity/role-permissions";
import {
  type OrganizationPlatformRepository,
} from "@/lib/platform/organization/repository/OrganizationPlatformRepository";
import { defaultOrganizationPlatformRepository } from "@/lib/platform/organization/repository/InMemoryOrganizationPlatformRepository";
import type { PlatformUser } from "@/types/organization";
import type { Permission } from "@/types/auth";
import { UserStatus } from "@/types/auth";
import type { ServiceContext } from "@/types/services";

export type VerifiedIdentity = {
  readonly user: PlatformUser;
  readonly permissions: readonly Permission[];
  readonly verified: true;
};

/** Platform identity resolution — verified users for attribution (Mission P-005). */
export class PlatformIdentityService {
  constructor(
    private readonly repository: OrganizationPlatformRepository = defaultOrganizationPlatformRepository,
  ) {}

  resolveVerifiedIdentity(userId: string, context: ServiceContext): VerifiedIdentity | null {
    const user = this.repository.findUser(userId, context.organizationId);

    if (!user || user.status !== UserStatus.Active) {
      return null;
    }

    return {
      user,
      permissions: getPermissionsForRole(user.role),
      verified: true,
    };
  }

  listIdentities(context: ServiceContext): VerifiedIdentity[] {
    return this.repository
      .listUsers(context.organizationId)
      .filter((user) => user.status === UserStatus.Active)
      .map((user) => ({
        user,
        permissions: getPermissionsForRole(user.role),
        verified: true as const,
      }));
  }
}

export const platformIdentityService = new PlatformIdentityService();
