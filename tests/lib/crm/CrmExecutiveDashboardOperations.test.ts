import { describe, expect, it } from "vitest";
import {
  crmExecutiveDashboardService,
  crmService,
  mapCrmExecutiveBriefSignals,
} from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Commercial Executive Dashboard (Mission P-008.7)", () => {
  it("composes unified executive dashboard from commercial and customer intelligence", () => {
    const dashboard = crmExecutiveDashboardService.executive.getDashboard(CONTEXT);
    expect(dashboard.summary.pipelineValue).toBeTruthy();
    expect(dashboard.summary.forecastRevenue).toBeTruthy();
    expect(dashboard.summary.relationshipHealthIndex).toBeGreaterThan(0);
    expect(dashboard.salesPerformance.pipelineByStage.length).toBeGreaterThan(0);
    expect(dashboard.customerIntelligence.vipCustomers.length).toBeGreaterThanOrEqual(0);
  });

  it("surfaces exception-first executive alerts sorted by severity", () => {
    const alerts = crmExecutiveDashboardService.alerts.list(CONTEXT);
    expect(alerts.length).toBeGreaterThan(0);
    const severities = alerts.map((entry) => entry.severity);
    expect(severities.includes("critical") || severities.includes("high")).toBe(true);
    expect(alerts.every((entry: { recommendedAction: string }) => entry.recommendedAction.length > 0)).toBe(true);
  });

  it("provides executive KPI summary", () => {
    const summary = crmExecutiveDashboardService.kpis.getSummary(CONTEXT);
    expect(summary.activeContracts).toBeGreaterThan(0);
    expect(summary.customerLifetimeValue).toBeTruthy();
  });

  it("builds priority widgets for executive attention", () => {
    const dashboard = crmExecutiveDashboardService.executive.getDashboard(CONTEXT);
    expect(dashboard.widgets.length).toBeGreaterThan(0);
    expect(dashboard.widgets[0]!.priority).toBeGreaterThanOrEqual(dashboard.widgets.at(-1)!.priority);
  });

  it("supports drill-down navigation to entities", () => {
    const dashboard = crmExecutiveDashboardService.executive.getDashboard(CONTEXT);
    expect(dashboard.drillDowns.some((entry: { href: string }) => entry.href.startsWith("/crm/"))).toBe(true);
    expect(dashboard.salesPerformance.opportunityAging.every((entry: { href: string }) => entry.href.includes("/crm/opportunities/"))).toBe(true);
  });

  it("generates daily commercial executive report", () => {
    const report = crmExecutiveDashboardService.executive.getReport(CONTEXT);
    expect(report.title).toBe("Daily Commercial Brief");
    expect(report.sections.length).toBeGreaterThanOrEqual(4);
    expect(report.briefingLine).toContain("pipeline");
  });

  it("includes commercial activity summary with proposals and renewals", () => {
    const dashboard = crmExecutiveDashboardService.executive.getDashboard(CONTEXT);
    expect(dashboard.commercialActivity.meetings).toBeGreaterThanOrEqual(0);
    expect(dashboard.commercialActivity.proposalsPending).toBeGreaterThanOrEqual(0);
    expect(dashboard.commercialActivity.recentActivities.length).toBeGreaterThan(0);
  });

  it("tracks performance trends for executive memory", () => {
    const dashboard = crmExecutiveDashboardService.executive.getDashboard(CONTEXT);
    expect(dashboard.trends.length).toBeGreaterThan(0);
  });

  it("provides executive brief signals via CrmService", () => {
    const signals = mapCrmExecutiveBriefSignals(crmExecutiveDashboardService, CONTEXT);
    expect(signals.executiveAlerts).toBeGreaterThan(0);
    expect(crmService.getExecutiveDashboardBriefSignals(CONTEXT).briefingLine).toContain("pipeline");
  });
});
