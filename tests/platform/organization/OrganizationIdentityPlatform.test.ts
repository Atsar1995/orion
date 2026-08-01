import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryOrganizationPlatformRepository } from "@/lib/platform/organization/repository/InMemoryOrganizationPlatformRepository";
import { OrganizationService } from "@/lib/platform/organization/OrganizationService";
import { UserManagementService } from "@/lib/platform/organization/UserManagementService";
import { RoleService } from "@/lib/platform/organization/RoleService";
import { PermissionService } from "@/lib/platform/organization/PermissionService";
import { DelegationService } from "@/lib/platform/organization/DelegationService";
import { HierarchyService } from "@/lib/platform/organization/HierarchyService";
import { PlatformIdentityService } from "@/lib/platform/organization/PlatformIdentityService";
import type { ServiceContext } from "@/types/services";

const EXEC_CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const ADMIN_CONTEXT: ServiceContext = {
  ...EXEC_CONTEXT,
  userId: "user-org-admin",
  role: "organization_admin",
};

describe("Mission P-005 Organization & Identity Platform", () => {
  let repository: InMemoryOrganizationPlatformRepository;
  let organizationService: OrganizationService;
  let userManagementService: UserManagementService;
  let roleService: RoleService;
  let permissionService: PermissionService;
  let delegationService: DelegationService;
  let hierarchyService: HierarchyService;
  let identityService: PlatformIdentityService;

  beforeEach(() => {
    repository = new InMemoryOrganizationPlatformRepository();
    organizationService = new OrganizationService(repository);
    userManagementService = new UserManagementService(repository);
    roleService = new RoleService(repository);
    permissionService = new PermissionService();
    delegationService = new DelegationService(repository);
    hierarchyService = new HierarchyService(repository);
    identityService = new PlatformIdentityService(repository);
  });

  it("lists seeded organization structure", () => {
    const orgs = organizationService.list(EXEC_CONTEXT);
    expect(orgs.length).toBeGreaterThan(0);

    const structure = organizationService.getStructure(EXEC_CONTEXT);
    expect(structure.businessUnits.length).toBeGreaterThanOrEqual(2);
    expect(structure.departments.length).toBeGreaterThanOrEqual(3);
    expect(structure.teams.length).toBeGreaterThanOrEqual(2);
  });

  it("builds hierarchical organization tree", () => {
    const tree = hierarchyService.buildTree(EXEC_CONTEXT);
    expect(tree.type).toBe("organization");
    expect(tree.children.length).toBeGreaterThan(0);
    expect(tree.children.some((node) => node.type === "business_unit")).toBe(true);
  });

  it("detects circular reporting relationships", () => {
    expect(hierarchyService.validateReporting("user-manager", "user-executive", EXEC_CONTEXT)).toBe(
      true,
    );
    expect(hierarchyService.validateReporting("user-executive", "user-manager", EXEC_CONTEXT)).toBe(
      false,
    );
  });

  it("resolves verified identities", () => {
    const identity = identityService.resolveVerifiedIdentity("user-executive", EXEC_CONTEXT);
    expect(identity?.verified).toBe(true);
    expect(identity?.user.email).toContain("@");
    expect(identity?.permissions.length).toBeGreaterThan(0);
  });

  it("computes organization health with leadership and vacant roles", () => {
    const health = userManagementService.getOrganizationHealth(EXEC_CONTEXT);
    expect(health.healthScore).toBeGreaterThan(0);
    expect(health.leadershipStructure.length).toBeGreaterThan(0);
    expect(health.vacantCriticalRoles.some((role) => role.includes("Finance"))).toBe(true);
  });

  it("invites users and rejects invalid email", () => {
    expect(() =>
      userManagementService.inviteUser(
        { email: "bad-email", name: "Bad", role: "analyst" },
        ADMIN_CONTEXT,
        "Admin",
      ),
    ).toThrow("INVALID_EMAIL");

    const user = userManagementService.inviteUser(
      { email: "new.user@orion.dev", name: "New User", role: "analyst" },
      ADMIN_CONTEXT,
      "Admin",
    );

    expect(user.email).toBe("new.user@orion.dev");
    expect(repository.listAudit(ADMIN_CONTEXT.organizationId).some((entry) => entry.action === "user.invited")).toBe(
      true,
    );
  });

  it("rejects duplicate user invitation", () => {
    expect(() =>
      userManagementService.inviteUser(
        { email: "founder@orion.dev", name: "Duplicate", role: "analyst" },
        ADMIN_CONTEXT,
        "Admin",
      ),
    ).toThrow("DUPLICATE_USER");
  });

  it("assigns roles with permission evaluation", () => {
    const result = roleService.assignRole(
      { userId: "user-analyst", role: "manager" },
      ADMIN_CONTEXT,
      "Admin",
    );

    expect(result?.user.role).toBe("manager");
    expect(result?.permissions.length).toBeGreaterThan(0);
  });

  it("denies role assignment without admin permission", () => {
    expect(() =>
      roleService.assignRole(
        { userId: "user-analyst", role: "manager" },
        EXEC_CONTEXT,
        "Executive",
      ),
    ).toThrow("PERMISSION_DENIED");
  });

  it("builds permission matrix for all platform roles", () => {
    const matrix = permissionService.buildMatrix();
    expect(matrix.length).toBeGreaterThan(0);
    expect(matrix.some((entry) => entry.role === "executive" && entry.module === "crm")).toBe(true);
  });

  it("creates and resolves delegations", () => {
    const delegation = delegationService.create(
      {
        delegateId: "user-manager",
        scope: "decisions",
        label: "Decision delegation test",
      },
      EXEC_CONTEXT,
      "Executive",
    );

    expect(delegation.active).toBe(true);

    const delegateId = delegationService.resolveDelegateForScope(
      "user-executive",
      "decisions",
      EXEC_CONTEXT,
    );
    expect(delegateId).toBeTruthy();
  });

  it("rejects duplicate organization creation", () => {
    expect(() =>
      organizationService.create(
        { name: "Duplicate", slug: "orania" },
        { ...EXEC_CONTEXT, role: "super_admin" },
        "Super Admin",
      ),
    ).toThrow("DUPLICATE_ORGANIZATION");
  });
});
