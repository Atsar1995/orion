import { describe, expect, it, beforeEach } from "vitest";
import { createHmac } from "crypto";
import { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import { registerIntelligenceHandlers } from "@/lib/platform/intelligence/register-intelligence-handlers";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Mission P-006 Intelligence Integration Layer", () => {
  let service: IntelligenceIntegrationService;

  beforeEach(() => {
    service = new IntelligenceIntegrationService({
      serviceRegistry: new ServiceRegistry(),
      webhookGateway: new WebhookGateway(),
    });
    registerIntelligenceHandlers(service);
  });

  it("publishes standardized intelligence events", () => {
    const event = service.publish(
      {
        eventType: "DecisionCreated",
        sourceService: "decision-intelligence",
        sourceWorkspace: "Platform",
        entityType: "decision",
        entityId: "dec-001",
        actorId: "user-executive",
        payload: { title: "Approve expansion" },
      },
      CONTEXT,
    );

    expect(event.eventId).toBeTruthy();
    expect(event.eventType).toBe("DecisionCreated");
    expect(event.organizationId).toBe("org-orania");
    expect(event.correlationId).toBeTruthy();
    expect(event.securityClassification).toBe("internal");
  });

  it("rejects unauthorized publishers", () => {
    expect(() =>
      service.publish(
        {
          eventType: "CustomEvent",
          sourceService: "unknown-service",
          sourceWorkspace: "Platform",
          entityType: "entity",
          entityId: "1",
          actorId: "user-executive",
        },
        CONTEXT,
      ),
    ).toThrow("UNAUTHORIZED_PUBLISHER");
  });

  it("rejects duplicate events", () => {
    const input = {
      eventType: "MemoryCreated" as const,
      sourceService: "decision-intelligence",
      sourceWorkspace: "Platform",
      entityType: "memory",
      entityId: "mem-001",
      actorId: "user-executive",
      eventId: "evt-fixed-id",
    };

    service.publish(input, CONTEXT);

    expect(() => service.publish(input, CONTEXT)).toThrow("DUPLICATE_EVENT");
  });

  it("routes events to subscribers and updates brief feed", async () => {
    service.publish(
      {
        eventType: "CustomerUpdated",
        sourceService: "crm-workspace",
        sourceWorkspace: "CRM",
        entityType: "customer",
        entityId: "cust-001",
        actorId: "user-executive",
      },
      CONTEXT,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    const feed = service.getBriefFeed(CONTEXT);
    expect(feed.length).toBeGreaterThan(0);
    expect(feed[0]?.eventType).toBe("CustomerUpdated");
  });

  it("supports event replay from replay store", async () => {
    service.publish(
      {
        eventType: "TaskCompleted",
        sourceService: "crm-workspace",
        sourceWorkspace: "CRM",
        entityType: "task",
        entityId: "task-001",
        actorId: "user-executive",
      },
      CONTEXT,
    );

    const result = await service.replay(CONTEXT);
    expect(result.replayed).toBeGreaterThan(0);
  });

  it("moves failed deliveries to dead-letter after retries", async () => {
    service.subscribe(
      {
        subscriberId: "failing-subscriber",
        eventTypes: ["NotificationSent"],
      },
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
        entityId: "notif-001",
        actorId: "user-executive",
      },
      CONTEXT,
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const deadLetter = service.listDeadLetter(CONTEXT);
    expect(deadLetter.length).toBeGreaterThan(0);
  });

  it("reports integration health snapshot", () => {
    const health = service.getHealth(CONTEXT);
    expect(health.registeredServices).toBeGreaterThan(0);
    expect(["healthy", "degraded", "unhealthy"]).toContain(health.status);
  });

  it("verifies webhook signatures", () => {
    const gateway = new WebhookGateway();
    const secret = "test-secret";
    const payload = JSON.stringify({ eventType: "CustomEvent" });
    const signature = createHmac("sha256", secret).update(payload).digest("hex");

    expect(gateway.verifyInboundSignature(payload, signature, secret)).toBe(true);
    expect(gateway.verifyInboundSignature(payload, "invalid", secret)).toBe(false);
  });

  it("lists registered services and subscriptions", () => {
    const services = service.serviceRegistry.list();
    const subscriptions = service.subscriptionManager.list();

    expect(services.some((entry) => entry.serviceId === "decision-intelligence")).toBe(true);
    expect(subscriptions.some((entry) => entry.subscriberId === "executive-memory")).toBe(true);
  });
});
