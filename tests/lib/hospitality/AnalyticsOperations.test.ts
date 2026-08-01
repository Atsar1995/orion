import { describe, expect, it } from "vitest";
import { DEFAULT_PROPERTY_ID, hospitalityAnalyticsService } from "@/lib/hospitality";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Hospitality Executive Intelligence & Analytics (Mission P-007.7)", () => {
  it("returns full analytics view with executive, operational, and commercial data", () => {
    const analytics = hospitalityAnalyticsService.getFullAnalytics(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(analytics.executive.health.overall).toBeGreaterThan(0);
    expect(analytics.operational.today.arrivals).toBeGreaterThanOrEqual(0);
    expect(analytics.kpis.length).toBeGreaterThanOrEqual(6);
    expect(analytics.insights.length).toBeGreaterThan(0);
    expect(analytics.recommendations.length).toBeGreaterThan(0);
  });

  it("computes KPI library with occupancy, ADR, RevPAR, and rates", () => {
    const kpis = hospitalityAnalyticsService.kpis.getKpis(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(kpis.some((entry) => entry.label === "Occupancy")).toBe(true);
    expect(kpis.some((entry) => entry.label === "ADR")).toBe(true);
    expect(kpis.some((entry) => entry.label === "RevPAR")).toBe(true);
    expect(kpis.some((entry) => entry.label === "Cancellation Rate")).toBe(true);
  });

  it("generates forecasts for occupancy, revenue, staffing, and maintenance", () => {
    const forecasts = hospitalityAnalyticsService.forecasts.getForecasts(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(forecasts.length).toBe(4);
    expect(forecasts[0]!.confidence).toBeGreaterThan(0);
    expect(forecasts[0]!.drivers.length).toBeGreaterThan(0);
  });

  it("provides trend analysis with narratives", () => {
    const trends = hospitalityAnalyticsService.trends.getTrends();

    expect(trends.length).toBeGreaterThanOrEqual(4);
    expect(trends.every((entry) => entry.narrative.length > 0)).toBe(true);
  });

  it("generates insights explaining why and recommending actions", () => {
    const kpis = hospitalityAnalyticsService.kpis.getKpis(CONTEXT, DEFAULT_PROPERTY_ID);
    const forecasts = hospitalityAnalyticsService.forecasts.getForecasts(CONTEXT, DEFAULT_PROPERTY_ID);
    const insights = hospitalityAnalyticsService.insights.generate(CONTEXT, DEFAULT_PROPERTY_ID, kpis, forecasts);

    expect(insights.some((entry) => entry.actionable)).toBe(true);
    expect(insights[0]!.narrative.length).toBeGreaterThan(20);
  });

  it("returns benchmark comparisons against comp-set", () => {
    const benchmarks = hospitalityAnalyticsService.benchmarks.getBenchmarks(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(benchmarks.length).toBeGreaterThan(0);
    expect(benchmarks.some((entry) => entry.status === "above")).toBe(true);
  });

  it("returns operational dashboard with housekeeping and maintenance", () => {
    const operational = hospitalityAnalyticsService.operational.getDashboard(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(operational.housekeeping.progressPercent).toBeGreaterThanOrEqual(0);
    expect(operational.maintenance.backlog).toBeGreaterThanOrEqual(0);
    expect(operational.rates.cancellationRate).toBeGreaterThanOrEqual(0);
  });

  it("returns guest and commercial analytics", () => {
    const guest = hospitalityAnalyticsService.guest.getAnalytics(CONTEXT);
    const commercial = hospitalityAnalyticsService.commercial.getAnalytics(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(guest.satisfactionScore).toBeGreaterThan(0);
    expect(commercial.bookingSources.length).toBeGreaterThan(0);
    expect(commercial.conversionRate).toBeGreaterThan(0);
  });

  it("exposes brief signals for executive platform integration", () => {
    const signals = hospitalityAnalyticsService.getBriefSignals(CONTEXT, DEFAULT_PROPERTY_ID);

    expect(signals.operationalHealth).toBeGreaterThan(0);
    expect(signals.revenueHealth).toBeGreaterThan(0);
    expect(signals.forecastOccupancy).toBeGreaterThan(0);
    expect(signals.insightCount).toBeGreaterThan(0);
  });
});
