import { beforeEach, describe, expect, it } from "vitest";
import { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import { registerIntelligenceHandlers } from "@/lib/platform/intelligence/register-intelligence-handlers";
import {
  InMemoryDurableTransport,
  InMemoryDurableTransportBacking,
  PostgresDurableTransport,
  RetryPolicy,
} from "@/lib/platform/iil";
import { createIntelligenceEvent } from "@/lib/platform/intelligence/IntelligenceEventFactory";
import { enrichDurableEnvelope } from "@/lib/platform/iil/envelope";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

function createService(backing?: InMemoryDurableTransportBacking) {
  const transport = new InMemoryDurableTransport({
    backing,
    retryPolicy: new RetryPolicy(3, 25, 200),
  });
  const service = new IntelligenceIntegrationService({
    transport,
    serviceRegistry: new ServiceRegistry(),
    webhookGateway: new WebhookGateway(),
  });
  registerIntelligenceHandlers(service);
  return { service, transport };
}

describe("DurableIIL (P-009.16)", () => {
  beforeEach(() => {
    /* isolated backing per test via factory */
  });

  it("persists events before publisher ack (persist-before-ack)", () => {
    const backing = new InMemoryDurableTransportBacking();
    const { service, transport } = createService(backing);

    const event = service.publish(
      {
        eventType: "DecisionCreated",
        sourceService: "decision-intelligence",
        sourceWorkspace: "Platform",
        entityType: "decision",
        entityId: "dec-001",
        actorId: "user-executive",
      },
      CONTEXT,
    );

    expect(backing.events.has(event.eventId)).toBe(true);
    expect(transport.getMetrics().persistedEvents).toBe(1);
  });

  it("survives process restart via shared durable backing", async () => {
    const backing = new InMemoryDurableTransportBacking();
    const first = createService(backing);

    first.transport.stopDeliveryLoop();
    first.service.publish(
      {
        eventType: "TaskCompleted",
        sourceService: "crm-workspace",
        sourceWorkspace: "CRM",
        entityType: "task",
        entityId: "task-restart-001",
        actorId: "user-executive",
        eventId: "evt-restart-001",
      },
      CONTEXT,
    );

    const restartedTransport = new InMemoryDurableTransport({ backing });
    restartedTransport.stopDeliveryLoop();
    backing.pendingQueue.length = 0;
    const recovered = await restartedTransport.recoverPendingDeliveries();

    expect(recovered).toBeGreaterThan(0);
    expect(backing.events.has("evt-restart-001")).toBe(true);
  });

  it("suppresses duplicate eventId and idempotencyKey delivery", () => {
    const { service } = createService();
    const input = {
      eventType: "MemoryCreated" as const,
      sourceService: "decision-intelligence",
      sourceWorkspace: "Platform",
      entityType: "memory",
      entityId: "mem-dup-001",
      actorId: "user-executive",
      eventId: "evt-dup-fixed",
      payload: { idempotencyKey: "org-orania:decision-intelligence:MemoryCreated:mem-dup-001:1" },
    };

    service.publish(input, CONTEXT);
    expect(() => service.publish(input, CONTEXT)).toThrow("DUPLICATE_EVENT");
  });

  it("delivers within partition ordering", async () => {
    const { service } = createService();
    const order: string[] = [];

    service.subscribe(
      { subscriberId: "ordering-subscriber", eventTypes: ["CustomEvent"] },
      async (event) => {
        order.push(event.entityId);
      },
    );

    for (const entityId of ["emp-001", "emp-002", "emp-003"]) {
      service.publish(
        {
          eventType: "CustomEvent",
          sourceService: "hcm-workspace",
          sourceWorkspace: "HCM",
          entityType: "employee",
          entityId,
          actorId: "user-executive",
        },
        CONTEXT,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(order).toEqual(["emp-001", "emp-002", "emp-003"]);
  });

  it("routes failed deliveries to DLQ after retry exhaustion", async () => {
    const { service } = createService();

    service.subscribe(
      { subscriberId: "failing-subscriber", eventTypes: ["NotificationSent"] },
      async () => {
        throw new Error("Delivery failure");
      },
    );

    service.publish(
      {
        eventType: "NotificationSent",
        sourceService: "decision-intelligence",
        sourceWorkspace: "Platform",
        entityType: "notification",
        entityId: "notif-dlq-001",
        actorId: "user-executive",
      },
      CONTEXT,
    );

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(service.listDeadLetter(CONTEXT).length).toBeGreaterThan(0);
  });

  it("replays DLQ entries after operator retry", async () => {
    const { service } = createService();
    const deadLetters = [
      {
        id: "dlq-replay-001",
        event: enrichDurableEnvelope(
          createIntelligenceEvent(
            {
              eventType: "CustomEvent",
              sourceService: "hcm-workspace",
              sourceWorkspace: "HCM",
              entityType: "expense",
              entityId: "expense-001",
              actorId: "user-executive",
              eventId: "evt-dlq-replay",
            },
            CONTEXT,
          ),
          {
            eventType: "CustomEvent",
            sourceService: "hcm-workspace",
            sourceWorkspace: "HCM",
            entityType: "expense",
            entityId: "expense-001",
            actorId: "user-executive",
          },
          CONTEXT,
        ),
        failureReason: "test",
        attempts: 5,
        failedAt: new Date().toISOString(),
      },
    ];

    if (service.transport instanceof InMemoryDurableTransport) {
      service.transport.getBacking().deadLetterQueue.hydrate(deadLetters);
    }

    const requeued = await service.retryDeadLetter("dlq-replay-001", CONTEXT);
    expect(requeued?.eventId).toBe("evt-dlq-replay");
  });

  it("persists and hydrates events through PostgreSQL durable transport", async () => {
    const connection = new MockDatabaseConnection();
    const transport = new PostgresDurableTransport(connection);

    const event = enrichDurableEnvelope(
      createIntelligenceEvent(
        {
          eventType: "CustomEvent",
          sourceService: "hcm-workspace",
          sourceWorkspace: "HCM",
          entityType: "employee",
          entityId: "emp-pg-001",
          actorId: "user-executive",
          eventId: "evt-pg-001",
        },
        CONTEXT,
      ),
      {
        eventType: "CustomEvent",
        sourceService: "hcm-workspace",
        sourceWorkspace: "HCM",
        entityType: "employee",
        entityId: "emp-pg-001",
        actorId: "user-executive",
      },
      CONTEXT,
    );

    await transport.persistAndEnqueue(event, CONTEXT);

    const restarted = new PostgresDurableTransport(connection);
    const events = await restarted.listEvents("org-orania", 10);

    expect(events.some((entry) => entry.eventId === "evt-pg-001")).toBe(true);
  });

  it("propagates correlationId through durable envelope enrichment", () => {
    const { service } = createService();
    const event = service.publish(
      {
        eventType: "CustomEvent",
        sourceService: "finance-workspace",
        sourceWorkspace: "Finance",
        entityType: "journal",
        entityId: "journal-001",
        actorId: "user-executive",
        correlationId: "corr-chain-001",
      },
      CONTEXT,
    );

    expect(event.correlationId).toBe("corr-chain-001");
    expect(event.partitionKey).toBe("org-orania:journal:journal-001");
    expect(event.idempotencyKey).toContain("org-orania");
  });
});
