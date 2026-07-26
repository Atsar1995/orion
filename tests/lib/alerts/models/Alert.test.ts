import { describe, expect, it } from "vitest";
import { filterAlerts } from "@/lib/alerts/models/Alert";
import type { ExecutiveAlert } from "@/lib/alerts/models/Alert";

const alerts: ExecutiveAlert[] = [
  {
    id: "alert-1",
    title: "Guest complaint",
    message: "Room 305 requires response",
    severity: "critical",
    category: "hospitality",
    source: "platform",
    status: "active",
    workspace: "Hospitality",
    dedupeKey: "guest-305",
    createdAt: "2026-07-26T05:00:00.000Z",
    updatedAt: "2026-07-26T06:00:00.000Z",
  },
  {
    id: "alert-2",
    title: "Finance close",
    message: "Week-close pending approval",
    severity: "medium",
    category: "finance",
    source: "event",
    status: "resolved",
    workspace: "Finance",
    dedupeKey: "finance-close",
    createdAt: "2026-07-26T04:00:00.000Z",
    updatedAt: "2026-07-26T06:00:00.000Z",
  },
];

describe("filterAlerts", () => {
  it("filters alerts by severity", () => {
    expect(filterAlerts(alerts, { severity: "critical" })).toHaveLength(1);
    expect(filterAlerts(alerts, { severity: "critical" })[0]?.id).toBe("alert-1");
  });

  it("filters alerts by status and category", () => {
    expect(filterAlerts(alerts, { status: "resolved", category: "finance" })).toEqual([
      alerts[1],
    ]);
  });

  it("filters alerts by case-insensitive query", () => {
    expect(filterAlerts(alerts, { query: "room 305" })).toEqual([alerts[0]]);
  });
});
