import { describe, expect, it } from "vitest";
import { prioritizeAlertSignals } from "@/lib/alerts/engine/AlertPrioritizer";
import type { ExecutiveAlertSignal } from "@/lib/alerts/models/Alert";

function createSignal(
  id: string,
  severity: ExecutiveAlertSignal["severity"],
  createdAt: string,
): ExecutiveAlertSignal {
  return {
    id,
    title: `Alert ${id}`,
    message: `Message ${id}`,
    severity,
    category: "operations",
    source: "platform",
    status: "active",
    workspace: "Platform",
    dedupeKey: id,
    createdAt,
  };
}

describe("AlertPrioritizer", () => {
  it("orders alerts by severity before recency", () => {
    const ordered = prioritizeAlertSignals([
      createSignal("low-alert", "low", "2026-07-26T06:00:00.000Z"),
      createSignal("critical-alert", "critical", "2026-07-26T04:00:00.000Z"),
      createSignal("high-alert", "high", "2026-07-26T05:00:00.000Z"),
    ]);

    expect(ordered.map((alert) => alert.id)).toEqual([
      "critical-alert",
      "high-alert",
      "low-alert",
    ]);
  });

  it("breaks severity ties by recency and identifier", () => {
    const ordered = prioritizeAlertSignals([
      createSignal("alert-b", "medium", "2026-07-26T05:00:00.000Z"),
      createSignal("alert-a", "medium", "2026-07-26T06:00:00.000Z"),
    ]);

    expect(ordered.map((alert) => alert.id)).toEqual(["alert-a", "alert-b"]);
  });
});
