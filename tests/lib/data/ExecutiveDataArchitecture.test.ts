import { describe, expect, it, beforeEach } from "vitest";
import { executiveIntelligenceEngine } from "@/lib/data/intelligence/ExecutiveIntelligenceEngine";
import { mapSnapshotToDashboardState } from "@/lib/data/mappers/map-snapshot-to-dashboard-state";
import { platformLogger } from "@/lib/data/logging/PlatformLogger";
import type { DashboardSnapshot } from "@/types/intelligence";

const SAMPLE_SNAPSHOT: DashboardSnapshot = {
  businessHealth: {
    score: 84,
    maxScore: 100,
    trend: "+2",
    status: "healthy",
    summary: "Platform health is stable.",
    drivers: [
      { label: "Finance", status: "healthy" },
      { label: "CRM", status: "healthy" },
    ],
  },
  metrics: {
    revenue: {
      id: "metric-revenue",
      label: "Revenue",
      value: "₹40L",
      change: "+5%",
      trend: "up",
      workspace: "Finance",
    },
    occupancy: {
      id: "metric-occupancy",
      label: "Occupancy",
      value: "82%",
      change: "+3 pts",
      trend: "up",
      workspace: "Hospitality",
    },
    customer: {
      id: "metric-customer",
      label: "Customers",
      value: "280",
      change: "+10",
      trend: "up",
      workspace: "CRM",
    },
    marketing: {
      id: "metric-marketing",
      label: "ROAS",
      value: "4.0×",
      change: "-0.1",
      trend: "down",
      workspace: "Marketing",
    },
  },
  brief: {
    headline: "Executive Brief",
    body: "Finance and CRM remain healthy.",
    generatedAt: "2026-07-29T06:00:00.000Z",
  },
  recommendations: [
    {
      id: "rec-1",
      priority: 1,
      title: "Review pipeline forecast",
      description: "CRM pipeline variance requires executive review.",
      category: "executive",
    },
  ],
  alerts: [
    {
      id: "alert-1",
      severity: "attention",
      message: "Supplier payment follow-up required",
      category: "follow-up",
    },
  ],
  alertPanel: {
    critical: [],
    recent: [],
    resolved: [],
    counts: {
      total: 1,
      critical: 0,
      high: 1,
      medium: 0,
      low: 0,
      information: 0,
      active: 1,
      resolved: 0,
      escalated: 0,
    },
  },
  tasks: [{ id: "task-1", title: "Approve finance adjustments" }],
  trends: [
    {
      id: "trend-revenue",
      label: "Revenue",
      currentValue: "₹40L",
      previousValue: "₹38L",
      direction: "up",
      period: "7d",
      workspace: "Finance",
    },
  ],
};

describe("Mission S1C shared data architecture", () => {
  beforeEach(() => {
    platformLogger.clear();
    executiveIntelligenceEngine.invalidateCache();
  });

  it("maps orchestrator snapshots into dashboard widget state", () => {
    const state = mapSnapshotToDashboardState(SAMPLE_SNAPSHOT);

    expect(state.businessHealth.score).toBe(84);
    expect(state.kpis.items).toHaveLength(4);
    expect(state.recommendations.items[0]?.title).toBe("Review pipeline forecast");
    expect(state.sourceProviders).toEqual(["Finance", "CRM"]);
  });

  it("returns provider-backed morning brief envelope", async () => {
    const envelope = await executiveIntelligenceEngine.getMorningBriefEnvelope("Mohammad Shafi");

    expect(["ready", "empty"]).toContain(envelope.status);
    expect(envelope.data?.greeting.executiveName).toBe("Mohammad");
    expect(envelope.sources.length).toBeGreaterThan(0);
  });

  it("returns dashboard envelope from orchestrator pipeline", async () => {
    const envelope = await executiveIntelligenceEngine.getDashboardEnvelope();

    expect(envelope.status).toBe("ready");
    expect(envelope.data?.generatedAt).toBeTruthy();
    expect(envelope.data?.kpis.items.length).toBeGreaterThan(0);
  });

  it("maps recommendations to executive insight records with explainability fields", async () => {
    const insights = await executiveIntelligenceEngine.getExecutiveInsights();

    if (insights.length > 0) {
      expect(insights[0]?.source).toBeTruthy();
      expect(insights[0]?.confidence).toBeGreaterThan(0);
      expect(insights[0]?.businessImpact).toBeTruthy();
      expect(insights[0]?.generatedAt).toBeTruthy();
    }
  });
});
