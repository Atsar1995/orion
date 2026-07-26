import { describe, expect, it } from "vitest";
import { deduplicateAlertSignals } from "@/lib/alerts/engine/AlertDeduplicator";
import type { ExecutiveAlertSignal } from "@/lib/alerts/models/Alert";

const baseSignal: ExecutiveAlertSignal = {
  id: "signal-a",
  title: "Guest complaint",
  message: "Room 305",
  severity: "critical",
  category: "hospitality",
  source: "platform",
  status: "active",
  workspace: "Hospitality",
  dedupeKey: "guest-complaint-room-305",
  createdAt: "2026-07-26T05:00:00.000Z",
};

describe("AlertDeduplicator", () => {
  it("removes duplicate alert signals by normalized dedupe key", () => {
    const duplicate: ExecutiveAlertSignal = {
      ...baseSignal,
      id: "signal-b",
      message: "Duplicate Room 305 signal",
      source: "event",
      createdAt: "2026-07-26T05:30:00.000Z",
    };

    expect(deduplicateAlertSignals([baseSignal, duplicate])).toEqual([baseSignal]);
  });

  it("preserves distinct alerts with unique dedupe keys", () => {
    const other: ExecutiveAlertSignal = {
      ...baseSignal,
      id: "signal-c",
      dedupeKey: "marketing-roas-below-target",
      severity: "high",
      category: "marketing",
    };

    expect(deduplicateAlertSignals([baseSignal, other])).toEqual([baseSignal, other]);
  });
});
