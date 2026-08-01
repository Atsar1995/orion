import { describe, expect, it } from "vitest";
import { InMemoryCrmRepository } from "@/lib/crm/repositories/InMemoryCrmRepository";
import { computeCustomerHealthScore } from "@/lib/crm/services/intelligence/CustomerHealthScoreService";
import { computeDealRisk } from "@/lib/crm/services/intelligence/DealRiskService";
import { computeFollowUpPriority } from "@/lib/crm/services/intelligence/FollowUpPriorityService";
import { detectLostOpportunities } from "@/lib/crm/services/intelligence/LostOpportunityDetectionService";
import { computePipelineHealth } from "@/lib/crm/services/intelligence/PipelineHealthService";
import { computeRevenueForecast } from "@/lib/crm/services/intelligence/RevenueForecastService";
import { runCrmIntelligenceEngine } from "@/lib/crm/services/intelligence/CrmIntelligenceEngine";

describe("CRM intelligence services", () => {
  const repository = new InMemoryCrmRepository();

  it("computes customer health score from profiles and segments", () => {
    const result = computeCustomerHealthScore({
      profiles: repository.getCustomerProfiles(),
      segments: repository.getRelationshipHealth(),
      baselineScore: 84,
      baselineTrend: "+3",
    });

    expect(result.score).toBeGreaterThan(0);
    expect(result.drivers).toHaveLength(4);
  });

  it("flags high-risk deals using business rules", () => {
    const result = computeDealRisk(repository.getManagedOpportunities());

    expect(result.deals.length).toBeGreaterThan(0);
    expect(result.highRiskCount).toBeGreaterThanOrEqual(0);
  });

  it("evaluates pipeline health from stage distribution", () => {
    const summary = repository.getPipelineSummary();
    const result = computePipelineHealth({
      stages: repository.getPipelineStages(),
      trend: summary.trend,
      activeOpportunities: summary.activeOpportunities,
    });

    expect(result.score).toBeGreaterThan(0);
    expect(["healthy", "top-heavy", "bottom-heavy"]).toContain(result.stageBalance);
  });

  it("detects lost opportunity signals", () => {
    const result = detectLostOpportunities(repository.getManagedOpportunities());

    expect(result.count).toBeGreaterThanOrEqual(0);
  });

  it("ranks follow-up priorities", () => {
    const result = computeFollowUpPriority(
      repository.getCustomerProfiles(),
      repository.getRelationshipActions(),
    );

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]?.rank).toBe(1);
  });

  it("forecasts revenue from weighted probabilities", () => {
    const result = computeRevenueForecast(repository.getManagedOpportunities());

    expect(result.weightedForecast).toBeGreaterThan(0);
    expect(result.weightedForecastDisplay).toMatch(/^₹/);
  });

  it("runs full intelligence engine with executive summary", () => {
    const result = runCrmIntelligenceEngine(repository);

    expect(result.executiveSummary.briefingLine).toContain("Customer health");
    expect(result.executiveSummary.keyPoints.length).toBeGreaterThan(0);
    expect(result.revenueForecast.weightedForecastDisplay).toBeTruthy();
    expect(result.winRateTrend.currentWinRate).toBeGreaterThanOrEqual(0);
    expect(result.activityEffectiveness.score).toBeGreaterThan(0);
    expect(result.salesMomentum.score).toBeGreaterThan(0);
  });
});
