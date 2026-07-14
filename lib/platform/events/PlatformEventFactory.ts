/**
 * ORION Platform Events — platform event factory.
 */

import type {
  CreatePlatformEventInput,
  PlatformEvent,
  ServiceResult,
} from "@/types/services";
import { validationError } from "@/lib/platform/errors";
import { failure, success } from "@/lib/platform/result";
import { createSubscriptionId } from "@/lib/platform/events/EventSubscription";

const DEFAULT_EVENT_VERSION = "1.0";

let eventSequence = 0;

/** Creates a unique platform event identifier. */
export function createEventId(): string {
  eventSequence += 1;
  return `evt-${eventSequence}`;
}

/** Creates a correlation identifier for related platform operations. */
export function createCorrelationId(): string {
  return `corr-${Date.now()}-${createSubscriptionId()}`;
}

/** Creates an enriched platform event from structured input. */
export function createPlatformEvent(
  input: CreatePlatformEventInput,
): ServiceResult<PlatformEvent> {
  if (!input.type.trim()) {
    return failure(
      validationError({
        message: "PlatformEvent.type is required.",
      }),
    );
  }

  if (!input.source.trim()) {
    return failure(
      validationError({
        message: "PlatformEvent.source is required.",
      }),
    );
  }

  const tenantContext = input.tenantContext;

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

  const correlationId =
    input.correlationId?.trim() ||
    tenantContext.correlationId?.trim() ||
    createCorrelationId();

  return success({
    eventId: input.eventId?.trim() || createEventId(),
    type: input.type.trim(),
    timestamp: input.timestamp ?? new Date(),
    correlationId,
    causationId: input.causationId?.trim(),
    source: input.source.trim(),
    version: input.version.trim() || DEFAULT_EVENT_VERSION,
    tenantContext,
    payload: input.payload,
    metadata: input.metadata,
  });
}
