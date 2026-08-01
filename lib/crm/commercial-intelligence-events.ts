import { CRM_IIL_SERVICE_ID } from "@/lib/crm/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishCommercialIntelligenceEventInput } from "@/types/crm-commercial-intelligence";
import type { ServiceContext } from "@/types/services";

/** Publishes commercial intelligence events to IIL (Mission P-008.5). */
export function publishCommercialIntelligenceEvent(
  input: PublishCommercialIntelligenceEventInput,
  context: ServiceContext,
): void {
  try {
    const service = getIntelligenceIntegrationService();
    const priority =
      input.eventType === "CommercialAlertRaised" || input.eventType === "AccountRiskDetected"
        ? "high"
        : "normal";

    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: CRM_IIL_SERVICE_ID,
        sourceWorkspace: "Customer Intelligence",
        entityType: "commercial_intelligence",
        entityId: input.entityId,
        actorId: input.actorId ?? context.userId,
        actorName: input.actorName,
        priority,
        payload: {
          workspace: "crm",
          intelligenceEvent: input.eventType,
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
