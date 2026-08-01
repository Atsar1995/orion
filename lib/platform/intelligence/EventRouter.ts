import type { EventBus } from "@/lib/platform/events/EventBus";
import { intelligenceEventToPlatformEvent } from "@/lib/platform/intelligence/IntelligenceEventFactory";
import type { SubscriptionManager } from "@/lib/platform/intelligence/SubscriptionManager";
import type { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

/** Routes intelligence events to subscribers, platform bus, and webhooks (Mission P-006). */
export class EventRouter {
  constructor(
    private readonly subscriptionManager: SubscriptionManager,
    private readonly webhookGateway: WebhookGateway,
    private readonly platformEventBus: EventBus,
  ) {}

  async route(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): Promise<{ delivered: number; failures: string[] }> {
    const subscriptionResult = await this.subscriptionManager.dispatch(event, context);

    const platformEvent = intelligenceEventToPlatformEvent(event, context);
    const platformResult = await this.platformEventBus.publish(platformEvent);

    if (!platformResult.success) {
      subscriptionResult.failures.push(`platform-bus: ${platformResult.error.message}`);
    } else {
      subscriptionResult.delivered += 1;
    }

    const webhookResult = await this.webhookGateway.deliver(event, context);

    if (!webhookResult.success) {
      subscriptionResult.failures.push(...webhookResult.failures);
    } else {
      subscriptionResult.delivered += webhookResult.delivered;
    }

    return subscriptionResult;
  }
}
