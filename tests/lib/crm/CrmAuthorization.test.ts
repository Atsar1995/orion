import { describe, expect, it } from "vitest";
import "@/lib/crm/security";
import { CRM_PERMISSIONS } from "@/lib/crm/security/crm-permission-catalog";
import { defaultCrmAuthorizationService } from "@/lib/crm/security/CrmAuthorizationService";
import {
  listCrmRouteRules,
  resolveCrmRoutePermission,
} from "@/lib/crm/security/crm-permission-catalog";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { defaultAuthorizationService } from "@/lib/platform/security/AuthorizationService";
import { AuthorizationMiddleware } from "@/lib/platform/security/AuthorizationMiddleware";
import { createAuthenticationContext } from "@/lib/platform/security/AuthenticationContext";
import { AuthorizationError } from "@/lib/platform/security/AuthorizationResult";
import { CrmRole } from "@/lib/platform/security/Role";
import { defaultRoleRegistry } from "@/lib/platform/security/RoleRegistry";
import { SystemRole } from "@/lib/auth/roles";
import { UserStatus } from "@/types/auth";
import type { ServiceContext } from "@/types/services";

const ORG_A = "org-orania";
const ORG_B = "org-other";

function contextFor(role: ServiceContext["role"], organizationId = ORG_A): ServiceContext {
  return {
    organizationId,
    workspaceId: "workspace-orania",
    userId: `user-${role}`,
    role,
  };
}

