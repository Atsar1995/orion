import { FINANCE_IIL_SERVICE_ID } from "@/lib/finance/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishPipelineEventInput } from "@/types/finance-event-pipeline";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

/** Publishes Financial Event Pipeline domain events to IIL (Mission P-009.6). */
export function publishPipelineEvent(
  input: PublishPipelineEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const service = getIntelligenceIntegrationService();

  return service.publish(
    {
      eventType: "CustomEvent",
      sourceService: FINANCE_IIL_SERVICE_ID,
      sourceWorkspace: "Finance",
      entityType: input.entityType,
      entityId: input.entityId,
      actorId: context.userId,
      correlationId: input.correlationId,
      payload: {
        workspace: "finance",
        pipelineEvent: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}
