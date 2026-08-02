import { describe, expect, it } from "vitest";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { defaultPermissionEvaluator } from "@/lib/platform/security/PermissionEvaluator";
import { HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";
import { SystemRole } from "@/lib/auth/roles";

describe("PermissionEvaluator", () => {
  it("allows granted domain permissions", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-admin",
      role: SystemRole.OrganizationAdmin,
    });

    expect(
      defaultPermissionEvaluator.evaluate({
        identity,
        permission: HCM_PERMISSIONS.employeeWrite,
      }),
    ).toBe(true);
  });

  it("denies permissions outside role profile", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-guest",
      role: SystemRole.ReadOnly,
    });

    expect(
      defaultPermissionEvaluator.evaluate({
        identity,
        permission: HCM_PERMISSIONS.employeeWrite,
      }),
    ).toBe(false);
  });

  it("lists effective permissions for an identity", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-manager",
      role: SystemRole.Manager,
    });

    const permissions = defaultPermissionEvaluator.listEffectivePermissions(identity);
    expect(permissions.length).toBeGreaterThan(0);
    expect(permissions).toContain(HCM_PERMISSIONS.timeApprove);
  });
});
