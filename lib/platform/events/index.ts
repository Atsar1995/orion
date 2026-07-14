/**
 * ORION Platform Events — event bus foundation.
 */

export { EventBus } from "@/lib/platform/events/EventBus";
export { EventDispatcher } from "@/lib/platform/events/EventDispatcher";
export { EventRegistry } from "@/lib/platform/events/EventRegistry";
export type {
  CreateEventSubscriptionInput,
  EventSubscription,
} from "@/lib/platform/events/EventSubscription";
export {
  createEventSubscription,
  createSubscriptionId,
  sortSubscriptionsByPriority,
} from "@/lib/platform/events/EventSubscription";
