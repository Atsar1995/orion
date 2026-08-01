import { describe, expect, it } from "vitest";
import { InMemoryCrmRepository, CrmService, mapCrmInsightsView } from "@/lib/crm";
import { computeActivityEffectiveness } from "@/lib/crm/services/intelligence/ActivityEffectivenessService";
import { computeSalesMomentum } from "@/lib/crm/services/intelligence/SalesMomentumService";
import { computeWinRateTrend } from "@/lib/crm/services/intelligence/WinRateTrendService";
import { mapCrmExplainableRecommendations } from "@/lib/crm/mappers/explainable-recommendations";
import { mapCrmBusinessHealthContribution } from "@/lib/crm/mappers/business-health-contribution";

describe("CRM intelligence extensions (16A.6)", () => {
  const repository = new InMemoryCrmRepository();
  const service = new CrmService(repository);

  it("computes win rate trend from opportunity records", () => {
    const result = computeWinRateTrend(repository.getOpportunityRecords());

    expect(result.currentWinRate).toBeGreaterThanOrEqual(0);
    expect(["up", "down", "neutral"]).toContain(result.trendDirection);
  });

  it("computes activity effectiveness from activity records", () => {
    const result = computeActivityEffectiveness(repository.getActivityRecords());

    expect(result.score).toBeGreaterThan(0);
    expect(result.completionRate).toBeGreaterThanOrEqual(0);
  });

  it("computes sales momentum from composite signals", () => {
    const intelligence = service.getIntelligence().signals;
    const result = computeSalesMomentum({
      pipelineHealth: intelligence.pipelineHealth,
      winRateTrend: intelligence.winRateTrend,
      activityEffectiveness: intelligence.activityEffectiveness,
      pipelineTrend: "+4%",
    });

    expect(result.score).toBeGreaterThan(0);
    expect(result.drivers).toHaveLength(3);
  });

  it("maps explainable recommendations with evidence and confidence", () => {
    const intelligence = service.getIntelligence();
    const recommendations = mapCrmExplainableRecommendations(intelligence);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]?.evidence.length).toBeGreaterThan(0);
    expect(recommendations[0]?.reason).toBeTruthy();
    expect(recommendations[0]?.recommendedAction).toBeTruthy();
  });

  it("maps business health contribution placeholders", () => {
    const contribution = mapCrmBusinessHealthContribution(service.getIntelligence());

    expect(contribution.customerHealth.score).toBeGreaterThan(0);
    expect(contribution.overallScore).toBeGreaterThan(0);
  });

  it("maps full insights dashboard view", () => {
    const view = mapCrmInsightsView(repository, service.getIntelligence());

    expect(view.dashboard.pipelineHealth.score).toBeGreaterThan(0);
    expect(view.dashboard.customerHealthDistribution.length).toBeGreaterThan(0);
    expect(view.recommendations.length).toBeGreaterThan(0);
    expect(view.alerts.length).toBeGreaterThan(0);
    expect(view.briefHighlights.upcomingPriorities.length).toBeGreaterThan(0);
  });

  it("exposes insights via CrmService.getInsights()", () => {
    const view = service.getInsights();

    expect(view.executiveSummary.narrative).toContain("Customer Intelligence");
    expect(view.businessHealth.overallScore).toBeGreaterThan(0);
  });
});
