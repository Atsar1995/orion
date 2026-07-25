import { describe, expect, it, vi, beforeEach } from "vitest";
import { mockDashboardSnapshot } from "../fixtures/dashboard-snapshot";

vi.mock("@/lib/orchestrator/Orchestrator", () => ({
  getDashboardSnapshot: vi.fn(),
}));

vi.mock("@/lib/intelligence/brief/ExecutiveBriefEngine", () => ({
  buildExecutiveBriefForDashboard: vi.fn(),
  buildDailyExecutiveBrief: vi.fn(),
}));

vi.mock("@/lib/intelligence/recommendations/RecommendationEngine", () => ({
  buildRecommendationBundle: vi.fn(),
  buildDashboardRecommendations: vi.fn(),
}));

vi.mock("@/lib/intelligence/alerts/AlertEngine", () => ({
  buildAlertBundle: vi.fn(),
  buildAlertPanelSnapshot: vi.fn(),
  buildDashboardAlerts: vi.fn(),
}));

vi.mock("@/lib/providers/dashboard-aggregator", () => ({
  buildAlertsFromProviders: vi.fn(),
  buildBusinessHealthFromProviders: vi.fn(),
  buildExecutiveMetricsFromProviders: vi.fn(),
  buildExecutiveTasksFromProviders: vi.fn(),
  buildRecommendationsFromProviders: vi.fn(),
  buildTrendsFromProviders: vi.fn(),
}));

import { getDashboardSnapshot } from "@/lib/orchestrator/Orchestrator";
import {
  buildDailyExecutiveBrief,
  buildExecutiveBriefForDashboard,
} from "@/lib/intelligence/brief/ExecutiveBriefEngine";
import { buildRecommendationBundle } from "@/lib/intelligence/recommendations/RecommendationEngine";
import {
  buildAlertBundle,
  buildAlertPanelSnapshot,
  buildDashboardAlerts,
} from "@/lib/intelligence/alerts/AlertEngine";
import {
  buildAlertsFromProviders,
  buildBusinessHealthFromProviders,
  buildExecutiveMetricsFromProviders,
  buildExecutiveTasksFromProviders,
  buildRecommendationsFromProviders,
  buildTrendsFromProviders,
} from "@/lib/providers/dashboard-aggregator";
import { executiveIntelligenceService } from "@/lib/intelligence/ExecutiveIntelligenceService";

describe("ExecutiveIntelligenceService", () => {
  beforeEach(() => {
    vi.mocked(getDashboardSnapshot).mockResolvedValue(mockDashboardSnapshot);
    vi.mocked(buildExecutiveBriefForDashboard).mockResolvedValue(mockDashboardSnapshot.brief);
    vi.mocked(buildDailyExecutiveBrief).mockResolvedValue({
      id: "brief-1",
      generatedAt: "2026-07-25T10:00:00.000Z",
      scheduledFor: "2026-07-25T00:00:00.000Z",
      templateId: "orion-default",
      summary: {
        headline: "Daily Executive Brief",
        narrative: "Test narrative",
      },
      sections: [],
      topPriorities: [],
      recommendedActions: [],
    });
    vi.mocked(buildRecommendationBundle).mockResolvedValue({
      generatedAt: "2026-07-25T10:00:00.000Z",
      recommendations: [],
    });
    vi.mocked(buildAlertBundle).mockResolvedValue({
      generatedAt: "2026-07-25T10:00:00.000Z",
      active: [],
      critical: [],
      recent: [],
      resolved: [],
      groups: [],
      counts: mockDashboardSnapshot.alertPanel.counts,
    });
    vi.mocked(buildAlertPanelSnapshot).mockResolvedValue(mockDashboardSnapshot.alertPanel);
    vi.mocked(buildDashboardAlerts).mockResolvedValue(mockDashboardSnapshot.alerts);
    vi.mocked(buildRecommendationsFromProviders).mockResolvedValue(
      mockDashboardSnapshot.recommendations,
    );
    vi.mocked(buildAlertsFromProviders).mockResolvedValue(mockDashboardSnapshot.alerts);
    vi.mocked(buildBusinessHealthFromProviders).mockResolvedValue(
      mockDashboardSnapshot.businessHealth,
    );
    vi.mocked(buildTrendsFromProviders).mockResolvedValue(mockDashboardSnapshot.trends);
    vi.mocked(buildExecutiveTasksFromProviders).mockResolvedValue(mockDashboardSnapshot.tasks);
    vi.mocked(buildExecutiveMetricsFromProviders).mockResolvedValue(mockDashboardSnapshot.metrics);
  });

  it("delegates dashboard snapshot to orchestrator", async () => {
    const snapshot = await executiveIntelligenceService.getDashboardSnapshot();

    expect(getDashboardSnapshot).toHaveBeenCalledOnce();
    expect(snapshot.metrics.revenue.value).toBe("₹42.8L");
    expect(snapshot.alertPanel.counts.active).toBe(1);
  });

  it("exposes engine-specific accessors through service layer", async () => {
    await executiveIntelligenceService.getExecutiveBrief();
    await executiveIntelligenceService.getDailyExecutiveBrief();
    await executiveIntelligenceService.getRecommendationBundle();
    await executiveIntelligenceService.getAlertPanel();
    await executiveIntelligenceService.getBusinessHealth();

    expect(buildExecutiveBriefForDashboard).toHaveBeenCalled();
    expect(buildDailyExecutiveBrief).toHaveBeenCalled();
    expect(buildRecommendationBundle).toHaveBeenCalled();
    expect(buildAlertPanelSnapshot).toHaveBeenCalled();
    expect(buildBusinessHealthFromProviders).toHaveBeenCalled();
  });

  it("routes provider-backed accessors through dashboard aggregator", async () => {
    await executiveIntelligenceService.getRecommendations();
    await executiveIntelligenceService.getAlerts();
    await executiveIntelligenceService.getAlertBundle();
    await executiveIntelligenceService.getTrends();
    await executiveIntelligenceService.getExecutiveTasks();
    await executiveIntelligenceService.getExecutiveMetrics();

    expect(buildRecommendationsFromProviders).toHaveBeenCalled();
    expect(buildAlertsFromProviders).toHaveBeenCalled();
    expect(buildAlertBundle).toHaveBeenCalled();
    expect(buildTrendsFromProviders).toHaveBeenCalled();
    expect(buildExecutiveTasksFromProviders).toHaveBeenCalled();
    expect(buildExecutiveMetricsFromProviders).toHaveBeenCalled();
  });
});
