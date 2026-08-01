import { DEMO_ORGANIZATION } from "@/lib/identity/data/demo-organizations";
import { DEMO_USERS } from "@/lib/identity/data/demo-users";
import {
  createOrgId,
  type OrganizationPlatformRepository,
} from "@/lib/platform/organization/repository/OrganizationPlatformRepository";
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
import { OrganizationStatus, UserStatus } from "@/types/auth";

const ORG_ID = DEMO_ORGANIZATION.id;

function buildSeedPlatform(): {
  organization: PlatformOrganization;
  businessUnits: BusinessUnit[];
  departments: Department[];
  teams: Team[];
  users: PlatformUser[];
  profiles: ExecutiveProfile[];
  reporting: ReportingRelationship[];
  delegations: DelegationGrant[];
} {
  const now = new Date().toISOString();

  const organization: PlatformOrganization = {
    id: ORG_ID,
    name: DEMO_ORGANIZATION.name,
    slug: DEMO_ORGANIZATION.slug,
    status: OrganizationStatus.Active,
    timeZone: DEMO_ORGANIZATION.timeZone,
    locale: DEMO_ORGANIZATION.locale,
    currency: DEMO_ORGANIZATION.defaultSettings.currency,
    createdAt: now,
    updatedAt: now,
  };

  const businessUnits: BusinessUnit[] = [
    {
      id: "bu-hospitality",
      organizationId: ORG_ID,
      name: "Hospitality",
      slug: "hospitality",
      description: "Hotels, guest experience, and revenue operations.",
    },
    {
      id: "bu-corporate",
      organizationId: ORG_ID,
      name: "Corporate",
      slug: "corporate",
      description: "Finance, strategy, and executive leadership.",
    },
  ];

  const departments: Department[] = [
    {
      id: "dept-operations",
      organizationId: ORG_ID,
      businessUnitId: "bu-hospitality",
      name: "Operations",
      slug: "operations",
      headUserId: "user-manager",
    },
    {
      id: "dept-finance",
      organizationId: ORG_ID,
      businessUnitId: "bu-corporate",
      name: "Finance",
      slug: "finance",
    },
    {
      id: "dept-sales",
      organizationId: ORG_ID,
      businessUnitId: "bu-hospitality",
      name: "Sales & CRM",
      slug: "sales",
    },
    {
      id: "dept-executive",
      organizationId: ORG_ID,
      businessUnitId: "bu-corporate",
      name: "Executive Office",
      slug: "executive-office",
      headUserId: "user-executive",
    },
  ];

  const teams: Team[] = [
    {
      id: "team-guest-exp",
      organizationId: ORG_ID,
      departmentId: "dept-operations",
      name: "Guest Experience",
      slug: "guest-experience",
      leadUserId: "user-manager",
    },
    {
      id: "team-revenue",
      organizationId: ORG_ID,
      departmentId: "dept-sales",
      name: "Revenue",
      slug: "revenue",
    },
    {
      id: "team-exec-leadership",
      organizationId: ORG_ID,
      departmentId: "dept-executive",
      name: "Executive Leadership",
      slug: "executive-leadership",
      leadUserId: "user-executive",
    },
  ];

  const users: PlatformUser[] = DEMO_USERS.map((user) => ({
    id: user.id,
    organizationId: user.organizationId,
    workspaceId: user.workspaceId,
    email: user.email,
    name: user.name,
    status: user.status,
    role: user.role,
    businessUnitId:
      user.id === "user-executive" || user.id === "user-org-admin"
        ? "bu-corporate"
        : user.id === "user-manager"
          ? "bu-hospitality"
          : "bu-corporate",
    departmentId:
      user.id === "user-executive"
        ? "dept-executive"
        : user.id === "user-manager"
          ? "dept-operations"
          : user.id === "user-analyst"
            ? "dept-finance"
            : "dept-executive",
    teamId:
      user.id === "user-executive"
        ? "team-exec-leadership"
        : user.id === "user-manager"
          ? "team-guest-exp"
          : undefined,
    managerId:
      user.id === "user-executive"
        ? undefined
        : user.id === "user-manager"
          ? "user-executive"
          : user.id === "user-analyst"
            ? "user-manager"
            : "user-org-admin",
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));

  const profiles: ExecutiveProfile[] = [
    {
      userId: "user-executive",
      title: "Founder & CEO",
      operatingMode: "growth",
      focusAreas: ["Strategy", "Guest Experience", "Revenue"],
      bio: "Executive leader for ORANIA Hospitality Group.",
    },
  ];

  const reporting: ReportingRelationship[] = users
    .filter((user) => user.managerId)
    .map((user) => ({
      id: `report-${user.id}`,
      organizationId: ORG_ID,
      userId: user.id,
      managerId: user.managerId!,
      effectiveFrom: now,
    }));

  const delegations: DelegationGrant[] = [
    {
      id: "deleg-ops-finance",
      organizationId: ORG_ID,
      delegatorId: "user-executive",
      delegateId: "user-manager",
      scope: "operations",
      label: "Operations decision delegation",
      startsAt: now,
      active: true,
    },
  ];

  return { organization, businessUnits, departments, teams, users, profiles, reporting, delegations };
}

/** In-memory organization platform repository (Mission P-005). */
export class InMemoryOrganizationPlatformRepository implements OrganizationPlatformRepository {
  readonly entityName = "OrganizationPlatform" as const;

  private readonly organizations = new Map<string, PlatformOrganization>();
  private readonly businessUnits: BusinessUnit[] = [];
  private readonly departments: Department[] = [];
  private readonly teams: Team[] = [];
  private readonly users: PlatformUser[] = [];
  private readonly profiles = new Map<string, ExecutiveProfile>();
  private readonly reporting: ReportingRelationship[] = [];
  private readonly delegations: DelegationGrant[] = [];
  private readonly audit: PlatformAuditEntry[] = [];

  constructor(seed = buildSeedPlatform()) {
    this.organizations.set(seed.organization.id, seed.organization);
    this.businessUnits.push(...seed.businessUnits);
    this.departments.push(...seed.departments);
    this.teams.push(...seed.teams);
    this.users.push(...seed.users);
    for (const profile of seed.profiles) {
      this.profiles.set(profile.userId, profile);
    }
    this.reporting.push(...seed.reporting);
    this.delegations.push(...seed.delegations);
  }

  listOrganizations(): PlatformOrganization[] {
    return [...this.organizations.values()];
  }

  findOrganization(id: string): PlatformOrganization | null {
    return this.organizations.get(id) ?? null;
  }

  findOrganizationBySlug(slug: string): PlatformOrganization | null {
    return [...this.organizations.values()].find((org) => org.slug === slug) ?? null;
  }

  createOrganization(input: CreateOrganizationInput): PlatformOrganization {
    const existing = this.findOrganizationBySlug(input.slug);
    if (existing) {
      throw new Error("DUPLICATE_ORGANIZATION");
    }

    const now = new Date().toISOString();
    const organization: PlatformOrganization = {
      id: createOrgId(),
      name: input.name,
      slug: input.slug,
      status: OrganizationStatus.Active,
      timeZone: input.timeZone ?? "UTC",
      locale: input.locale ?? "en-GB",
      currency: input.currency ?? "USD",
      createdAt: now,
      updatedAt: now,
    };

    this.organizations.set(organization.id, organization);
    return organization;
  }

  listBusinessUnits(organizationId: string): BusinessUnit[] {
    return this.businessUnits.filter((entry) => entry.organizationId === organizationId);
  }

  listDepartments(organizationId: string): Department[] {
    return this.departments.filter((entry) => entry.organizationId === organizationId);
  }

  listTeams(organizationId: string): Team[] {
    return this.teams.filter((entry) => entry.organizationId === organizationId);
  }

  listUsers(organizationId: string): PlatformUser[] {
    return this.users.filter((entry) => entry.organizationId === organizationId);
  }

  findUser(id: string, organizationId: string): PlatformUser | null {
    return this.users.find((entry) => entry.id === id && entry.organizationId === organizationId) ?? null;
  }

  findUserByEmail(email: string, organizationId: string): PlatformUser | null {
    const normalized = email.trim().toLowerCase();
    return (
      this.users.find(
        (entry) =>
          entry.organizationId === organizationId && entry.email.toLowerCase() === normalized,
      ) ?? null
    );
  }

  createUser(organizationId: string, input: InviteUserInput): PlatformUser {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new Error("INVALID_EMAIL");
    }

    if (this.findUserByEmail(input.email, organizationId)) {
      throw new Error("DUPLICATE_USER");
    }

    const now = new Date().toISOString();
    const user: PlatformUser = {
      id: createOrgId(),
      organizationId,
      workspaceId: "workspace-orania",
      email: input.email.trim().toLowerCase(),
      name: input.name,
      status: UserStatus.Active,
      role: input.role,
      departmentId: input.departmentId,
      teamId: input.teamId,
      managerId: input.managerId,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(user);

    if (input.managerId) {
      this.reporting.push({
        id: createOrgId(),
        organizationId,
        userId: user.id,
        managerId: input.managerId,
        effectiveFrom: now,
      });
    }

    return user;
  }

  updateUserRole(userId: string, organizationId: string, role: PlatformUser["role"]): PlatformUser | null {
    const index = this.users.findIndex(
      (entry) => entry.id === userId && entry.organizationId === organizationId,
    );

    if (index < 0) {
      return null;
    }

    const updated = {
      ...this.users[index]!,
      role,
      updatedAt: new Date().toISOString(),
    };

    this.users[index] = updated;
    return updated;
  }

  getExecutiveProfile(userId: string, organizationId: string): ExecutiveProfile | null {
    const user = this.findUser(userId, organizationId);
    if (!user) {
      return null;
    }

    return this.profiles.get(userId) ?? null;
  }

  listReportingRelationships(organizationId: string): ReportingRelationship[] {
    return this.reporting.filter((entry) => entry.organizationId === organizationId);
  }

  listDelegations(organizationId: string): DelegationGrant[] {
    return this.delegations.filter((entry) => entry.organizationId === organizationId);
  }

  createDelegation(
    organizationId: string,
    delegatorId: string,
    input: Omit<DelegationGrant, "id" | "organizationId" | "delegatorId" | "active"> & {
      active?: boolean;
    },
  ): DelegationGrant {
    const delegation: DelegationGrant = {
      id: createOrgId(),
      organizationId,
      delegatorId,
      delegateId: input.delegateId,
      scope: input.scope,
      label: input.label,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      active: input.active ?? true,
    };

    this.delegations.push(delegation);
    return delegation;
  }

  addAudit(entry: Omit<PlatformAuditEntry, "id" | "timestamp">): PlatformAuditEntry {
    const record: PlatformAuditEntry = {
      ...entry,
      id: createOrgId(),
      timestamp: new Date().toISOString(),
    };

    this.audit.unshift(record);
    return record;
  }

  listAudit(organizationId: string): PlatformAuditEntry[] {
    return this.audit.filter((entry) => entry.organizationId === organizationId);
  }
}

export const defaultOrganizationPlatformRepository = new InMemoryOrganizationPlatformRepository();
