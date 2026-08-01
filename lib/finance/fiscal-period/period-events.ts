import { FINANCE_IIL_SERVICE_ID } from "@/lib/finance/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishPeriodEventInput } from "@/types/finance-period";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

/** Publishes fiscal period domain events to IIL (Mission P-009.5). */
export function publishPeriodEvent(
  input: PublishPeriodEventInput,
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
        periodEvent: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}
