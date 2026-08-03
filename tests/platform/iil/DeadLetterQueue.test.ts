import { beforeEach, describe, expect, it } from "vitest";
import { IILDeadLetterQueue } from "@/lib/platform/iil/DeadLetterQueue";
import type { IntelligenceEvent } from "@/types/intelligence-integration";

const EVENT: IntelligenceEvent = {
  eventId: "evt-dlq-001",
  eventType: "CustomEvent",
  sourceService: "hcm-workspace",
  sourceWorkspace: "HCM",
  organizationId: "org-orania",
  entityType: "employee",
  entityId: "emp-001",
  timestamp: "2026-08-03T12:00:00.000Z",
  actorId: "user-test",
  priority: "normal",
  correlationId: "corr-dlq-001",
  payload: {},
  version: "1",
  securityClassification: "internal",
  auditMetadata: {},
};

describe("IILDeadLetterQueue (P-009.16)", () => {
  let queue: IILDeadLetterQueue;

  beforeEach(() => {
    queue = new IILDeadLetterQueue();
  });

  it("persists failed delivery records", () => {
    const record = queue.enqueue(EVENT, "Delivery failed", 5, "timeout");

    expect(record.event.eventId).toBe("evt-dlq-001");
    expect(queue.list("org-orania")).toHaveLength(1);
  });

  it("removes and returns records for DLQ replay", () => {
    const record = queue.enqueue(EVENT, "Delivery failed", 5);
    const removed = queue.remove(record.id);

    expect(removed?.event.eventId).toBe("evt-dlq-001");
    expect(queue.list("org-orania")).toHaveLength(0);
  });

  it("scopes listings by organization", () => {
    queue.enqueue(EVENT, "failed", 3);
    queue.enqueue({ ...EVENT, eventId: "evt-dlq-002", organizationId: "org-other" }, "failed", 3);

    expect(queue.list("org-orania")).toHaveLength(1);
    expect(queue.list("org-other")).toHaveLength(1);
  });
});
