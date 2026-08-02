import { describe, expect, it } from "vitest";
import { evaluateOrganizationBoundary } from "@/lib/platform/security/AuthorizationPolicy";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";
import { SystemRole } from "@/lib/auth/roles";

describe("OrganizationIsolation", () => {
  it("allows access within the same organization", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-a",
      workspaceId: "workspace-a",
      userId: "user-a",
      role: SystemRole.Manager,
    });

    const boundary = evaluateOrganizationBoundary({
      identity,
      permission: HCM_PERMISSIONS.employeeRead,
      resourceOrganizationId: "org-a",
    });

    expect(boundary.allowed).toBe(true);
    expect(boundary.crossOrganization).toBe(false);
  });

  it("denies cross-organization access for standard roles", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-a",
      workspaceId: "workspace-a",
      userId: "user-a",
      role: SystemRole.Manager,
    });

    const boundary = evaluateOrganizationBoundary({
      identity,
      permission: HCM_PERMISSIONS.employeeRead,
      resourceOrganizationId: "org-b",
    });

    expect(boundary.allowed).toBe(false);
  });

  it("allows super admin cross-organization access with audit flag", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-a",
      workspaceId: "workspace-a",
      userId: "user-super",
      role: SystemRole.SuperAdmin,
    });

    const boundary = evaluateOrganizationBoundary({
      identity,
      permission: HCM_PERMISSIONS.employeeRead,
      resourceOrganizationId: "org-b",
    });

    expect(boundary.allowed).toBe(true);
    expect(boundary.crossOrganization).toBe(true);
  });
});