describe("CRM Authorization (P-008.12)", () => {
  it("registers the CRM permission catalog", () => {
    expect(CRM_PERMISSIONS.admin).toBe("crm:admin:manage");
    expect(CRM_PERMISSIONS.leadCreate).toBe("crm:lead:create");
    expect(CRM_PERMISSIONS.eventReplay).toBe("crm:event:replay");
    expect(Object.keys(CRM_PERMISSIONS)).toHaveLength(24);
  });

  it("maps CRM API routes to permissions", () => {
    expect(resolveCrmRoutePermission("GET", "/api/crm/leads")).toBe(CRM_PERMISSIONS.leadRead);
    expect(resolveCrmRoutePermission("POST", "/api/crm/leads")).toBe(CRM_PERMISSIONS.leadCreate);
    expect(resolveCrmRoutePermission("POST", "/api/crm/leads/convert")).toBe(
      CRM_PERMISSIONS.leadQualify,
    );
    expect(resolveCrmRoutePermission("POST", "/api/crm/opportunities")).toBe(
      CRM_PERMISSIONS.opportunityWrite,
    );
    expect(resolveCrmRoutePermission("GET", "/api/crm/intelligence/dashboard")).toBe(
      CRM_PERMISSIONS.intelligenceRead,
    );
    expect(resolveCrmRoutePermission("POST", "/api/crm/unknown/action")).toBe("crm:unknown:write");
    expect(listCrmRouteRules().length).toBeGreaterThan(20);
  });

  it("allows CRM administrator to manage accounts and replay events", () => {
    const context = contextFor(SystemRole.OrganizationAdmin);
    expect(defaultCrmAuthorizationService.canAdministerCrm(context)).toBe(true);
    expect(defaultCrmAuthorizationService.canManageAccount(context)).toBe(true);
    expect(defaultCrmAuthorizationService.canReplayEvents(context)).toBe(true);
  });

  it("allows sales executive to create leads but not qualify them", () => {
    const context = contextFor(SystemRole.Staff);
    expect(defaultCrmAuthorizationService.canCreateLead(context)).toBe(true);
    expect(defaultCrmAuthorizationService.canQualifyLead(context)).toBe(false);
    expect(defaultCrmAuthorizationService.canCreateOpportunity(context)).toBe(true);
  });

  it("allows sales manager to qualify leads and approve quotes", () => {
    const context = contextFor(SystemRole.Manager);
    expect(defaultCrmAuthorizationService.canQualifyLead(context)).toBe(true);
    expect(defaultCrmAuthorizationService.canApproveQuote(context)).toBe(true);
    expect(defaultCrmAuthorizationService.canCreateSalesOrder(context)).toBe(false);
  });

  it("allows sales director to create sales orders", () => {
    const context = contextFor(SystemRole.Executive);
    expect(defaultCrmAuthorizationService.canCreateSalesOrder(context)).toBe(true);
    expect(defaultCrmAuthorizationService.canReadIntelligence(context)).toBe(true);
    expect(defaultCrmAuthorizationService.canReplayEvents(context)).toBe(false);
  });

  it("denies read-only users from write permissions", () => {
    const context = contextFor(SystemRole.ReadOnly);
    expect(defaultCrmAuthorizationService.canCreateLead(context)).toBe(false);
    expect(defaultCrmAuthorizationService.canManageCase(context)).toBe(false);
    expect(defaultCrmAuthorizationService.canManageConfiguration(context)).toBe(false);
  });

  it("denies anonymous service context when unauthenticated", () => {
    const context = contextFor(SystemRole.ReadOnly);
    const result = defaultAuthorizationService.authorizeServiceContext(
      context,
      CRM_PERMISSIONS.leadCreate,
      { authenticated: false },
    );
    expect(result.allowed).toBe(false);
  });

  it("denies cross-organization access", () => {
    const identity = createIdentityContextFromServiceContext(
      contextFor(SystemRole.OrganizationAdmin, ORG_A),
    );
    const result = defaultAuthorizationService.authorize(identity, CRM_PERMISSIONS.accountRead, {
      resourceOrganizationId: ORG_B,
    });
    expect(result.allowed).toBe(false);
  });

  it("returns 401 for unauthenticated middleware requests when fail-closed is enabled", () => {
    const previous = process.env.ORION_AUTH_FAIL_CLOSED;
    process.env.ORION_AUTH_FAIL_CLOSED = "true";

    try {
      const middleware = new AuthorizationMiddleware();
      const authentication = createAuthenticationContext(null);

      expect(() =>
        middleware.authorize(authentication, {
          permission: CRM_PERMISSIONS.leadRead,
        }),
      ).toThrow(AuthorizationError);

      try {
        middleware.authorize(authentication, {
          permission: CRM_PERMISSIONS.leadRead,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorizationError);
        expect((error as AuthorizationError).code).toBe("UNAUTHORIZED");
      }
    } finally {
      process.env.ORION_AUTH_FAIL_CLOSED = previous;
    }
  });

  it("returns 403 for authenticated users without explicit CRM grants", () => {
    const middleware = new AuthorizationMiddleware();
    const authentication = createAuthenticationContext({
      user: {
        id: "user-readonly",
        email: "readonly@orion.local",
        name: "Read Only",
        status: UserStatus.Active,
        organizationId: ORG_A,
        workspaceId: "workspace-orania",
        role: SystemRole.ReadOnly,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      expiresAt: new Date(Date.now() + 60_000),
      activeWorkspace: {
        id: "workspace-orania",
        organizationId: ORG_A,
        name: "Default",
        slug: "default",
        modules: ["crm"],
      },
    });

    expect(() =>
      middleware.authorize(authentication, {
        permission: CRM_PERMISSIONS.leadCreate,
      }),
    ).toThrow(AuthorizationError);

    try {
      middleware.authorize(authentication, {
        permission: CRM_PERMISSIONS.leadCreate,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationError);
      expect((error as AuthorizationError).code).toBe("FORBIDDEN");
    }
  });

  it("grants CRM auditor read-only audit and intelligence access", () => {
    const permissions = defaultRoleRegistry.getPermissionsForRole(CrmRole.CrmAuditor);
    expect(permissions.has(CRM_PERMISSIONS.auditRead)).toBe(true);
    expect(permissions.has(CRM_PERMISSIONS.intelligenceRead)).toBe(true);
    expect(permissions.has(CRM_PERMISSIONS.leadCreate)).toBe(false);
  });

  it("grants service account lead creation for integration flows", () => {
    const context = contextFor(SystemRole.ServiceAccount);
    expect(defaultCrmAuthorizationService.canCreateLead(context)).toBe(true);
    expect(defaultCrmAuthorizationService.canManageConfiguration(context)).toBe(true);
  });
});
