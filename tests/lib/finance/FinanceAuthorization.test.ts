import { describe, expect, it } from "vitest";
import "@/lib/finance/security";
import { FINANCE_PERMISSIONS } from "@/lib/finance/security/finance-permission-catalog";
import {
  defaultFinanceAuthorizationService,
} from "@/lib/finance/security/FinanceAuthorizationService";
import {
  listFinanceRouteRules,
  resolveFinanceRoutePermission,
} from "@/lib/finance/security/finance-permission-catalog";
import { createIdentityContextFromServiceContext } from "@/lib/platform/security/IdentityContext";
import { defaultAuthorizationService } from "@/lib/platform/security/AuthorizationService";
import { SystemRole } from "@/lib/auth/roles";
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

describe("Finance Authorization (P-009.14)", () => {
  it("maps finance API routes to permissions", () => {
    expect(resolveFinanceRoutePermission("GET", "/api/finance/accounts")).toBe(
      FINANCE_PERMISSIONS.coaRead,
    );
    expect(resolveFinanceRoutePermission("POST", "/api/finance/ledger/postings")).toBe(
      FINANCE_PERMISSIONS.journalPost,
    );
    expect(resolveFinanceRoutePermission("POST", "/api/finance/periods/period-2026-07/reopen")).toBe(
      FINANCE_PERMISSIONS.periodReopen,
    );
    expect(resolveFinanceRoutePermission("POST", "/api/finance/unknown/action")).toBe(
      "finance:unknown:write",
    );
    expect(listFinanceRouteRules().length).toBeGreaterThan(20);
  });

  it("allows finance admin to post journals", () => {
    const context = contextFor(SystemRole.OrganizationAdmin);
    expect(defaultFinanceAuthorizationService.canPostJournal(context)).toBe(true);
    expect(defaultFinanceAuthorizationService.canAdministerFinance(context)).toBe(true);
  });

  it("allows accountant role bundle to post journals", () => {
    const context = contextFor(SystemRole.Analyst);
    expect(defaultFinanceAuthorizationService.canPostJournal(context)).toBe(true);
  });

  it("denies read-only users from posting journals", () => {
    const context = contextFor(SystemRole.ReadOnly);
    expect(defaultFinanceAuthorizationService.canPostJournal(context)).toBe(false);
    expect(defaultFinanceAuthorizationService.canReadJournal(context)).toBe(true);
  });

  it("denies anonymous service context when unauthenticated", () => {
    const context = contextFor(SystemRole.ReadOnly);
    const result = defaultAuthorizationService.authorizeServiceContext(
      context,
      FINANCE_PERMISSIONS.journalPost,
      { authenticated: false },
    );
    expect(result.allowed).toBe(false);
  });

  it("denies cross-organization access", () => {
    const identity = createIdentityContextFromServiceContext(contextFor(SystemRole.OrganizationAdmin, ORG_A));
    const result = defaultAuthorizationService.authorize(identity, FINANCE_PERMISSIONS.coaRead, {
      resourceOrganizationId: ORG_B,
    });
    expect(result.allowed).toBe(false);
  });

  it("allows executive read-only intelligence access", () => {
    const context = contextFor(SystemRole.Executive);
    expect(defaultFinanceAuthorizationService.canReadIntelligence(context)).toBe(true);
    expect(defaultFinanceAuthorizationService.canPostJournal(context)).toBe(false);
  });

  it("allows controller to close periods but not replay events", () => {
    const context = contextFor(SystemRole.Manager);
    expect(defaultFinanceAuthorizationService.canClosePeriod(context)).toBe(true);
    expect(defaultFinanceAuthorizationService.canReplayEvent(context)).toBe(false);
  });

  it("allows finance administrator to replay events", () => {
    const context = contextFor(SystemRole.OrganizationAdmin);
    expect(defaultFinanceAuthorizationService.canReplayEvent(context)).toBe(true);
  });

  it("denies read-only users audit and write permissions", () => {
    const identity = createIdentityContextFromServiceContext(contextFor(SystemRole.ReadOnly));
    const audit = defaultAuthorizationService.authorize(identity, FINANCE_PERMISSIONS.auditRead);
    const write = defaultAuthorizationService.authorize(identity, FINANCE_PERMISSIONS.coaWrite);
    expect(audit.allowed).toBe(false);
    expect(write.allowed).toBe(false);
  });

  it("grants service account journal post permission for integration flows", () => {
    const context = contextFor(SystemRole.ServiceAccount);
    expect(defaultFinanceAuthorizationService.canPostJournal(context)).toBe(true);
  });
});
