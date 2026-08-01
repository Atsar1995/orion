import { describe, expect, it } from "vitest";
import {
  crmCommercialService,
  crmService,
  mapCrmCommercialBriefSignals,
} from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Lead & Opportunity Management Platform (Mission P-008.2)", () => {
  it("lists leads with diverse sources and lifecycle statuses", () => {
    const result = crmCommercialService.leads.list(CONTEXT);
    expect(result.total).toBeGreaterThanOrEqual(8);
    expect(result.items.some((item) => item.source === "website")).toBe(true);
    expect(result.items.some((item) => item.source === "travel_agent")).toBe(true);
    expect(result.items.some((item) => item.status === "new")).toBe(true);
    expect(result.items.some((item) => item.status === "qualified")).toBe(true);
  });

  it("creates and qualifies leads", () => {
    const created = crmCommercialService.leads.create(
      {
        displayName: "Test Inbound Lead",
        source: "website",
        owner: "Sales Director",
        estimatedValue: 250000,
      },
      CONTEXT,
      "Executive",
    );
    expect(created.id).toBeTruthy();
    expect(created.status).toBe("new");

    const qualified = crmCommercialService.leads.qualify(created.id, CONTEXT);
    expect(qualified.status).toBe("qualified");
  });

  it("converts leads to opportunities linked to party ids", () => {
    const lead = crmCommercialService.leads.create(
      {
        displayName: "Convert Test Lead",
        source: "referral",
        owner: "Founder",
        organisationPartyId: "org-party-commerce-partner-ltd",
        estimatedValue: 500000,
      },
      CONTEXT,
      "Executive",
    );

    const opportunity = crmCommercialService.opportunities.convertLead(
      {
        leadId: lead.id,
        name: "Convert Test — Platform Deal",
        valueAmount: 500000,
        probability: 40,
        expectedClose: "30 Sep 2026",
      },
      CONTEXT,
      "Executive",
    );

    expect(opportunity.partyId).toContain("org-party");
    expect(opportunity.leadId).toBe(lead.id);
    expect(crmCommercialService.leads.getDetail(lead.id, CONTEXT)?.status).toBe("converted");
  });

  it("manages opportunity lifecycle with won/lost events", () => {
    const created = crmCommercialService.opportunities.create(
      {
        name: "Lifecycle Test Deal",
        partyId: "org-party-global-suppliers-co",
        owner: "Sales Director",
        valueAmount: 300000,
        probability: 50,
        expectedClose: "15 Aug 2026",
        stage: "proposal",
      },
      CONTEXT,
      "Executive",
    );

    const won = crmCommercialService.opportunities.modify(
      created.id,
      { stage: "won", probability: 100 },
      CONTEXT,
      "Executive",
    );
    expect(won.stage).toBe("won");
  });

  it("provides sales pipeline view with metrics", () => {
    const pipeline = crmCommercialService.pipeline.getView(CONTEXT);
    expect(pipeline.columns.length).toBeGreaterThan(0);
    expect(pipeline.metrics.openOpportunities).toBeGreaterThan(0);
    expect(pipeline.metrics.totalPipelineValue).toContain("₹");
    expect(pipeline.metrics.winRate).toMatch(/%$/);
  });

  it("generates revenue forecast dashboard", () => {
    const dashboard = crmCommercialService.forecast.getDashboard(CONTEXT);
    expect(dashboard.forecasts.length).toBeGreaterThanOrEqual(4);
    expect(dashboard.topOpportunities.length).toBeGreaterThan(0);
    expect(dashboard.briefingLine).toContain("forecast");
  });

  it("scores leads and opportunities via scoring engine", () => {
    const leads = crmCommercialService.leads.list(CONTEXT);
    expect(leads.items[0]?.probability).toBeGreaterThan(0);
    const opp = crmCommercialService.opportunities.get("orania-enterprise-renewal", CONTEXT);
    expect(opp?.score).toBeGreaterThan(0);
  });

  it("bridges legacy opportunity UI through repository mapper", () => {
    const legacy = crmService.listOpportunities({});
    expect(legacy.items.length).toBeGreaterThan(0);
    expect(legacy.items.every((item) => item.customer)).toBeTruthy();
  });

  it("keeps opportunities independent of reservations", () => {
    const opportunities = crmService.listOpportunities({});
    expect(opportunities.items.every((item) => !item.name.toLowerCase().includes("reservation"))).toBe(true);
  });

  it("provides commercial brief signals for Executive Brief", () => {
    const signals = mapCrmCommercialBriefSignals(crmCommercialService, CONTEXT);
    expect(signals.openOpportunities).toBeGreaterThan(0);
    expect(signals.activeLeads).toBeGreaterThan(0);
    expect(signals.briefingLine).toContain("open opportunities");
    expect(crmService.getCommercialBriefSignals(CONTEXT).forecastRevenue).toContain("₹");
  });
});
