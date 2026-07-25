import { describe, expect, it } from "vitest";
import {
  extractGA4CoreMetrics,
  mapGA4SnapshotToContribution,
} from "@/lib/providers/google-analytics/GA4Mapper";
import { createTestSnapshot } from "@/tests/fixtures/ga4";

describe("GA4Mapper", () => {
  it("maps a GA4 snapshot into a dashboard contribution", () => {
    const contribution = mapGA4SnapshotToContribution(createTestSnapshot());

    expect(contribution.providerId).toBe("google-analytics");
    expect(contribution.workspace).toBe("Marketing");
    expect(contribution.metric?.label).toBe("Marketing Metrics");
    expect(contribution.healthDriver?.label).toBe("Marketing");
    expect(contribution.trends).toHaveLength(5);
    expect(contribution.briefSegments?.length).toBeGreaterThan(0);
  });

  it("formats large counts and currency values", () => {
    const contribution = mapGA4SnapshotToContribution(
      createTestSnapshot({
        comparison: {
          periodLabel: "7d",
          current: {
            sessions: 1_500_000,
            users: 2_500,
            activeUsers: 750,
            newUsers: 200,
            pageViews: 2500,
            screenViews: 2500,
            revenue: 250_000,
            transactions: 25,
            conversions: 100,
            bounceRate: 0.45,
            engagementRate: 0.55,
            averageEngagementTime: 45,
          },
          previous: {
            sessions: 900,
            users: 700,
            activeUsers: 650,
            newUsers: 180,
            pageViews: 2200,
            screenViews: 2200,
            revenue: 0,
            transactions: 0,
            conversions: 90,
            bounceRate: 0.5,
            engagementRate: 0.5,
            averageEngagementTime: 110,
          },
        },
      }),
    );

    expect(contribution.metric?.value).toContain("1.5M");
    expect(
      (contribution.trends ?? []).find((trend) => trend.id === "trend-ga4-revenue")?.currentValue,
    ).toBe("₹2.5L");
    expect(
      (contribution.briefSegments ?? []).some((segment) => segment.includes("45s")),
    ).toBe(true);
  });

  it("derives critical marketing health for poor engagement", () => {
    const contribution = mapGA4SnapshotToContribution(
      createTestSnapshot({
        comparison: {
          periodLabel: "7d",
          current: {
            sessions: 1000,
            users: 800,
            activeUsers: 750,
            newUsers: 200,
            pageViews: 2500,
            screenViews: 2500,
            revenue: 50_000,
            transactions: 25,
            conversions: 100,
            bounceRate: 0.7,
            engagementRate: 0.3,
            averageEngagementTime: 120,
          },
          previous: createTestSnapshot().comparison.previous,
        },
      }),
    );

    expect(contribution.healthDriver?.status).toBe("critical");
    expect(
      (contribution.alerts ?? []).some((alert) => alert.severity === "critical"),
    ).toBe(true);
  });

  it("derives attention health for declining sessions", () => {
    const contribution = mapGA4SnapshotToContribution(
      createTestSnapshot({
        comparison: {
          periodLabel: "7d",
          current: {
            ...createTestSnapshot().comparison.current,
            sessions: 800,
            bounceRate: 0.58,
            engagementRate: 0.42,
          },
          previous: {
            ...createTestSnapshot().comparison.previous,
            sessions: 1000,
          },
        },
      }),
    );

    expect(contribution.healthDriver?.status).toBe("attention");
    expect(
      (contribution.recommendations ?? []).some((rec) => rec.id === "rec-ga4-traffic-decline"),
    ).toBe(true);
  });

  it("builds bounce-rate and campaign recommendations", () => {
    const contribution = mapGA4SnapshotToContribution(
      createTestSnapshot({
        comparison: {
          periodLabel: "7d",
          current: {
            ...createTestSnapshot().comparison.current,
            bounceRate: 0.6,
          },
          previous: createTestSnapshot().comparison.previous,
        },
        campaigns: [{ campaign: "awareness", sessions: 120, conversions: 0, revenue: 0 }],
      }),
    );

    expect(
      (contribution.recommendations ?? []).some((rec) => rec.id === "rec-ga4-bounce-rate"),
    ).toBe(true);
    expect(
      (contribution.recommendations ?? []).some((rec) => rec.id === "rec-ga4-campaign-conversion"),
    ).toBe(true);
  });

  it("builds conversion growth recommendations and revenue alerts", () => {
    const contribution = mapGA4SnapshotToContribution(
      createTestSnapshot({
        comparison: {
          periodLabel: "7d",
          current: {
            ...createTestSnapshot().comparison.current,
            conversions: 150,
            revenue: 30_000,
            sessions: 700,
          },
          previous: {
            ...createTestSnapshot().comparison.previous,
            conversions: 100,
            revenue: 50_000,
            sessions: 1000,
          },
        },
      }),
    );

    expect(
      (contribution.recommendations ?? []).some((rec) => rec.id === "rec-ga4-conversion-growth"),
    ).toBe(true);
    expect(
      (contribution.alerts ?? []).some((alert) => alert.id === "alert-ga4-traffic-drop"),
    ).toBe(true);
    expect(
      (contribution.alerts ?? []).some((alert) => alert.id === "alert-ga4-revenue-drop"),
    ).toBe(true);
  });

  it("omits revenue brief segments when revenue is zero", () => {
    const contribution = mapGA4SnapshotToContribution(
      createTestSnapshot({
        comparison: {
          periodLabel: "7d",
          current: {
            ...createTestSnapshot().comparison.current,
            revenue: 0,
            transactions: 0,
          },
          previous: createTestSnapshot().comparison.previous,
        },
        trafficSources: [],
      }),
    );

    expect(
      (contribution.briefSegments ?? []).some((segment) => segment.includes("E-commerce revenue")),
    ).toBe(false);
  });

  it("extracts raw core metrics for diagnostics", () => {
    const comparison = createTestSnapshot().comparison;

    expect(extractGA4CoreMetrics(comparison)).toEqual({
      current: comparison.current,
      previous: comparison.previous,
    });
  });
});
