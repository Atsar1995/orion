import { randomUUID } from "crypto";
import { EventBus } from "@/lib/platform/events/EventBus";
import { EventRouter } from "@/lib/platform/intelligence/EventRouter";
import { createIntelligenceEvent } from "@/lib/platform/intelligence/IntelligenceEventFactory";
import { HealthMonitor } from "@/lib/platform/intelligence/HealthMonitor";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { SubscriptionManager } from "@/lib/platform/intelligence/SubscriptionManager";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import type { DurableTransportAdapter } from "@/lib/platform/iil/DurableTransportAdapter";
import { enrichDurableEnvelope } from "@/lib/platform/iil/envelope";
import { getDefaultIILTransport } from "@/lib/platform/iil/defaultTransport";
import { InMemoryDurableTransport } from "@/lib/platform/iil/InMemoryDurableTransport";
import type {
  CreateIntelligenceSubscriptionInput,
  CreateWebhookSubscriptionInput,
  IntelligenceEvent,
  IntelligenceFeedItem,
  IntelligenceHealthSnapshot,
  PublishIntelligenceEventInput,
  ReplayResult,
} from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

/** Central intelligence integration orchestrator (Mission P-006 · ADR-013). */
export class IntelligenceIntegrationService {
  readonly subscriptionManager = new SubscriptionManager();
  readonly transport: DurableTransportAdapter;
  readonly serviceRegistry: ServiceRegistry;
  readonly webhookGateway: WebhookGateway;
  readonly healthMonitor: HealthMonitor;
  readonly platformEventBus: EventBus;

  private readonly eventRouter: EventRouter;
  private readonly briefFeed = new Map<string, IntelligenceFeedItem[]>();

  constructor(options?: {
    transport?: DurableTransportAdapter;
    serviceRegistry?: ServiceRegistry;
    webhookGateway?: WebhookGateway;
    healthMonitor?: HealthMonitor;
    platformEventBus?: EventBus;
  }) {
    this.transport = options?.transport ?? getDefaultIILTransport();
    this.serviceRegistry = options?.serviceRegistry ?? new ServiceRegistry();
    this.webhookGateway = options?.webhookGateway ?? new WebhookGateway();
    this.healthMonitor = options?.healthMonitor ?? new HealthMonitor();
    this.platformEventBus = options?.platformEventBus ?? new EventBus();

    this.eventRouter = new EventRouter(
      this.subscriptionManager,
      this.webhookGateway,
      this.platformEventBus,
    );

    this.transport.startDeliveryLoop(async (delivery) => {
      await this.processDelivery(delivery);
    });
  }

  publish(
    input: PublishIntelligenceEventInput,
    context: ServiceContext,
  ): IntelligenceEvent {
    if (!this.serviceRegistry.canPublish(input.sourceService)) {
      throw new Error("UNAUTHORIZED_PUBLISHER");
    }

    if (!input.sourceWorkspace.trim() || !input.entityType.trim() || !input.entityId.trim()) {
      throw new Error("INVALID_PAYLOAD");
    }

    const event = enrichDurableEnvelope(createIntelligenceEvent(input, context), input, context);

    if (this.transport.persistAndEnqueueSync) {
      this.transport.persistAndEnqueueSync(event, context);
    } else {
      void this.transport.persistAndEnqueue(event, context).catch(() => {
        /* async transport errors surfaced via health metrics */
      });
    }

    this.healthMonitor.recordPublished();
    this.appendBriefFeed(event);

    return event;
  }

  subscribe(input: CreateIntelligenceSubscriptionInput, handler: Parameters<SubscriptionManager["subscribe"]>[1]) {
    return this.subscriptionManager.subscribe(input, handler);
  }

  registerWebhook(input: CreateWebhookSubscriptionInput, context: ServiceContext) {
    return this.webhookGateway.register(input, context);
  }

