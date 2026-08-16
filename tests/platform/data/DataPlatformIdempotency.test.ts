import { beforeEach, describe, expect, it } from "vitest";
import { DataPlatformFacade } from "@/lib/platform/data";
import { publishMasterDataEvent } from "@/lib/platform/data/data-platform-events";
import { InMemoryMasterEntityRepository } from "@/lib/platform/data/repositories/InMemoryMasterEntityRepository";
import { InMemorySynchronizationRepository } from "@/lib/platform/data/repositories/InMemorySynchronizationRepository";
import { publishSynchronizationEvent } from "@/lib/platform/data/synchronization-events";
import { buildIdempotencyKey } from "@/lib/platform/iil/envelope";
import {
  getIntelligenceIntegrationService,
  resetIntelligenceIntegrationForTests,
} from "@/lib/platform/intelligence";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Mission P-011 data platform IIL idempotency", () => {
  beforeEach(() => {
    resetIntelligenceIntegrationForTests();
  });

  it("assigns distinct canonical idempotency identities to master data lifecycle events", () => {
    const entityId = "md-idempotency-001";

    const activated = publishMasterDataEvent(
      {
        eventType: "MasterEntityActivated",
        entityType: "vendor",
        entityId,
        payload: { status: "active" },
      },
      CONTEXT,
    );

    const deactivated = publishMasterDataEvent(
      {
        eventType: "MasterEntityDeactivated",
        entityType: "vendor",
        entityId,
        payload: { status: "inactive" },
      },
      CONTEXT,
    );

    expect(activated.payload.canonicalEventType).toBe("MasterEntityActivated");
    expect(deactivated.payload.canonicalEventType).toBe("MasterEntityDeactivated");
    expect(activated.payload.masterDataEventType).toBe("MasterEntityActivated");
    expect(deactivated.payload.masterDataEventType).toBe("MasterEntityDeactivated");

    const activatedKey = buildIdempotencyKey(activated);
    const deactivatedKey = buildIdempotencyKey(deactivated);

    expect(activatedKey).toBe(`${CONTEXT.organizationId}:data-platform:MasterEntityActivated:${entityId}:1`);
    expect(deactivatedKey).toBe(
      `${CONTEXT.organizationId}:data-platform:MasterEntityDeactivated:${entityId}:1`,
    );
    expect(activatedKey).not.toBe(deactivatedKey);
  });

  it("allows two synchronization jobs for the same entity without idempotency collision", () => {
    const facade = new DataPlatformFacade(
      new InMemoryMasterEntityRepository(),
      undefined,
      new InMemorySynchronizationRepository(),
    );

    const syncInput = {
      syncType: "master_data" as const,
      changeEventType: "EntityUpdated" as const,
      entityType: "customer",
      entityId: "md-cust-sync-dup",
      incomingVersion: 1,
      payload: { validationPassed: "true" },
    };

    const firstJob = facade.synchronization.enqueue(syncInput, CONTEXT);
    const secondJob = facade.synchronization.enqueue(
      { ...syncInput, incomingVersion: 2 },
      CONTEXT,
    );

    expect(firstJob.id).toMatch(/^sync-/);
    expect(secondJob.id).toMatch(/^sync-/);
    expect(firstJob.id).not.toBe(secondJob.id);

    const startedEvents = getIntelligenceIntegrationService()
      .listEvents(CONTEXT, 20)
      .filter((event) => event.payload.synchronizationEventType === "SynchronizationStarted");

    expect(startedEvents).toHaveLength(2);
    expect(startedEvents.every((event) => event.entityId !== "pending")).toBe(true);
    expect(new Set(startedEvents.map((event) => buildIdempotencyKey(event))).size).toBe(2);
  });

  it("still suppresses duplicate publish for the same logical master data event", () => {
    const input = {
      eventType: "MasterEntityUpdated" as const,
      entityType: "employee" as const,
      entityId: "md-emp-dup-001",
      correlationId: "corr-md-dup-001",
      payload: { version: "2" },
    };

    publishMasterDataEvent(input, CONTEXT);
    expect(() => publishMasterDataEvent(input, CONTEXT)).toThrow("DUPLICATE_EVENT");
  });

  it("still suppresses duplicate publish for the same logical synchronization event", () => {
    const input = {
      eventType: "SynchronizationStarted" as const,
      jobId: "sync-dup-001",
      entityType: "customer",
      entityId: "md-cust-dup-001",
      correlationId: "corr-sync-dup-001",
      payload: { changeEventType: "EntityUpdated", syncType: "master_data" },
    };

    publishSynchronizationEvent(input, CONTEXT);
    expect(() => publishSynchronizationEvent(input, CONTEXT)).toThrow("DUPLICATE_EVENT");
  });
});
