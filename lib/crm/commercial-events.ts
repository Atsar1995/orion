import { CRM_IIL_SERVICE_ID } from "@/lib/crm/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishCommercialEngineEventInput } from "@/types/crm-commercial";
import type { ServiceContext } from "@/types/services";

/** Publishes commercial domain events to IIL (Mission P-008.2). */
export function publishCommercialEngineEvent(
  input: PublishCommercialEngineEventInput,
  context: ServiceContext,
): void {
  try {
    const service = getIntelligenceIntegrationService();
    const priority =
      input.eventType === "OpportunityWon"
        ? "high"
        : input.eventType === "OpportunityLost"
          ? "high"
          : "normal";

    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: CRM_IIL_SERVICE_ID,
        sourceWorkspace: "Customer Intelligence",
        entityType: input.eventType.startsWith("Lead") ? "lead" : "opportunity",
        entityId: input.entityId,
        actorId: input.actorId ?? context.userId,
        actorName: input.actorName,
        priority,
        payload: {
          workspace: "crm",
          commercialEvent: input.eventType,
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