  listEvents(context: ServiceContext, limit = 50): readonly IntelligenceEvent[] {
    if (this.transport.mode === "memory" && this.transport instanceof InMemoryDurableTransport) {
      return [...this.transport.getBacking().events.values()]
        .filter((event) => event.organizationId === context.organizationId)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .slice(0, limit);
    }

    return [];
  }

  async listPersistedEvents(context: ServiceContext, limit = 50): Promise<readonly IntelligenceEvent[]> {
    return this.transport.listEvents(context.organizationId, limit);
  }

  getBriefFeed(context: ServiceContext, limit = 8): readonly IntelligenceFeedItem[] {
    return (this.briefFeed.get(context.organizationId) ?? []).slice(0, limit);
  }

  getHealth(context: ServiceContext): IntelligenceHealthSnapshot {
    const transportHealth = this.transport.health();
    const transportMetrics = this.transport.getMetrics();

    return this.healthMonitor.snapshot({
      registeredServices: this.serviceRegistry.list().length,
      subscriptionManager: this.subscriptionManager,
      queuedMessages: transportMetrics.pendingDeliveries,
      deadLetterCount: transportMetrics.deadLetterCount,
      organizationId: context.organizationId,
      transportStatus: transportHealth.status,
    });
  }

  listDeadLetter(context: ServiceContext) {
    if (this.transport.mode === "memory" && this.transport instanceof InMemoryDurableTransport) {
      return this.transport.getBacking().deadLetterQueue.list(context.organizationId);
    }

    return [];
  }

  async listPersistedDeadLetter(context: ServiceContext) {
    return this.transport.getDeadLetter(context.organizationId);
  }

  async retryDeadLetter(id: string, context: ServiceContext): Promise<IntelligenceEvent | null> {
    const event = await this.transport.requeueFromDeadLetter(id, context);
    return event;
  }

  async replay(context: ServiceContext, fromEventId?: string): Promise<ReplayResult> {
    return this.transport.replay(
      {
        organizationId: context.organizationId,
        eventId: fromEventId,
      },
      async (delivery) => {
        await this.processDelivery(delivery);
      },
    );
  }

  async recoverAfterRestart(): Promise<number> {
    return this.transport.recoverPendingDeliveries();
  }

  private async processDelivery(delivery: {
    readonly event: IntelligenceEvent;
    readonly context: ServiceContext;
  }): Promise<void> {
    const result = await this.eventRouter.route(delivery.event, delivery.context);

    if (result.failures.length > 0) {
      throw new Error(result.failures.join(" | "));
    }

    this.healthMonitor.recordDelivered(result.delivered);
  }

  private appendBriefFeed(event: IntelligenceEvent): void {
    const item: IntelligenceFeedItem = {
      id: event.eventId,
      eventType: event.eventType,
      summary: `${event.eventType} — ${event.entityType}:${event.entityId}`,
      sourceService: event.sourceService,
      sourceWorkspace: event.sourceWorkspace,
      timestamp: event.timestamp,
      priority: event.priority,
    };

    const existing = this.briefFeed.get(event.organizationId) ?? [];
    this.briefFeed.set(event.organizationId, [item, ...existing].slice(0, 50));
  }
}

let defaultIntelligenceIntegrationService: IntelligenceIntegrationService | null = null;

/** Returns the process-wide default intelligence integration service. */
export function getDefaultIntelligenceIntegrationService(): IntelligenceIntegrationService {
  if (!defaultIntelligenceIntegrationService) {
    defaultIntelligenceIntegrationService = new IntelligenceIntegrationService({
      transport: getDefaultIILTransport(),
    });
  }
  return defaultIntelligenceIntegrationService;
}

/** Resets the default service singleton — test isolation only. */
export function resetDefaultIntelligenceIntegrationServiceForTests(): void {
  if (defaultIntelligenceIntegrationService) {
    defaultIntelligenceIntegrationService.transport.stopDeliveryLoop();
  }
  defaultIntelligenceIntegrationService = null;
}
