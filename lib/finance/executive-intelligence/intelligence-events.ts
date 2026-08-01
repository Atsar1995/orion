import { FINANCE_IIL_SERVICE_ID } from "@/lib/finance/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishFinancialIntelligenceEventInput } from "@/types/finance-executive-intelligence";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

/** Publishes Executive Financial Intelligence events to IIL (Mission P-009.7). */
export function publishFinancialIntelligenceEvent(
  input: PublishFinancialIntelligenceEventInput,
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
        intelligenceEvent: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}
