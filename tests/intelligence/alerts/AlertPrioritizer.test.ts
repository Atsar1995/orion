import { describe, expect, it } from "vitest";
import {
  buildAlertCounts,
  buildAlertBundle,
  deduplicateAlerts,
  escalateUnresolvedAlerts,
  groupRelatedAlerts,
  rankAlerts,
} from "@/lib/intelligence/alerts/AlertPrioritizer";
import { createTestAlert } from "../../fixtures/alerts";

describe("AlertPrioritizer", () => {
  it("deduplicates alerts by dedupe key", () => {
    const alerts = [
      createTestAlert({ id: "a", trigger: { ...createTestAlert().trigger, payload: { dedupeKey: "dup" } } }),
      createTestAlert({ id: "b", trigger: { ...createTestAlert().trigger, payload: { dedupeKey: "dup" } } }),
    ];

    expect(deduplicateAlerts(alerts)).toHaveLength(1);
  });

  it("ranks alerts by severity", () => {
    const ranked = rankAlerts([
      createTestAlert({ id: "low", severity: "low" }),
      createTestAlert({ id: "critical", severity: "critical" }),
    ]);

    expect(ranked[0]?.severity).toBe("critical");
  });

  it("groups alerts by group id", () => {
    const groups = groupRelatedAlerts([
      createTestAlert({ id: "1", groupId: "finance-signals", category: "finance" }),
      createTestAlert({ id: "2", groupId: "finance-signals", category: "finance" }),
      createTestAlert({ id: "3", groupId: "ops", category: "operations" }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.id === "finance-signals")?.alerts).toHaveLength(2);
  });

  it("escalates stale active alerts using fixed age threshold", () => {
    const staleCreatedAt = new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString();
    const escalated = escalateUnresolvedAlerts([
      createTestAlert({
        id: "stale",
        severity: "medium",
        createdAt: staleCreatedAt,
        updatedAt: staleCreatedAt,
      }),
      createTestAlert({
        id: "fresh",
        severity: "medium",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ]);

    expect(escalated.find((alert) => alert.id === "stale")?.status).toBe("escalated");
    expect(escalated.find((alert) => alert.id === "fresh")?.status).toBe("active");
  });

  it("builds alert bundle with counts and sections", () => {
    const bundle = buildAlertBundle(
      [createTestAlert({ severity: "critical" }), createTestAlert({ id: "high", severity: "high" })],
      [createTestAlert({ id: "resolved", status: "resolved" })],
      "2026-07-25T10:00:00.000Z",
    );

    expect(bundle.critical.length).toBeGreaterThan(0);
    expect(bundle.counts.total).toBe(3);
    expect(bundle.counts.active).toBe(2);
    expect(buildAlertCounts(bundle.active, bundle.resolved).resolved).toBe(1);
  });
});
