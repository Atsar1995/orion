import { describe, expect, it } from "vitest";
import {
  crmCommercialIntelligenceService,
  crmService,
  mapCrmCommercialIntelligenceBriefSignals,
} from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Commercial Intelligence & Revenue Analytics Platform (Mission P-008.5)", () => {
  it("computes commercial KPI library from canonical pipeline", () => {
    const kpis = crmCommercialIntelligenceService.kpis.getKpis(CONTEXT);
    expect(kpis.length).toBeGreaterThanOrEqual(8);
    expect(kpis.some((entry) => entry.label === "Pipeline Value")).toBe(true);
    expect(kpis.some((entry) => entry.label === "Win Rate")).toBe(true);
    expect(kpis.some((entry) => entry.label === "Customer Lifetime Value")).toBe(true);
    expect(kpis.some((entry) => entry.label === "Relationship Health")).toBe(true);
  });

  it("generates revenue, pipeline, renewal, and opportunity forecasts", () => {
    const forecasts = crmCommercialIntelligenceService.forecasts.getForecasts(CONTEXT);
    expect(forecasts.some((entry) => entry.forecastType === "revenue")).toBe(true);
    expect(forecasts.some((entry) => entry.forecastType === "pipeline")).toBe(true);
    expect(forecasts.some((entry) => entry.forecastType === "renewal")).toBe(true);
    expect(forecasts.some((entry) => entry.forecastType === "opportunity")).toBe(true);
  });

  it("runs forecast engine and stores snapshots", () => {
    const forecasts = crmCommercialIntelligenceService.forecasts.runForecast(CONTEXT, "Executive");
    expect(forecasts.length).toBe(4);
    const history = crmCommercialIntelligenceService.forecasts.getHistory(CONTEXT);
    expect(history.length).toBeGreaterThan(0);
  });

  it("provides pipeline analytics by stage and owner", () => {
    const analytics = crmCommercialIntelligenceService.analytics.getAnalytics(CONTEXT);
    expect(analytics.pipelineByStage.length).toBeGreaterThan(0);
    expect(analytics.pipelineByOwner.length).toBeGreaterThan(0);
    expect(analytics.revenueByAccount.length).toBeGreaterThan(0);
  });

  it("scores relationship health per account", () => {
    const scores = crmCommercialIntelligenceService.scoring.scoreAll(CONTEXT);
    expect(scores.length).toBeGreaterThan(0);
    expect(scores.every((entry) => entry.score >= 0 && entry.score <= 100)).toBe(true);
  });

  it("generates explainable insights with why and likely next", () => {
    const insights = crmCommercialIntelligenceService.insights.generate(CONTEXT);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights.every((entry) => entry.why.length > 0 && entry.likelyNext.length > 0)).toBe(true);
  });

  it("generates actionable recommendations with rationale", () => {
    const recommendations = crmCommercialIntelligenceService.recommendations.generate(CONTEXT);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.every((entry) => entry.rationale.length > 0 && entry.expectedImpact.length > 0)).toBe(
      true,
    );
  });

  it("exposes executive dashboard with alerts and benchmarks", () => {
    const dashboard = crmCommercialIntelligenceService.executive.getExecutiveDashboard(CONTEXT);
    expect(dashboard.kpis.length).toBeGreaterThan(0);
    expect(dashboard.alerts.length).toBeGreaterThan(0);
    expect(dashboard.benchmarks.length).toBeGreaterThan(0);
    expect(dashboard.briefingLine).toContain("Pipeline health");
  });

  it("provides intelligence brief signals for Executive Brief", () => {
    const signals = mapCrmCommercialIntelligenceBriefSignals(crmCommercialIntelligenceService, CONTEXT);
    expect(signals.pipelineHealthScore).toBeGreaterThan(0);
    expect(signals.forecastRevenue).toBeTruthy();
    expect(crmService.getCommercialIntelligenceBriefSignals(CONTEXT).briefingLine).toContain("Pipeline health");
  });
});
