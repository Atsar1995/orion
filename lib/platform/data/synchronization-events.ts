import type {
  PublishSynchronizationEventInput,
  SynchronizationEventType,
} from "@/types/enterprise-data-synchronization";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

const SERVICE_ID = "data-platform";

/** Publishes synchronization engine events via IIL (Mission P-011.5). */
export function publishSynchronizationEvent(
  input: PublishSynchronizationEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const integration = getIntelligenceIntegrationService();

  return integration.publish(
    {
      eventType: "CustomEvent",
      sourceService: SERVICE_ID,
      sourceWorkspace: "Platform",
      entityType: input.entityType ?? "synchronization",
      entityId: input.jobId,
      actorId: context.userId ?? "system",
      correlationId: input.correlationId ?? input.jobId,
      payload: {
        workspace: "platform",
        synchronizationEventType: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}

export const SYNCHRONIZATION_OUTBOUND_EVENTS: readonly SynchronizationEventType[] = [
  "SynchronizationStarted",
  "SynchronizationCompleted",
  "SynchronizationFailed",
  "SynchronizationConflictDetected",
  "SynchronizationRetried",
] as const;

export const SYNCHRONIZATION_INBOUND_EVENTS = [
  "MasterEntityUpdated",
  "ReferenceUpdated",
  "MetadataUpdated",
  "ValidationPassed",
] as const;
