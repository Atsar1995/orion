import { describe, expect, it } from "vitest";
import { AlertEngine } from "@/lib/alerts/engine/AlertEngine";
import { MOCK_EXECUTIVE_ALERT_SIGNALS } from "@/lib/alerts/mock/MockExecutiveAlertSignals";

describe("AlertEngine", () => {
  it("produces a deterministic alert center snapshot from mock signals", () => {
    const engine = new AlertEngine();
    const first = engine.process({
      signals: MOCK_EXECUTIVE_ALERT_SIGNALS,
      generatedAt: "2026-07-26T06:00:00.000Z",
    });
    const second = engine.process({
      signals: MOCK_EXECUTIVE_ALERT_SIGNALS,
      generatedAt: "2026-07-26T06:00:00.000Z",
    });

    expect(first).toEqual(second);
    expect(first.alerts[0]?.severity).toBe("critical");
    expect(first.counts.total).toBe(7);
    expect(first.counts.critical).toBe(1);
  });

  it("deduplicates configured rules against duplicate incoming signals", () => {
    const snapshot = new AlertEngine().process({
      signals: MOCK_EXECUTIVE_ALERT_SIGNALS,
      generatedAt: "2026-07-26T06:00:00.000Z",
    });

    const guestAlerts = snapshot.alerts.filter(
      (alert) => alert.dedupeKey === "guest-complaint-room-305",
    );

    expect(guestAlerts).toHaveLength(1);
  });

  it("prioritizes alerts by severity in the returned snapshot", () => {
    const snapshot = new AlertEngine().process({
      signals: MOCK_EXECUTIVE_ALERT_SIGNALS,
      generatedAt: "2026-07-26T06:00:00.000Z",
    });

    const severities = snapshot.alerts.map((alert) => alert.severity);

    expect(severities).toEqual([
      "critical",
      "high",
      "high",
      "medium",
      "medium",
      "low",
      "information",
    ]);
  });
});
