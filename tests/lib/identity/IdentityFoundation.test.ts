import { describe, expect, it, beforeEach } from "vitest";
import { IdentityService } from "@/lib/identity/IdentityService";
import { UserRepository, OrganizationRepository } from "@/lib/identity/repositories";
import { DEMO_USERS, hashPassword, DEMO_PASSWORD } from "@/lib/identity/data/demo-users";
import { clearAuditLog, getAuditLog, AuditEventType } from "@/lib/auth/audit";
import { SystemRole } from "@/lib/auth/roles";
import { UserStatus } from "@/types/auth";
import { getPermissionsForRole } from "@/lib/identity/role-permissions";
import { canAccessRoute } from "@/lib/identity/route-access";
import { signSessionToken, verifySessionToken } from "@/lib/identity/session-token";
import { getSessionSecret } from "@/lib/identity/constants";
import { getDisplayInitials } from "@/lib/identity/user-display";

describe("Mission S1A identity foundation", () => {
  beforeEach(() => {
    clearAuditLog();
  });

  it("authenticates demo users with valid credentials", async () => {
    const service = new IdentityService();
    const result = await service.login({
      email: "founder@orion.dev",
      password: DEMO_PASSWORD,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.session.user.role).toBe(SystemRole.Executive);
      expect(result.data.token.length).toBeGreaterThan(10);
    }

    expect(getAuditLog().some((event) => event.type === AuditEventType.LoginSuccess)).toBe(
      true,
    );
  });

  it("rejects invalid credentials and records audit failure", async () => {
    const service = new IdentityService();
    const result = await service.login({
      email: "founder@orion.dev",
      password: "wrong-password",
    });

    expect(result.success).toBe(false);
    expect(getAuditLog().some((event) => event.type === AuditEventType.LoginFailure)).toBe(
      true,
    );
  });

  it("assigns RBAC permissions by role", () => {
    const executivePermissions = getPermissionsForRole(SystemRole.Executive);
    const readonlyPermissions = getPermissionsForRole(SystemRole.ReadOnly);

    expect(executivePermissions.some((entry) => entry.module === "crm")).toBe(true);
    expect(readonlyPermissions.some((entry) => entry.module === "settings")).toBe(false);
  });

  it("protects engineering routes for super admin only", () => {
    const superAdmin = getPermissionsForRole(SystemRole.SuperAdmin);
    const analyst = getPermissionsForRole(SystemRole.Analyst);

    expect(
      canAccessRoute({
        pathname: "/engineering",
        role: SystemRole.SuperAdmin,
        permissions: superAdmin,
      }),
    ).toBe(true);

    expect(
      canAccessRoute({
        pathname: "/engineering",
        role: SystemRole.Analyst,
        permissions: analyst,
      }),
    ).toBe(false);
  });

  it("signs and verifies session tokens", async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = await signSessionToken(
      {
        sid: "session-1",
        sub: "user-executive",
        email: "founder@orion.dev",
        name: "Mohammad Shafi",
        role: SystemRole.Executive,
        organizationId: "org-orania",
        workspaceId: "workspace-orania",
        permissions: getPermissionsForRole(SystemRole.Executive),
        iat: now,
        exp: now + 3600,
      },
      getSessionSecret(),
    );

    const payload = await verifySessionToken(token, getSessionSecret());
    expect(payload?.email).toBe("founder@orion.dev");
  });

  it("rejects inactive accounts", async () => {
    const inactiveUser = {
      ...DEMO_USERS[2]!,
      status: UserStatus.Suspended,
    };
    const service = new IdentityService(
      new UserRepository([inactiveUser]),
      new OrganizationRepository(),
    );

    const result = await service.login({
      email: inactiveUser.email,
      password: DEMO_PASSWORD,
    });

    expect(result.success).toBe(false);
  });

  it("derives display initials from names", () => {
    expect(getDisplayInitials("Mohammad Shafi")).toBe("MS");
    expect(getDisplayInitials("Analyst")).toBe("AN");
  });

  it("hashes passwords deterministically", () => {
    expect(hashPassword("orion-dev")).toBe(hashPassword("orion-dev"));
  });
});
