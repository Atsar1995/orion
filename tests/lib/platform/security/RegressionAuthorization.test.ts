import { describe, expect, it } from "vitest";
import { getPermissionsForRole } from "@/lib/identity/role-permissions";
import { canAccess } from "@/lib/auth/permissions";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { defaultAuthorizationService } from "@/lib/platform/security/AuthorizationService";
import { HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";
import { SystemRole } from "@/lib/auth/roles";

describe("RegressionAuthorization", () => {
  it("preserves existing module permission helpers", () => {
    const permissions = getPermissionsForRole(SystemRole.Executive);
    expect(canAccess({ permissions }, "executive", "read")).toBe(true);
    expect(canAccess({ permissions }, "executive", "write")).toBe(true);
  });

  it("preserves legacy executive dev context authorization path", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-executive",
      role: SystemRole.Executive,
    });

    const result = defaultAuthorizationService.authorize(identity, HCM_PERMISSIONS.employeeRead);
    expect(result.allowed).toBe(true);
  });

  it("does not grant write permissions to readonly users", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-readonly",
      role: SystemRole.ReadOnly,
    });

    const result = defaultAuthorizationService.authorize(identity, HCM_PERMISSIONS.payrollWrite);
    expect(result.allowed).toBe(false);
  });
});
