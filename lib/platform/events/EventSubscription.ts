/**
 * ORION Platform Events — subscription model.
 */

import type { PlatformEventHandler } from "@/types/services";

/** Registered handler binding for a platform event. */
export interface EventSubscription {
  id: string;
  eventName: string;
  subscriberId: string;
  handler: PlatformEventHandler;
  priority: number;
  enabled: boolean;
}

/** Input for creating a new event subscription. */
export interface CreateEventSubscriptionInput {
  eventName: string;
  subscriberId: string;
  handler: PlatformEventHandler;
  priority?: number;
  enabled?: boolean;
}

const DEFAULT_PRIORITY = 100;

let subscriptionSequence = 0;

/** Creates a subscription identifier. */
export function createSubscriptionId(): string {
  subscriptionSequence += 1;
  return `event-sub-${subscriptionSequence}`;
}

/** Creates an event subscription from input values. */
export function createEventSubscription(
  input: CreateEventSubscriptionInput,
): EventSubscription {
  return {
    id: createSubscriptionId(),
    eventName: input.eventName.trim(),
    subscriberId: input.subscriberId.trim(),
    handler: input.handler,
    priority: input.priority ?? DEFAULT_PRIORITY,
    enabled: input.enabled ?? true,
  };
}

/** Returns subscriptions sorted by ascending priority (lower values run first). */
export function sortSubscriptionsByPriority(
  subscriptions: readonly EventSubscription[],
): EventSubscription[] {
  return [...subscriptions].sort((left, right) => left.priority - right.priority);
}
