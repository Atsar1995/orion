/**
 * ORION Platform Events — in-memory event bus.
 */

import type { PlatformEvent, ServiceContext, ServiceResult } from "@/types/services";
import { validationError } from "@/lib/platform/errors";
import { failure, success } from "@/lib/platform/result";
import { EventDispatcher } from "@/lib/platform/events/EventDispatcher";
import { EventRegistry } from "@/lib/platform/events/EventRegistry";
import type { CreateEventSubscriptionInput } from "@/lib/platform/events/EventSubscription";
import {
  createEventSubscription,
  type EventSubscription,
} from "@/lib/platform/events/EventSubscription";

/** In-memory event bus for synchronous platform event dispatch. */
export class EventBus {
  private readonly registry = new EventRegistry();
  private readonly dispatcher = new EventDispatcher();

  /** Publishes an event to all registered subscribers for its type. */
  async publish(event: PlatformEvent): Promise<ServiceResult<void>> {
    const validationResult = this.validateEvent(event);

    if (!validationResult.success) {
      return validationResult;
    }

    const subscribers = this.registry.getSubscribers(event.type);

    return this.dispatcher.dispatch(event, subscribers);
  }

  /** Registers a subscriber for an event name. */
  subscribe(
    input: CreateEventSubscriptionInput,
  ): ServiceResult<EventSubscription> {
    const subscription = createEventSubscription(input);

    return this.registry.register(subscription);
  }

  /** Removes a subscription by identifier. */
  unsubscribe(subscriptionId: string): ServiceResult<void> {
    if (!subscriptionId.trim()) {
      return failure(
        validationError({
          message: "Subscription id is required.",
        }),
      );
    }

    return this.registry.unregister(subscriptionId);
  }

  /** Removes all subscriptions, or only those for a specific event name. */
  clear(eventName?: string): ServiceResult<void> {
    if (eventName !== undefined && !eventName.trim()) {
      return failure(
        validationError({
          message: "Event name cannot be empty.",
        }),
      );
    }

    return this.registry.clear(eventName?.trim());
  }

  /** Returns registered subscriptions, optionally filtered by event name. */
  getSubscribers(eventName?: string): readonly EventSubscription[] {
    return this.registry.getSubscribers(eventName);
  }

  private validateEvent(event: PlatformEvent): ServiceResult<PlatformEvent> {
    if (!event.eventId.trim()) {
      return failure(
        validationError({
          message: "PlatformEvent.eventId is required.",
        }),
      );
    }

    if (!event.type.trim()) {
      return failure(
        validationError({
          message: "PlatformEvent.type is required.",
        }),
      );
    }

    if (!(event.timestamp instanceof Date) || Number.isNaN(event.timestamp.getTime())) {
      return failure(
        validationError({
          message: "PlatformEvent.timestamp must be a valid date.",
        }),
      );
    }

    if (!event.correlationId.trim()) {
      return failure(
        validationError({
          message: "PlatformEvent.correlationId is required.",
        }),
      );
    }

    if (!event.source.trim()) {
      return failure(
        validationError({
          message: "PlatformEvent.source is required.",
        }),
      );
    }

    if (!event.version.trim()) {
      return failure(
        validationError({
          message: "PlatformEvent.version is required.",
        }),
      );
    }

    const tenantValidation = this.validateTenantContext(event.tenantContext);

    if (!tenantValidation.success) {
      return tenantValidation;
    }

    return success(event);
  }

  private validateTenantContext(
    tenantContext: ServiceContext,
  ): ServiceResult<ServiceContext> {
    if (
      !tenantContext.organizationId.trim() ||
      !tenantContext.workspaceId.trim() ||
      !tenantContext.userId.trim() ||
      !tenantContext.role.trim()
    ) {
      return failure(
        validationError({
          message: "PlatformEvent.tenantContext is incomplete.",
        }),
      );
    }

    return success(tenantContext);
  }
}
