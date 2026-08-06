import { describe, expect, it } from "vitest";
import "@/lib/procurement/security";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import { defaultProcurementAuthorizationService } from "@/lib/procurement/security/ProcurementAuthorizationService";
import {
  listProcurementRouteRules,
  resolveProcurementRoutePermission,
} from "@/lib/procurement/security/procurement-permission-catalog";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { defaultAuthorizationService } from "@/lib/platform/security/AuthorizationService";
import { AuthorizationMiddleware } from "@/lib/platform/security/AuthorizationMiddleware";
import { createAuthenticationContext } from "@/lib/platform/security/AuthenticationContext";
import { AuthorizationError } from "@/lib/platform/security/AuthorizationResult";
import { ProcurementRole } from "@/lib/platform/security/Role";
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

describe("Procurement Authorization (P-010.5)", () => {
  it("registers the Procurement permission catalog", () => {
    expect(PROCUREMENT_PERMISSIONS.admin).toBe("procurement:admin:manage");
    expect(PROCUREMENT_PERMISSIONS.requisitionCreate).toBe("procurement:requisition:create");
    expect(PROCUREMENT_PERMISSIONS.eventReplay).toBe("procurement:event:replay");
    expect(Object.keys(PROCUREMENT_PERMISSIONS)).toHaveLength(26);
  });

  it("maps Procurement API routes to permissions", () => {
    expect(resolveProcurementRoutePermission("GET", "/api/procurement/vendors")).toBe(
      PROCUREMENT_PERMISSIONS.supplierRead,
    );
    expect(resolveProcurementRoutePermission("POST", "/api/procurement/requisitions")).toBe(
      PROCUREMENT_PERMISSIONS.requisitionCreate,
    );
    expect(
      resolveProcurementRoutePermission("POST", "/api/procurement/purchase-orders/po-001/approve"),
    ).toBe(PROCUREMENT_PERMISSIONS.purchaseOrderApprove);
    expect(resolveProcurementRoutePermission("POST", "/api/procurement/goods-receipts")).toBe(
      PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
    );
    expect(resolveProcurementRoutePermission("GET", "/api/procurement/executive/dashboard")).toBe(
      PROCUREMENT_PERMISSIONS.intelligenceRead,
    );
    expect(resolveProcurementRoutePermission("POST", "/api/procurement/unknown/action")).toBe(
      "procurement:unknown:write",
    );
    expect(listProcurementRouteRules().length).toBeGreaterThan(15);
  });

  it("allows procurement administrator to manage suppliers and replay events", () => {
    const context = contextFor(SystemRole.OrganizationAdmin);
    expect(defaultProcurementAuthorizationService.canAdministerProcurement(context)).toBe(true);
    expect(defaultProcurementAuthorizationService.canCreateSupplier(context)).toBe(true);
    expect(defaultProcurementAuthorizationService.canReplayEvents(context)).toBe(true);
  });

  it("allows buyer to create requisitions but not approve purchase orders", () => {
    const context = contextFor(SystemRole.Staff);
    expect(defaultProcurementAuthorizationService.canCreateRequisition(context)).toBe(true);
    expect(defaultProcurementAuthorizationService.canApprovePurchaseOrder(context)).toBe(false);
    expect(defaultProcurementAuthorizationService.canApproveInvoice(context)).toBe(false);
  });

  it("allows procurement manager to approve requisitions and purchase orders", () => {
    const context = contextFor(SystemRole.Manager);
    expect(defaultProcurementAuthorizationService.canApproveRequisition(context)).toBe(true);
    expect(defaultProcurementAuthorizationService.canCreatePurchaseOrder(context)).toBe(true);
    expect(defaultProcurementAuthorizationService.canApprovePurchaseOrder(context)).toBe(true);
    expect(defaultProcurementAuthorizationService.canReceiveGoods(context)).toBe(false);
  });

  it("allows procurement director to approve invoices", () => {
    const context = contextFor(SystemRole.Executive);
    expect(defaultProcurementAuthorizationService.canApproveInvoice(context)).toBe(true);
    expect(defaultProcurementAuthorizationService.canManageContracts(context)).toBe(true);
    expect(defaultProcurementAuthorizationService.canReplayEvents(context)).toBe(false);
  });

  it("denies read-only users from write permissions", () => {
    const context = contextFor(SystemRole.ReadOnly);
    expect(defaultProcurementAuthorizationService.canCreateRequisition(context)).toBe(false);
    expect(defaultProcurementAuthorizationService.canReceiveGoods(context)).toBe(false);
    expect(defaultProcurementAuthorizationService.canManageConfiguration(context)).toBe(false);
  });

  it("denies anonymous service context when unauthenticated", () => {
    const context = contextFor(SystemRole.ReadOnly);
    const result = defaultAuthorizationService.authorizeServiceContext(
      context,
      PROCUREMENT_PERMISSIONS.requisitionCreate,
      { authenticated: false },
    );
    expect(result.allowed).toBe(false);
  });

  it("denies cross-organization access", () => {
    const identity = createIdentityContextFromServiceContext(
      contextFor(SystemRole.OrganizationAdmin, ORG_A),
    );
    const result = defaultAuthorizationService.authorize(identity, PROCUREMENT_PERMISSIONS.supplierRead, {
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
          permission: PROCUREMENT_PERMISSIONS.requisitionRead,
        }),
      ).toThrow(AuthorizationError);

      try {
        middleware.authorize(authentication, {
          permission: PROCUREMENT_PERMISSIONS.requisitionRead,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorizationError);
        expect((error as AuthorizationError).code).toBe("UNAUTHORIZED");
      }
    } finally {
      process.env.ORION_AUTH_FAIL_CLOSED = previous;
    }
  });

  it("returns 403 for authenticated users without explicit Procurement grants", () => {
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
        modules: ["procurement"],
      },
    });

    expect(() =>
      middleware.authorize(authentication, {
        permission: PROCUREMENT_PERMISSIONS.requisitionCreate,
      }),
    ).toThrow(AuthorizationError);

    try {
      middleware.authorize(authentication, {
        permission: PROCUREMENT_PERMISSIONS.requisitionCreate,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(AuthorizationError);
      expect((error as AuthorizationError).code).toBe("FORBIDDEN");
    }
  });

  it("grants procurement auditor read-only audit and intelligence access", () => {
    const permissions = defaultRoleRegistry.getPermissionsForRole(ProcurementRole.ProcurementAuditor);
    expect(permissions.has(PROCUREMENT_PERMISSIONS.auditRead)).toBe(true);
    expect(permissions.has(PROCUREMENT_PERMISSIONS.intelligenceRead)).toBe(true);
    expect(permissions.has(PROCUREMENT_PERMISSIONS.requisitionCreate)).toBe(false);
  });

  it("grants receiving officer goods receipt write access", () => {
    const permissions = defaultRoleRegistry.getPermissionsForRole(ProcurementRole.ReceivingOfficer);
    expect(permissions.has(PROCUREMENT_PERMISSIONS.goodsReceiptWrite)).toBe(true);
    expect(permissions.has(PROCUREMENT_PERMISSIONS.purchaseOrderCreate)).toBe(false);
  });

  it("grants supplier manager vendor approval", () => {
    const permissions = defaultRoleRegistry.getPermissionsForRole(ProcurementRole.SupplierManager);
    expect(permissions.has(PROCUREMENT_PERMISSIONS.vendorApprove)).toBe(true);
    expect(permissions.has(PROCUREMENT_PERMISSIONS.supplierWrite)).toBe(true);
  });
});
