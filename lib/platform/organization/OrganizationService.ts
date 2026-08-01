import {
  createPlatformAuditEntry,
  type OrganizationPlatformRepository,
} from "@/lib/platform/organization/repository/OrganizationPlatformRepository";
import { defaultOrganizationPlatformRepository } from "@/lib/platform/organization/repository/InMemoryOrganizationPlatformRepository";
import type {
  CreateOrganizationInput,
  PlatformOrganization,
} from "@/types/organization";
import type { ServiceContext } from "@/types/services";

/** Organization management service (Mission P-005). */
export class OrganizationService {
  constructor(
    private readonly repository: OrganizationPlatformRepository = defaultOrganizationPlatformRepository,
  ) {}

  list(context: ServiceContext): PlatformOrganization[] {
    return this.repository.listOrganizations().filter(
      (org) => org.id === context.organizationId || context.role === "super_admin",
    );
  }

  get(id: string, context: ServiceContext): PlatformOrganization | null {
    const org = this.repository.findOrganization(id);
    if (!org || (org.id !== context.organizationId && context.role !== "super_admin")) {
      return null;
    }

    return org;
  }

  create(
    input: CreateOrganizationInput,
    context: ServiceContext,
    actorName: string,
  ): PlatformOrganization {
    if (context.role !== "super_admin") {
      throw new Error("PERMISSION_DENIED");
    }

    try {
      const created = this.repository.createOrganization(input);
      this.repository.addAudit(
        createPlatformAuditEntry(context, actorName, "organization.created", "organization", created.id, created.name),
      );
      return created;
    } catch (error) {
      if (error instanceof Error && error.message === "DUPLICATE_ORGANIZATION") {
        throw error;
      }

      throw error;
    }
  }

  getStructure(context: ServiceContext) {
    const orgId = context.organizationId;
    return {
      organization: this.repository.findOrganization(orgId),
      businessUnits: this.repository.listBusinessUnits(orgId),
      departments: this.repository.listDepartments(orgId),
      teams: this.repository.listTeams(orgId),
    };
  }
}

export const organizationService = new OrganizationService();
