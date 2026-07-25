import { describe, expect, it } from "vitest";
import { createTestAlert } from "../../fixtures/alerts";
import { alertHistory } from "@/lib/intelligence/alerts/AlertHistory";

describe("AlertHistory", () => {
  it("records, escalates, and resolves a specific alert", () => {
    const alertId = `alert-history-${Date.now()}`;
    const alert = createTestAlert({ id: alertId });

    alertHistory.record(alert);
    expect(alertHistory.getActive().some((item) => item.id === alertId)).toBe(true);

    const escalated = alertHistory.escalate(alertId);
    expect(escalated?.status).toBe("escalated");
    expect(escalated?.severity).toBe("critical");

    const resolved = alertHistory.resolve(alertId, "Handled by ops");
    expect(resolved?.status).toBe("resolved");
    expect(resolved?.resolution?.note).toBe("Handled by ops");
    expect(alertHistory.getActive().some((item) => item.id === alertId)).toBe(false);
  });

  it("returns seeded resolved alerts and history entries", () => {
    const resolved = alertHistory.getResolved(2);

    expect(resolved.length).toBeGreaterThan(0);
    expect(resolved.every((alert) => alert.status === "resolved")).toBe(true);

    const history = alertHistory.getHistory();
    expect(history.some((entry) => entry.alertId === "alert-resolved-1")).toBe(true);
  });

  it("detects duplicate dedupe keys across active and resolved alerts", () => {
    expect(alertHistory.hasDuplicate("resolved-pos-sync")).toBe(true);
    expect(alertHistory.hasDuplicate("unique-dedupe-key")).toBe(false);
  });
});
