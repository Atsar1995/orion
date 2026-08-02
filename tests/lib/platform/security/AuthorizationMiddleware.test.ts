import { describe, expect, it, afterEach } from "vitest";
import { createAuthenticationContext } from "@/lib/platform/security/AuthenticationContext";
import { AuthorizationMiddleware } from "@/lib/platform/security/AuthorizationMiddleware";
import { AuthorizationError } from "@/lib/platform/security/AuthorizationResult";
import { HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";
import { getPermissionsForRole } from "@/lib/identity/role-permissions";
import { SystemRole } from "@/lib/auth/roles";
import type { RoleSlug, Session } from "@/types/auth";
import { UserStatus } from "@/types/auth";

function createSession(role: RoleSlug): Session {
  return {
    user: {
      id: "user-test",
      email: "test@orion.local",
      name: "Test User",
      status: UserStatus.Active,
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      role,
      permissions: getPermissionsForRole(role),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    expiresAt: new Date(Date.now() + 60_000),
    activeWorkspace: {
      id: "workspace-orania",
      organizationId: "org-orania",
      name: "Default",
      slug: "default",
      modules: ["executive"],
    },
  };
}

describe("AuthorizationMiddleware", () => {
  const originalFailClosed = process.env.ORION_AUTH_FAIL_CLOSED;

  afterEach(() => {
    process.env.ORION_AUTH_FAIL_CLOSED = originalFailClosed;
  });

  it("authorizes authenticated identity with required permission", () => {
    const middleware = new AuthorizationMiddleware();
    const authentication = createAuthenticationContext(createSession(SystemRole.OrganizationAdmin));

    const authorized = middleware.authorize(authentication, {
      permission: HCM_PERMISSIONS.employeeWrite,
    });

    expect(authorized.context.userId).toBe("user-test");
  });

  it("uses development fallback when fail-closed is disabled", () => {
    process.env.ORION_AUTH_FAIL_CLOSED = "false";
    const middleware = new AuthorizationMiddleware();
    const authentication = createAuthenticationContext(null);

    const authorized = middleware.authorize(authentication, {
      permission: HCM_PERMISSIONS.employeeRead,
    });

    expect(authorized.context.role).toBe(SystemRole.Executive);
  });

  it("rejects unauthorized permission for readonly role", () => {
    const middleware = new AuthorizationMiddleware();
    const authentication = createAuthenticationContext(createSession(SystemRole.ReadOnly));

    expect(() =>
      middleware.authorize(authentication, {
        permission: HCM_PERMISSIONS.employeeWrite,
      }),
    ).toThrow(AuthorizationError);
  });

  it("requires authentication when fail-closed is enabled", () => {
    process.env.ORION_AUTH_FAIL_CLOSED = "true";
    const middleware = new AuthorizationMiddleware();
    const authentication = createAuthenticationContext(null);

    expect(() => middleware.authorize(authentication)).toThrow(AuthorizationError);
  });
});
