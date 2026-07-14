/**
 * ORION Platform Events — in-memory event subscriber adapter.
 */

import type {
  PlatformEventHandler,
  ServiceContext,
  ServiceHealth,
  ServiceMetadata,
  ServiceResult,
} from "@/types/services";
import { ServiceHealth as ServiceHealthState } from "@/types/services";
import type { EventSubscriber, HealthCheckService } from "@/lib/platform/contracts";
import { validationError } from "@/lib/platform/errors";
import { failure, success } from "@/lib/platform/result";
import type { EventBus } from "@/lib/platform/events/EventBus";
import { createSubscriptionId } from "@/lib/platform/events/EventSubscription";
import {
  createSubscriberIdentity,
  validatePlatformServiceContext,
} from "@/lib/platform/shared";

const EVENT_SUBSCRIBER_METADATA: ServiceMetadata = {
  serviceName: "EventSubscriber",
  version: "1.0.0",
  description: "In-memory platform event subscriber",
};

/** In-memory implementation of the platform event subscriber contract. */
export class InMemoryEventSubscriber
  implements EventSubscriber, HealthCheckService
{
  readonly metadata = EVENT_SUBSCRIBER_METADATA;

  constructor(private readonly eventBus: EventBus) {}

  async subscribe(
    eventType: string,
    handler: PlatformEventHandler,
    context: ServiceContext,
  ): Promise<ServiceResult<string>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    if (!eventType.trim()) {
      return failure(
        validationError({
          message: "Event type is required.",
        }),
      );
    }

    const subscriptionResult = this.eventBus.subscribe({
      eventName: eventType.trim(),
      subscriberId: `${createSubscriberIdentity(context)}:${createSubscriptionId()}`,
      handler,
    });

    if (!subscriptionResult.success) {
      return subscriptionResult;
    }

    return success(subscriptionResult.data.id);
  }

  async unsubscribe(
    subscriptionId: string,
    context: ServiceContext,
  ): Promise<ServiceResult<void>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    return this.eventBus.unsubscribe(subscriptionId);
  }

  async checkHealth(): Promise<ServiceResult<ServiceHealth>> {
    return success(ServiceHealthState.Healthy);
  }
}
