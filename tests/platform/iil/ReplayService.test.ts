import { describe, expect, it } from "vitest";
import { ReplayService } from "@/lib/platform/iil/ReplayService";
import type { IntelligenceEvent } from "@/types/intelligence-integration";

const EVENTS: IntelligenceEvent[] = [
  {
    eventId: "evt-replay-001",
    eventType: "CustomEvent",
    sourceService: "hcm-workspace",
    sourceWorkspace: "HCM",
    organizationId: "org-orania",
    entityType: "employee",
    entityId: "emp-001",
    timestamp: "2026-08-03T10:00:00.000Z",
    actorId: "user-test",
    priority: "normal",
    correlationId: "corr-replay-001",
    payload: { canonicalEventType: "hcm.workforce.cost.recorded" },
    version: "1",
    securityClassification: "internal",
    auditMetadata: {},
  },
  {
    eventId: "evt-replay-002",
    eventType: "CustomEvent",
    sourceService: "hcm-workspace",
    sourceWorkspace: "HCM",
    organizationId: "org-orania",
    entityType: "employee",
    entityId: "emp-002",
    timestamp: "2026-08-03T11:00:00.000Z",
    actorId: "user-test",
    priority: "normal",
    correlationId: "corr-replay-002",
    payload: {},
    version: "1",
    securityClassification: "internal",
    auditMetadata: {},
  },
];

describe("ReplayService (P-009.16)", () => {
  it("replays events filtered by correlationId", async () => {
    const replayService = new ReplayService();
    const processed: string[] = [];

    const result = await replayService.replay(
      {
        organizationId: "org-orania",
        correlationId: "corr-replay-001",
      },
      {
        findEvents: async () => EVENTS,
        createDelivery: async () => undefined,
      },
      async (delivery) => {
        processed.push(delivery.eventId);
      },
    );

    expect(result.replayed).toBe(1);
    expect(processed).toEqual(["evt-replay-001"]);
  });

  it("replays events filtered by eventType", async () => {
    const replayService = new ReplayService();
    const processed: string[] = [];

    const result = await replayService.replay(
      {
        organizationId: "org-orania",
        eventType: "hcm.workforce.cost.recorded",
      },
      {
        findEvents: async () => EVENTS,
        createDelivery: async () => undefined,
      },
      async (delivery) => {
        processed.push(delivery.eventId);
      },
    );

    expect(result.replayed).toBe(1);
    expect(processed).toEqual(["evt-replay-001"]);
  });
});
