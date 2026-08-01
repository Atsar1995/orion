import { randomUUID } from "crypto";
import { EventBus } from "@/lib/platform/events/EventBus";
import { DeadLetterQueue } from "@/lib/platform/intelligence/DeadLetterQueue";
import { EventReplayStore } from "@/lib/platform/intelligence/EventReplayStore";
import { EventRouter } from "@/lib/platform/intelligence/EventRouter";
import { createIntelligenceEvent } from "@/lib/platform/intelligence/IntelligenceEventFactory";
import { HealthMonitor } from "@/lib/platform/intelligence/HealthMonitor";
import { MessageQueue, type QueuedIntelligenceMessage } from "@/lib/platform/intelligence/MessageQueue";
import { RetryManager } from "@/lib/platform/intelligence/RetryManager";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { SubscriptionManager } from "@/lib/platform/intelligence/SubscriptionManager";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
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

/** Central intelligence integration orchestrator (Mission P-006). */
export class IntelligenceIntegrationService {
  readonly subscriptionManager = new SubscriptionManager();
  readonly replayStore = new EventReplayStore();
  readonly deadLetterQueue = new DeadLetterQueue();
  readonly retryManager = new RetryManager();
  readonly serviceRegistry: ServiceRegistry;
  readonly webhookGateway: WebhookGateway;
  readonly healthMonitor: HealthMonitor;
  readonly platformEventBus: EventBus;

  private readonly messageQueue: MessageQueue;
  private readonly eventRouter: EventRouter;
  private readonly briefFeed = new Map<string, IntelligenceFeedItem[]>();

  constructor(options?: {
    serviceRegistry?: ServiceRegistry;
    webhookGateway?: WebhookGateway;
    healthMonitor?: HealthMonitor;
    platformEventBus?: EventBus;
  }) {
    this.serviceRegistry = options?.serviceRegistry ?? new ServiceRegistry();
    this.webhookGateway = options?.webhookGateway ?? new WebhookGateway();
    this.healthMonitor = options?.healthMonitor ?? new HealthMonitor();
    this.platformEventBus = options?.platformEventBus ?? new EventBus();

    this.eventRouter = new EventRouter(
      this.subscriptionManager,
      this.webhookGateway,
      this.platformEventBus,
    );

    this.messageQueue = new MessageQueue(async (message) => {
      await this.processMessage(message);
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

    const event = createIntelligenceEvent(input, context);

    if (!this.replayStore.append(event)) {
      throw new Error("DUPLICATE_EVENT");
    }

    this.healthMonitor.recordPublished();
    this.appendBriefFeed(event);

    this.messageQueue.enqueue({
      id: randomUUID(),
      event,
      context,
      attempts: 0,
      enqueuedAt: new Date().toISOString(),
    });

    return event;
  }

  subscribe(input: CreateIntelligenceSubscriptionInput, handler: Parameters<SubscriptionManager["subscribe"]>[1]) {
    return this.subscriptionManager.subscribe(input, handler);
  }

  registerWebhook(input: CreateWebhookSubscriptionInput, context: ServiceContext) {
    return this.webhookGateway.register(input, context);
  }

  listEvents(context: ServiceContext, limit = 50): readonly IntelligenceEvent[] {
    return this.replayStore.list(context.organizationId, limit);
  }

  getBriefFeed(context: ServiceContext, limit = 8): readonly IntelligenceFeedItem[] {
    return (this.briefFeed.get(context.organizationId) ?? []).slice(0, limit);
  }

  getHealth(context: ServiceContext): IntelligenceHealthSnapshot {
    return this.healthMonitor.snapshot({
      registeredServices: this.serviceRegistry.list().length,
      subscriptionManager: this.subscriptionManager,
      messageQueue: this.messageQueue,
      deadLetterQueue: this.deadLetterQueue,
      organizationId: context.organizationId,
    });
  }

  listDeadLetter(context: ServiceContext): ReturnType<DeadLetterQueue["list"]> {
    return this.deadLetterQueue.list(context.organizationId);
  }

  async retryDeadLetter(id: string, context: ServiceContext): Promise<IntelligenceEvent | null> {
    const record = this.deadLetterQueue.remove(id);

    if (!record || record.event.organizationId !== context.organizationId) {
      return null;
    }

    this.messageQueue.enqueue({
      id: randomUUID(),
      event: record.event,
      context,
      attempts: 0,
      enqueuedAt: new Date().toISOString(),
    });

    return record.event;
  }

  async replay(context: ServiceContext, fromEventId?: string): Promise<ReplayResult> {
    const events = fromEventId
      ? this.replayStore.getFrom(fromEventId, context.organizationId)
      : this.replayStore.list(context.organizationId);

    let replayed = 0;
    let skipped = 0;
    let failed = 0;

    for (const event of events) {
      const result = await this.eventRouter.route(event, context);

      if (result.failures.length === 0) {
        replayed += 1;
        this.healthMonitor.recordDelivered(result.delivered);
      } else if (result.delivered > 0) {
        replayed += 1;
        failed += 1;
        this.healthMonitor.recordFailure();
      } else {
        skipped += 1;
        failed += 1;
        this.healthMonitor.recordFailure();
      }
    }

    return { replayed, skipped, failed };
  }

  private async processMessage(message: QueuedIntelligenceMessage): Promise<void> {
    const result = await this.eventRouter.route(message.event, message.context);

    if (result.failures.length === 0) {
      this.healthMonitor.recordDelivered(result.delivered);
      return;
    }

    const nextAttempts = message.attempts + 1;

    if (this.retryManager.shouldRetry(message.attempts)) {
      const delay = this.retryManager.getDelayMs(message.attempts);
      await sleep(delay);
      this.messageQueue.enqueue({ ...message, attempts: nextAttempts });
      return;
    }

    this.healthMonitor.recordFailure();
    this.deadLetterQueue.enqueue(
      message.event,
      "Delivery failed after retries",
      nextAttempts,
      result.failures.join(" | "),
    );
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const defaultIntelligenceIntegrationService = new IntelligenceIntegrationService();
