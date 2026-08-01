import { randomUUID } from "crypto";
import type {
  BusinessUnit,
  CreateOrganizationInput,
  DelegationGrant,
  Department,
  ExecutiveProfile,
  InviteUserInput,
  PlatformAuditEntry,
  PlatformOrganization,
  PlatformUser,
  ReportingRelationship,
  Team,
} from "@/types/organization";
import type { ServiceContext } from "@/types/services";

/** Platform organization repository contract (Mission P-005). */
export interface OrganizationPlatformRepository {
  readonly entityName: "OrganizationPlatform";

  listOrganizations(): PlatformOrganization[];
  findOrganization(id: string): PlatformOrganization | null;
  findOrganizationBySlug(slug: string): PlatformOrganization | null;
  createOrganization(input: CreateOrganizationInput): PlatformOrganization;

  listBusinessUnits(organizationId: string): BusinessUnit[];
  listDepartments(organizationId: string): Department[];
  listTeams(organizationId: string): Team[];
  listUsers(organizationId: string): PlatformUser[];
  findUser(id: string, organizationId: string): PlatformUser | null;
  findUserByEmail(email: string, organizationId: string): PlatformUser | null;
  createUser(organizationId: string, input: InviteUserInput): PlatformUser;
  updateUserRole(userId: string, organizationId: string, role: PlatformUser["role"]): PlatformUser | null;

  getExecutiveProfile(userId: string, organizationId: string): ExecutiveProfile | null;
  listReportingRelationships(organizationId: string): ReportingRelationship[];
  listDelegations(organizationId: string): DelegationGrant[];
  createDelegation(
    organizationId: string,
    delegatorId: string,
    input: Omit<DelegationGrant, "id" | "organizationId" | "delegatorId" | "active"> & {
      active?: boolean;
    },
  ): DelegationGrant;

  addAudit(entry: Omit<PlatformAuditEntry, "id" | "timestamp">): PlatformAuditEntry;
  listAudit(organizationId: string): PlatformAuditEntry[];
}

export function createOrgId(): string {
  return randomUUID();
}

export function createPlatformAuditEntry(
  context: ServiceContext,
  actorName: string,
  action: string,
  targetType: string,
  targetId: string,
  detail: string,
): Omit<PlatformAuditEntry, "id" | "timestamp"> {
  return {
    organizationId: context.organizationId,
    actorId: context.userId,
    actorName,
    action,
    targetType,
    targetId,
    detail,
  };
}
