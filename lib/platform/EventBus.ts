import type { PlatformEvent, ServiceResult } from "@/types/services";
import type {
  CreateEventSubscriptionInput,
  EventSubscription,
} from "@/lib/platform/events/EventSubscription";

/**
 * EP-001 platform event bus contract.
 *
 * Concrete implementation: {@link ./events/EventBus.ts}
 */
export interface PlatformEventBus {
  publish(event: PlatformEvent): Promise<ServiceResult<void>>;
  subscribe(input: CreateEventSubscriptionInput): ServiceResult<EventSubscription>;
  unsubscribe(subscriptionId: string): ServiceResult<void>;
  listSubscriptions(): readonly EventSubscription[];
}

export { EventBus } from "@/lib/platform/events/EventBus";
