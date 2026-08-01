import type { ValidationEventType, PublishValidationEventInput } from "@/types/enterprise-data-validation";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

const SERVICE_ID = "data-platform";

/** Publishes validation framework events via IIL (Mission P-011.4). */
export function publishValidationEvent(
  input: PublishValidationEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const integration = getIntelligenceIntegrationService();

  return integration.publish(
    {
      eventType: "CustomEvent",
      sourceService: SERVICE_ID,
      sourceWorkspace: "Platform",
      entityType: input.entityType ?? "validation",
      entityId: input.reportId,
      actorId: context.userId ?? "system",
      correlationId: input.correlationId ?? input.reportId,
      payload: {
        workspace: "platform",
        validationEventType: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}

export const VALIDATION_OUTBOUND_EVENTS: readonly ValidationEventType[] = [
  "ValidationPassed",
  "ValidationFailed",
  "ValidationWarning",
  "ValidationReportGenerated",
] as const;

export const VALIDATION_INBOUND_EVENTS = ["ValidationRequested"] as const;
