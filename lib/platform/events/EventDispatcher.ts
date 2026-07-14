/**
 * ORION Platform Events — synchronous event dispatcher.
 */

import type { PlatformEvent, ServiceResult } from "@/types/services";
import { unknownServiceError } from "@/lib/platform/errors";
import { failure, success } from "@/lib/platform/result";
import type { EventSubscription } from "@/lib/platform/events/EventSubscription";
import { sortSubscriptionsByPriority } from "@/lib/platform/events/EventSubscription";

/** Dispatches platform events to registered subscribers synchronously. */
export class EventDispatcher {
  /** Invokes enabled subscribers in priority order without background processing. */
  async dispatch(
    event: PlatformEvent,
    subscriptions: readonly EventSubscription[],
  ): Promise<ServiceResult<void>> {
    const activeSubscriptions = sortSubscriptionsByPriority(
      subscriptions.filter((subscription) => subscription.enabled),
    );

    const handlerFailures: string[] = [];

    for (const subscription of activeSubscriptions) {
      const result = await subscription.handler(event);

      if (!result.success) {
        handlerFailures.push(
          `${subscription.subscriberId}: ${result.error.message}`,
        );
      }
    }

    if (handlerFailures.length > 0) {
      return failure(
        unknownServiceError({
          message: "One or more event handlers failed during dispatch.",
          details: {
            eventType: event.type,
            failureCount: String(handlerFailures.length),
            failures: handlerFailures.join(" | "),
          },
        }),
      );
    }

    return success(undefined);
  }
}
