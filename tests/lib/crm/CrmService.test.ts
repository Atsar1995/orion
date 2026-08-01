import { describe, expect, it } from "vitest";
import {
  CrmService,
  InMemoryCrmRepository,
  mapCrmBriefContribution,
  mapCrmIntelligenceResult,
} from "@/lib/crm";

describe("CrmService", () => {
  it("returns overview with dashboard metrics", () => {
    const service = new CrmService(new InMemoryCrmRepository());
    const overview = service.getOverview();

    expect(overview.header.title).toBe("Customer Intelligence");
    expect(overview.dashboard.customerHealth.score).toBeGreaterThan(0);
    expect(overview.dashboard.activeOpportunities).toBe(24);
    expect(overview.dashboard.pipelineValue).toBe("₹1.8Cr");
    expect(overview.kpis.length).toBeGreaterThan(0);
    expect(overview.pipeline.stages.length).toBeGreaterThan(0);
    expect(overview.recommendedAction.title).toBeTruthy();
  });

  it("returns brief contribution with snapshot", () => {
    const service = new CrmService(new InMemoryCrmRepository());
    const brief = service.getBriefContribution();

    expect(brief.briefingLine).toContain("Customer health");
    expect(brief.snapshot.healthScore).toBeGreaterThan(0);
    expect(brief.snapshot.intelligenceSummary).toBeTruthy();
    expect(brief.snapshot.revenueForecastDisplay).toMatch(/^₹/);
    expect(brief.snapshot.executiveRecommendations.length).toBeGreaterThan(0);
  });

  it("returns intelligence with health and recommendations", () => {
    const service = new CrmService(new InMemoryCrmRepository());
    const intelligence = service.getIntelligence();

    expect(intelligence.signals.customerHealthScore.score).toBeGreaterThan(0);
    expect(intelligence.signals.dealRisk.deals.length).toBeGreaterThan(0);
    expect(intelligence.signals.revenueForecast.weightedForecast).toBeGreaterThan(0);
    expect(intelligence.health.customer.score).toBeGreaterThan(0);
    expect(intelligence.recommendations.executivePriorities.length).toBeGreaterThan(0);
    expect(intelligence.brief.workspaceId).toBe("crm");
  });
});

describe("mapCrmIntelligenceResult", () => {
  it("maps repository data into brief contribution", () => {
    const repository = new InMemoryCrmRepository();
    const intelligence = mapCrmIntelligenceResult(repository);
    const brief = mapCrmBriefContribution(intelligence);

    expect(brief.workspaceLabel).toBe("Customer Intelligence");
    expect(brief.snapshot.highestValueCustomer.name).toBeTruthy();
    expect(brief.snapshot.highestRiskCustomer.status).toBe("critical");
  });
});
