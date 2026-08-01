import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CRM_BASE_PATH,
  CRM_NAV,
  CRM_ROUTE_PERMISSIONS,
  crmService,
  getCrmBriefContribution,
} from "@/lib/crm";

const APP_ROOT = join(process.cwd(), "app", "(platform)", "crm");

/** Mission 16A.8 / P-008 — structural release readiness checks for CRM Workspace. */
describe("CRM Workspace release readiness (16A.8 / P-008)", () => {
  it("defines sixteen sub-nav routes with RBAC metadata", () => {
    expect(CRM_NAV).toHaveLength(16);
    expect(CRM_NAV.map((item) => item.href)).toEqual([
      CRM_BASE_PATH,
      "/crm/executive",
      "/crm/customers",
      "/crm/parties",
      "/crm/companies",
      "/crm/opportunities",
      "/crm/leads",
      "/crm/forecast",
      "/crm/proposals",
      "/crm/contracts",
      "/crm/rate-agreements",
      "/crm/renewals",
      "/crm/analytics",
      "/crm/customer-analytics",
      "/crm/activities",
      "/crm/insights",
    ]);
    expect(CRM_NAV.every((item) => item.permission?.action === "read")).toBe(true);
    expect(CRM_ROUTE_PERMISSIONS.settings.action).toBe("write");
  });

  it("ships page modules for all active CRM routes", () => {
    const routes = [
      "page.tsx",
      "executive/page.tsx",
      "customers/page.tsx",
      "customers/[customerId]/page.tsx",
      "parties/page.tsx",
      "companies/page.tsx",
      "companies/[companyId]/page.tsx",
      "opportunities/page.tsx",
      "opportunities/[opportunityId]/page.tsx",
      "leads/page.tsx",
      "leads/[leadId]/page.tsx",
      "forecast/page.tsx",
      "proposals/page.tsx",
      "contracts/page.tsx",
      "contracts/[contractId]/page.tsx",
      "rate-agreements/page.tsx",
      "renewals/page.tsx",
      "analytics/page.tsx",
      "customer-analytics/page.tsx",
      "customer-analytics/[partyId]/page.tsx",
      "activities/page.tsx",
      "insights/page.tsx",
      "layout.tsx",
    ];

    for (const route of routes) {
      expect(existsSync(join(APP_ROOT, route))).toBe(true);
    }
  });

  it("exposes v1.0 service surface on crmService", () => {
    expect(typeof crmService.getDashboard).toBe("function");
    expect(typeof crmService.listCustomers).toBe("function");
    expect(typeof crmService.getCustomerDetail).toBe("function");
    expect(typeof crmService.getOpportunityWorkspace).toBe("function");
    expect(typeof crmService.listOpportunities).toBe("function");
    expect(typeof crmService.getOpportunityDetail).toBe("function");
    expect(typeof crmService.getActivityWorkspace).toBe("function");
    expect(typeof crmService.listActivities).toBe("function");
    expect(typeof crmService.getInsights).toBe("function");
    expect(typeof crmService.getIntelligence).toBe("function");
    expect(typeof crmService.getBriefContribution).toBe("function");
    expect(typeof crmService.getAgreementsBriefSignals).toBe("function");
    expect(typeof crmService.getCommercialIntelligenceBriefSignals).toBe("function");
    expect(typeof crmService.getCustomerIntelligenceBriefSignals).toBe("function");
    expect(typeof crmService.getExecutiveDashboardBriefSignals).toBe("function");
  });

  it("returns non-empty brief contribution for Executive Brief integration", () => {
    const contribution = getCrmBriefContribution();

    expect(contribution.workspaceId).toBe("crm");
    expect(contribution.topPriorities.length).toBeGreaterThan(0);
    expect(contribution.criticalAlerts.length).toBeGreaterThan(0);
    expect(contribution.healthScore.score).toBeGreaterThan(0);
    expect(contribution.briefingLine).toContain("Customer health");
    expect(contribution.snapshot.executiveRecommendations.length).toBeGreaterThan(0);
  });

  it("loads module view models without throwing", () => {
    expect(crmService.getDashboard().header.title).toBeTruthy();
    expect(crmService.listCustomers({}).items.length).toBeGreaterThan(0);
    expect(crmService.getOpportunityWorkspace().metrics.openOpportunities).toBeGreaterThan(0);
    expect(crmService.getActivityWorkspace().records.length).toBeGreaterThan(0);
    expect(crmService.getInsights().recommendations.length).toBeGreaterThan(0);
  });
});
