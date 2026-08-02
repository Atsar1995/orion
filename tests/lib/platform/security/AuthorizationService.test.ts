import { describe, expect, it } from "vitest";
import { AuthorizationError } from "@/lib/platform/security/AuthorizationResult";
import {
  AuthorizationService,
  defaultAuthorizationService,
} from "@/lib/platform/security/AuthorizationService";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";
import { SystemRole } from "@/lib/auth/roles";

describe("AuthorizationService", () => {
  it("allows authorized operations within organization boundary", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-admin",
      role: SystemRole.OrganizationAdmin,
    });

    const result = defaultAuthorizationService.authorize(
      identity,
      HCM_PERMISSIONS.employeeWrite,
    );

    expect(result.allowed).toBe(true);
  });

  it("denies by default for insufficient role", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-readonly",
      role: SystemRole.ReadOnly,
    });

    const result = defaultAuthorizationService.authorize(
      identity,
      HCM_PERMISSIONS.employeeWrite,
    );

    expect(result.allowed).toBe(false);
  });

  it("throws AuthorizationError on assert failure", () => {
    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-readonly",
      role: SystemRole.ReadOnly,
    });

    expect(() =>
      defaultAuthorizationService.assert(identity, HCM_PERMISSIONS.orgWrite),
    ).toThrow(AuthorizationError);
  });

  it("invokes audit hook on denial", () => {
    const service = new AuthorizationService();
    const audited: string[] = [];
    service.setAuditHook(({ result }) => {
      audited.push(result.permission);
    });

    const identity = createIdentityContextFromServiceContext({
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-readonly",
      role: SystemRole.ReadOnly,
    });

    service.authorize(identity, HCM_PERMISSIONS.payrollWrite);
    expect(audited).toContain(HCM_PERMISSIONS.payrollWrite);
  });
});
