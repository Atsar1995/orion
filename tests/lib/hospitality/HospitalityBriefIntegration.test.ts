import { describe, expect, it } from "vitest";
import "@/lib/intelligence/register-executive-providers";
import { composeExecutiveBriefV1 } from "@/lib/executive/brief/compose-executive-brief-v1";
import { getHospitalityBriefContribution, hospitalityService } from "@/lib/hospitality";
import { getProvider } from "@/lib/intelligence/provider-registry";

describe("Hospitality Executive Brief integration (P-007)", () => {
  const context = {
    organizationId: "org-orania",
    workspaceId: "workspace-orania",
    userId: "user-executive",
    role: "executive" as const,
  };

  it("returns hospitality brief contribution with occupancy and revenue", () => {
    const contribution = getHospitalityBriefContribution();

    expect(contribution.workspaceId).toBe("hospitality");
    expect(contribution.briefingLine).toContain("forecast occupancy");
    expect(contribution.vipArrivals).toBeGreaterThanOrEqual(0);
    expect(contribution.criticalIssues.length).toBeGreaterThanOrEqual(0);
  });

  it("registers hospitality executive provider with live intelligence", () => {
    const provider = getProvider("hospitality");

    expect(provider?.getRecommendations().length).toBeGreaterThan(0);
    expect(provider?.getAlerts().length).toBeGreaterThan(0);
    expect(provider?.getBriefingLine()).toContain("forecast occupancy");
    expect(provider?.getMetrics().length).toBe(3);
  });

  it("composes hospitality health into Executive Brief v1", () => {
    const brief = composeExecutiveBriefV1({
      executiveName: "Executive",
      serviceContext: context,
    });

    expect(brief.hospitalityHealth?.workspaceId).toBe("hospitality");
    expect(brief.hospitalityHealth?.healthScore).toBeGreaterThan(0);
    expect(brief.crossWorkspaceSignals.find((signal) => signal.workspaceId === "hospitality")?.status).toBe(
      "live",
    );
  });

  it("maps hospitality intelligence recommendations for decision support", () => {
    const intelligence = hospitalityService.getIntelligence(context);

    expect(intelligence.recommendations.some((entry) => entry.category === "pricing" || entry.category === "staffing" || entry.category === "revenue")).toBe(true);
    expect(intelligence.patterns.length).toBeGreaterThan(0);
  });
});
