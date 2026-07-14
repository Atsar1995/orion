/**
 * ORION Platform Events — event bus foundation.
 */

import { EventBus } from "@/lib/platform/events/EventBus";
import { InMemoryEventPublisher } from "@/lib/platform/events/InMemoryEventPublisher";
import { InMemoryEventSubscriber } from "@/lib/platform/events/InMemoryEventSubscriber";

export { EventBus } from "@/lib/platform/events/EventBus";
export { EventDispatcher } from "@/lib/platform/events/EventDispatcher";
export { EventRegistry } from "@/lib/platform/events/EventRegistry";
export { InMemoryEventPublisher } from "@/lib/platform/events/InMemoryEventPublisher";
export { InMemoryEventSubscriber } from "@/lib/platform/events/InMemoryEventSubscriber";
export type {
  CreateEventSubscriptionInput,
  EventSubscription,
} from "@/lib/platform/events/EventSubscription";
export {
  createEventSubscription,
  createSubscriptionId,
  sortSubscriptionsByPriority,
} from "@/lib/platform/events/EventSubscription";
export {
  createCorrelationId,
  createEventId,
  createPlatformEvent,
} from "@/lib/platform/events/PlatformEventFactory";

/** Creates default in-memory event publisher and subscriber adapters. */
export function createInMemoryEventServices(): {
  eventBus: EventBus;
  eventPublisher: InMemoryEventPublisher;
  eventSubscriber: InMemoryEventSubscriber;
} {
  const eventBus = new EventBus();

  return {
    eventBus,
    eventPublisher: new InMemoryEventPublisher(eventBus),
    eventSubscriber: new InMemoryEventSubscriber(eventBus),
  };
}
