/**
 * ORION Platform Events — in-memory event publisher adapter.
 */

import type {
  PlatformEvent,
  ServiceContext,
  ServiceHealth,
  ServiceMetadata,
  ServiceResult,
} from "@/types/services";
import { ServiceHealth as ServiceHealthState } from "@/types/services";
import type { EventPublisher, HealthCheckService } from "@/lib/platform/contracts";
import { success } from "@/lib/platform/result";
import type { EventBus } from "@/lib/platform/events/EventBus";
import {
  ensureEventTenantAlignment,
  validatePlatformServiceContext,
} from "@/lib/platform/shared";

const EVENT_PUBLISHER_METADATA: ServiceMetadata = {
  serviceName: "EventPublisher",
  version: "1.0.0",
  description: "In-memory platform event publisher",
};

/** In-memory implementation of the platform event publisher contract. */
export class InMemoryEventPublisher
  implements EventPublisher, HealthCheckService
{
  readonly metadata = EVENT_PUBLISHER_METADATA;

  constructor(private readonly eventBus: EventBus) {}

  async publish(
    event: PlatformEvent,
    context: ServiceContext,
  ): Promise<ServiceResult<void>> {
    const contextResult = validatePlatformServiceContext(context);

    if (!contextResult.success) {
      return contextResult;
    }

    const alignmentResult = ensureEventTenantAlignment(event, context);

    if (!alignmentResult.success) {
      return alignmentResult;
    }

    return this.eventBus.publish(event);
  }

  async checkHealth(): Promise<ServiceResult<ServiceHealth>> {
    return success(ServiceHealthState.Healthy);
  }
}
