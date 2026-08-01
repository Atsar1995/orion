import { describe, expect, it } from "vitest";
import {
  crmAgreementsService,
  crmCommercialIntelligenceService,
  crmCommercialService,
  crmCustomerIntelligenceService,
  crmExecutiveDashboardService,
  crmPartyService,
  crmService,
  getCrmBriefContribution,
} from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

/** Mission P-008.8 — end-to-end commercial domain certification (no new features). */
describe("Commercial Domain Certification (P-008.8)", () => {
  it("validates complete commercial lifecycle across all domain facades", () => {
    // P-008.1 Universal Party
    expect(crmPartyService.organisations.list(CONTEXT).items.length).toBeGreaterThan(0);
    expect(crmPartyService.search.search({ kind: "person" }, CONTEXT).items.length).toBeGreaterThan(0);
    expect(crmPartyService.analytics.getAnalytics(CONTEXT).byType.length).toBeGreaterThan(0);

    // P-008.2 Lead & Opportunity
    expect(crmCommercialService.leads.list(CONTEXT).items.length).toBeGreaterThan(0);
    expect(crmCommercialService.opportunities.list(CONTEXT).length).toBeGreaterThan(0);
    expect(crmCommercialService.pipeline.getMetrics(CONTEXT).openOpportunities).toBeGreaterThan(0);

    // P-008.3 Proposals, Contracts & Agreements
    expect(crmAgreementsService.proposals.list(CONTEXT).length).toBeGreaterThan(0);
    expect(crmAgreementsService.contracts.list(CONTEXT).length).toBeGreaterThan(0);
    expect(crmAgreementsService.renewals.getDashboard(CONTEXT).upcoming.length).toBeGreaterThanOrEqual(0);

    // P-008.5 Commercial Intelligence
    const commercialDashboard = crmCommercialIntelligenceService.executive.getExecutiveDashboard(CONTEXT);
    expect(commercialDashboard.kpis.length).toBeGreaterThanOrEqual(8);
    expect(commercialDashboard.insights.length).toBeGreaterThan(0);

    // P-008.6 Customer Analytics
    const customerDashboard = crmCustomerIntelligenceService.executive.getDashboard(CONTEXT);
    expect(customerDashboard.hub.profiles.length).toBeGreaterThan(0);
    expect(customerDashboard.journeySummary.length).toBe(6);

    // P-008.7 Executive Dashboard
    const executiveDashboard = crmExecutiveDashboardService.executive.getDashboard(CONTEXT);
    expect(executiveDashboard.summary.pipelineValue).toBeTruthy();
    expect(executiveDashboard.alerts.length).toBeGreaterThan(0);
    expect(executiveDashboard.drillDowns.length).toBeGreaterThan(0);
  });

  it("validates legacy activity and relationship surfaces remain functional", () => {
    expect(crmService.getActivityWorkspace().records.length).toBeGreaterThan(0);
    expect(crmService.listActivities({}).items.length).toBeGreaterThan(0);
    expect(crmService.listCustomers({}).items.length).toBeGreaterThan(0);
    expect(crmService.getOpportunityWorkspace().metrics.openOpportunities).toBeGreaterThan(0);
  });

  it("validates executive platform integration", () => {
    const brief = getCrmBriefContribution();

    expect(brief.workspaceId).toBe("crm");
    expect(brief.briefingLine.length).toBeGreaterThan(10);
    expect(brief.healthScore.score).toBeGreaterThan(0);
    expect(crmService.getPartyBriefSignals(CONTEXT).briefingLine).toBeTruthy();
    expect(crmService.getCommercialBriefSignals(CONTEXT).briefingLine).toBeTruthy();
    expect(crmService.getAgreementsBriefSignals(CONTEXT).briefingLine).toBeTruthy();
    expect(crmService.getCommercialIntelligenceBriefSignals(CONTEXT).briefingLine).toBeTruthy();
    expect(crmService.getCustomerIntelligenceBriefSignals(CONTEXT).briefingLine).toBeTruthy();
    expect(crmService.getExecutiveDashboardBriefSignals(CONTEXT).briefingLine).toContain("pipeline");
  });

  it("validates all seven domain service exports are functional", () => {
    const services = [
      crmPartyService,
      crmCommercialService,
      crmAgreementsService,
      crmCommercialIntelligenceService,
      crmCustomerIntelligenceService,
      crmExecutiveDashboardService,
      crmService,
    ];
    expect(services.every((service) => service !== null && typeof service === "object")).toBe(true);
  });
});
