/**
 * ORION Platform Events — subscriber registry.
 */

import type { ServiceResult } from "@/types/services";
import { validationError } from "@/lib/platform/errors";
import { failure, success } from "@/lib/platform/result";
import type { EventSubscription } from "@/lib/platform/events/EventSubscription";

/** Maintains in-memory event subscriber registrations. */
export class EventRegistry {
  private readonly subscriptions = new Map<string, EventSubscription>();
  private readonly subscriptionsByEvent = new Map<string, Set<string>>();

  /** Returns all registered subscriptions, optionally filtered by event name. */
  getSubscribers(eventName?: string): readonly EventSubscription[] {
    if (eventName === undefined) {
      return Array.from(this.subscriptions.values());
    }

    const normalizedEventName = eventName.trim();
    const subscriptionIds = this.subscriptionsByEvent.get(normalizedEventName);

    if (!subscriptionIds) {
      return [];
    }

    return Array.from(subscriptionIds)
      .map((subscriptionId) => this.subscriptions.get(subscriptionId))
      .filter((subscription): subscription is EventSubscription =>
        subscription !== undefined,
      );
  }

  /** Registers a subscription when it is valid and not a duplicate. */
  register(
    subscription: EventSubscription,
  ): ServiceResult<EventSubscription> {
    const validationResult = this.validateSubscription(subscription);

    if (!validationResult.success) {
      return validationResult;
    }

    if (this.isDuplicateRegistration(subscription)) {
      return failure(
        validationError({
          message: `Subscriber '${subscription.subscriberId}' is already registered for event '${subscription.eventName}'.`,
          details: {
            eventName: subscription.eventName,
            subscriberId: subscription.subscriberId,
          },
        }),
      );
    }

    this.subscriptions.set(subscription.id, subscription);

    const eventSubscriptions =
      this.subscriptionsByEvent.get(subscription.eventName) ?? new Set<string>();

    eventSubscriptions.add(subscription.id);
    this.subscriptionsByEvent.set(subscription.eventName, eventSubscriptions);

    return success(subscription);
  }

  /** Removes a subscription by identifier. */
  unregister(subscriptionId: string): ServiceResult<void> {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription) {
      return failure(
        validationError({
          message: `Subscription '${subscriptionId}' was not found.`,
        }),
      );
    }

    this.subscriptions.delete(subscriptionId);

    const eventSubscriptions = this.subscriptionsByEvent.get(subscription.eventName);

    if (eventSubscriptions) {
      eventSubscriptions.delete(subscriptionId);

      if (eventSubscriptions.size === 0) {
        this.subscriptionsByEvent.delete(subscription.eventName);
      }
    }

    return success(undefined);
  }

  /** Removes all subscriptions, or only those for a specific event. */
  clear(eventName?: string): ServiceResult<void> {
    if (eventName === undefined) {
      this.subscriptions.clear();
      this.subscriptionsByEvent.clear();
      return success(undefined);
    }

    const normalizedEventName = eventName.trim();
    const subscriptionIds = this.subscriptionsByEvent.get(normalizedEventName);

    if (!subscriptionIds) {
      return success(undefined);
    }

    for (const subscriptionId of subscriptionIds) {
      this.subscriptions.delete(subscriptionId);
    }

    this.subscriptionsByEvent.delete(normalizedEventName);

    return success(undefined);
  }

  private validateSubscription(
    subscription: EventSubscription,
  ): ServiceResult<EventSubscription> {
    if (!subscription.id.trim()) {
      return failure(
        validationError({
          message: "Subscription id is required.",
        }),
      );
    }

    if (!subscription.eventName.trim()) {
      return failure(
        validationError({
          message: "Event name is required.",
        }),
      );
    }

    if (!subscription.subscriberId.trim()) {
      return failure(
        validationError({
          message: "Subscriber id is required.",
        }),
      );
    }

    return success(subscription);
  }

  private isDuplicateRegistration(subscription: EventSubscription): boolean {
    const existing = this.getSubscribers(subscription.eventName);

    return existing.some(
      (entry) => entry.subscriberId === subscription.subscriberId,
    );
  }
}
