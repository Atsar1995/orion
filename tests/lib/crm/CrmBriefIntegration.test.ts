import { describe, expect, it } from "vitest";
import "@/lib/intelligence/register-executive-providers";
import {
  crmService,
  mapCrmBriefAlerts,
  mapCrmBriefExecutiveSummary,
  mapCrmBriefOvernightChanges,
  mapCrmBriefRecommendations,
  mapCrmBriefBusinessHealth,
  crmRepository,
} from "@/lib/crm";
import { mapIntelligenceBusToBriefView } from "@/lib/executive/brief/map-intelligence-bus-to-brief";
import { IntelligenceBusBriefRepository } from "@/lib/executive/brief/BriefService";
import { getProvider } from "@/lib/intelligence/provider-registry";

describe("CRM Executive Brief contribution (16A.7)", () => {
  const intelligence = crmService.getIntelligence();

  it("maps explainable CRM recommendations with evidence and href", () => {
    const recommendations = mapCrmBriefRecommendations(intelligence);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]?.reason).toBeTruthy();
    expect(recommendations[0]?.recommendedAction).toBeTruthy();
    expect(recommendations[0]?.evidence.length).toBeGreaterThan(0);
    expect(recommendations[0]?.href).toMatch(/^\/crm/);
  });

  it("maps CRM alerts for the shared brief", () => {
    const alerts = mapCrmBriefAlerts(crmRepository, intelligence);

    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.some((alert) => alert.href?.startsWith("/crm"))).toBe(true);
  });

  it("maps CRM overnight changes with navigation targets", () => {
    const changes = mapCrmBriefOvernightChanges(intelligence);

    expect(changes.length).toBe(4);
    expect(changes.every((change) => change.href?.startsWith("/crm"))).toBe(true);
  });

  it("provides business health contribution placeholders", () => {
    const contribution = mapCrmBriefBusinessHealth(intelligence);

    expect(contribution.customerHealth.score).toBeGreaterThan(0);
    expect(contribution.pipelineHealth.label).toBe("Pipeline Health");
    expect(contribution.overallScore).toBeGreaterThan(0);
  });

  it("generates CRM executive summary contribution", () => {
    const summary = mapCrmBriefExecutiveSummary(intelligence);

    expect(summary).toContain("CRM");
  });

  it("registers CRM executive provider with live intelligence", () => {
    const provider = getProvider("crm");

    expect(provider?.getRecommendations().length).toBeGreaterThan(0);
    expect(provider?.getAlerts().length).toBeGreaterThan(0);
    expect(provider?.getBriefingLine()).toContain("Customer health");
  });

  it("merges CRM into shared Intelligence Bus brief view", () => {
    const brief = mapIntelligenceBusToBriefView();

    expect(brief.recommendations.some((item) => item.href?.startsWith("/crm"))).toBe(true);
    expect(brief.overnightChanges.some((item) => item.href?.startsWith("/crm"))).toBe(true);
    expect(brief.businessHealth.domains.some((domain) => domain.id === "crm")).toBe(true);
    expect(brief.greeting.subheadline).toContain("CRM");
  });

  it("loads brief via IntelligenceBusBriefRepository", async () => {
    const repository = new IntelligenceBusBriefRepository();
    const brief = await repository.getBriefView();

    expect(brief.recommendations.length).toBeGreaterThan(0);
    expect(brief.criticalAlerts.length).toBeGreaterThan(0);
  });
});
