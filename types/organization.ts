/**
 * ORION Organization & Identity Platform — types (Mission P-005).
 */

import type { OrganizationStatus, RoleSlug, UserStatus } from "@/types/auth";

export type BusinessUnit = {
  readonly id: string;
  readonly organizationId: string;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
};

export type Department = {
  readonly id: string;
  readonly organizationId: string;
  readonly businessUnitId: string;
  readonly name: string;
  readonly slug: string;
  readonly headUserId?: string;
};

export type Team = {
  readonly id: string;
  readonly organizationId: string;
  readonly departmentId: string;
  readonly name: string;
  readonly slug: string;
  readonly leadUserId?: string;
};

export type ExecutiveProfile = {
  readonly userId: string;
  readonly title: string;
  readonly operatingMode: "standard" | "growth" | "recovery" | "planning";
  readonly focusAreas: readonly string[];
  readonly bio?: string;
  readonly phone?: string;
};

export type ReportingRelationship = {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly managerId: string;
  readonly effectiveFrom: string;
};

export type DelegationGrant = {
  readonly id: string;
  readonly organizationId: string;
  readonly delegatorId: string;
  readonly delegateId: string;
  readonly scope: "decisions" | "users" | "finance" | "operations" | "all";
  readonly label: string;
  readonly startsAt: string;
  readonly endsAt?: string;
  readonly active: boolean;
};

export type PlatformOrganization = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly status: OrganizationStatus;
  readonly timeZone: string;
  readonly locale: string;
  readonly currency: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PlatformUser = {
  readonly id: string;
  readonly organizationId: string;
  readonly workspaceId: string;
  readonly email: string;
  readonly name: string;
  readonly status: UserStatus;
  readonly role: RoleSlug;
  readonly businessUnitId?: string;
  readonly departmentId?: string;
  readonly teamId?: string;
  readonly managerId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type OrgHierarchyNode = {
  readonly id: string;
  readonly type: "organization" | "business_unit" | "department" | "team" | "user";
  readonly label: string;
  readonly parentId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly children: readonly OrgHierarchyNode[];
};

export type PermissionMatrixEntry = {
  readonly role: RoleSlug;
  readonly roleLabel: string;
  readonly module: string;
  readonly canRead: boolean;
  readonly canWrite: boolean;
};

export type OrganizationHealthSnapshot = {
  readonly organizationId: string;
  readonly organizationName: string;
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly vacantCriticalRoles: readonly string[];
  readonly leadershipStructure: readonly { name: string; title: string; role: RoleSlug }[];
  readonly activeDelegations: number;
  readonly healthScore: number;
  readonly summary: string;
};

export type CreateOrganizationInput = {
  readonly name: string;
  readonly slug: string;
  readonly timeZone?: string;
  readonly locale?: string;
  readonly currency?: string;
};

export type InviteUserInput = {
  readonly email: string;
  readonly name: string;
  readonly role: RoleSlug;
  readonly departmentId?: string;
  readonly teamId?: string;
  readonly managerId?: string;
};

export type AssignRoleInput = {
  readonly userId: string;
  readonly role: RoleSlug;
};

export type CreateDelegationInput = {
  readonly delegateId: string;
  readonly scope: DelegationGrant["scope"];
  readonly label: string;
  readonly endsAt?: string;
};

export type PlatformAuditEntry = {
  readonly id: string;
  readonly timestamp: string;
  readonly organizationId: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly action: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly detail: string;
};
