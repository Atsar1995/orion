import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockDashboardSnapshot } from "../fixtures/dashboard-snapshot";
import { mockProviderContributions } from "../fixtures/provider-contributions";

vi.mock("@/lib/providers/ProviderManager", () => ({
  providerManager: {
    connectAll: vi.fn(),
    getAllProviders: vi.fn(),
  },
}));

vi.mock("@/lib/intelligence/alerts/AlertEngine", () => ({
  buildAlertPanelSnapshot: vi.fn(),
  buildDashboardAlerts: vi.fn(),
}));

vi.mock("@/lib/intelligence/brief/ExecutiveBriefEngine", () => ({
  buildExecutiveBriefForDashboard: vi.fn(),
}));

vi.mock("@/lib/intelligence/recommendations/RecommendationEngine", () => ({
  buildDashboardRecommendations: vi.fn(),
}));

import { providerManager } from "@/lib/providers/ProviderManager";
import {
  buildAlertPanelSnapshot,
  buildDashboardAlerts,
} from "@/lib/intelligence/alerts/AlertEngine";
import { buildExecutiveBriefForDashboard } from "@/lib/intelligence/brief/ExecutiveBriefEngine";
import { buildDashboardRecommendations } from "@/lib/intelligence/recommendations/RecommendationEngine";
import {
  buildAlertsFromProviders,
  buildBusinessHealthFromProviders,
  buildDashboardSnapshotFromProviders,
  buildExecutiveBriefFromProviders,
  buildExecutiveMetricsFromProviders,
  buildExecutiveTasksFromProviders,
  buildRecommendationsFromProviders,
  buildTrendsFromProviders,
  fetchProviderContributions,
} from "@/lib/providers/dashboard-aggregator";

function createMockProvider(contribution: (typeof mockProviderContributions)[number]) {
  return {
    id: contribution.providerId,
    fetchDashboardContribution: vi.fn().mockResolvedValue({
      success: true,
      data: contribution,
      providerId: contribution.providerId,
      timestamp: "2026-07-25T10:00:00.000Z",
    }),
  };
}

describe("dashboard-aggregator", () => {
  beforeEach(() => {
    vi.mocked(providerManager.connectAll).mockResolvedValue(undefined);
    vi.mocked(providerManager.getAllProviders).mockReturnValue(
      mockProviderContributions.map(createMockProvider),
    );
    vi.mocked(buildAlertPanelSnapshot).mockResolvedValue(mockDashboardSnapshot.alertPanel);
    vi.mocked(buildExecutiveBriefForDashboard).mockResolvedValue(mockDashboardSnapshot.brief);
    vi.mocked(buildDashboardRecommendations).mockResolvedValue(
      mockDashboardSnapshot.recommendations,
    );
    vi.mocked(buildDashboardAlerts).mockResolvedValue(mockDashboardSnapshot.alerts);
  });

  it("fetches and filters successful provider contributions", async () => {
    const failingProvider = {
      id: "broken",
      fetchDashboardContribution: vi.fn().mockResolvedValue({
        success: false,
        providerId: "broken",
        timestamp: "2026-07-25T10:00:00.000Z",
      }),
    };

    vi.mocked(providerManager.getAllProviders).mockReturnValue([
      ...mockProviderContributions.map(createMockProvider),
      failingProvider,
    ]);

    const contributions = await fetchProviderContributions();

    expect(providerManager.connectAll).toHaveBeenCalledOnce();
    expect(contributions).toHaveLength(4);
    expect(contributions.map((item) => item.providerId)).toEqual([
      "finance",
      "hospitality",
      "crm",
      "marketing",
    ]);
  });

  it("aggregates metrics, health, trends, and tasks from providers", async () => {
    const metrics = await buildExecutiveMetricsFromProviders();
    const health = await buildBusinessHealthFromProviders();
    const trends = await buildTrendsFromProviders();
    const tasks = await buildExecutiveTasksFromProviders();

    expect(metrics.revenue.workspace).toBe("Finance");
    expect(metrics.marketing.trend).toBe("down");
    expect(health.score).toBe(50);
    expect(health.status).toBe("critical");
    expect(trends).toHaveLength(2);
    expect(tasks).toHaveLength(2);
  });

  it("builds a complete dashboard snapshot from providers and engines", async () => {
    const snapshot = await buildDashboardSnapshotFromProviders();

    expect(snapshot.brief.headline).toBe("Daily Executive Brief");
    expect(snapshot.recommendations).toHaveLength(1);
    expect(snapshot.alertPanel.counts.active).toBe(1);
    expect(snapshot.metrics.customer.value).toBe("312 active");
  });

  it("delegates brief, recommendation, and alert accessors to engines", async () => {
    await buildExecutiveBriefFromProviders();
    await buildRecommendationsFromProviders();
    await buildAlertsFromProviders();

    expect(buildExecutiveBriefForDashboard).toHaveBeenCalled();
    expect(buildDashboardRecommendations).toHaveBeenCalled();
    expect(buildDashboardAlerts).toHaveBeenCalled();
  });

  it("throws when required workspace metrics are missing", async () => {
    vi.mocked(providerManager.getAllProviders).mockReturnValue([
      createMockProvider(mockProviderContributions[0]!),
    ]);

    await expect(buildExecutiveMetricsFromProviders()).rejects.toThrow(
      /Dashboard metrics incomplete/,
    );
  });
});
