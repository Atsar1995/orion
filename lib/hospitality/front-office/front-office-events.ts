import { HOSPITALITY_IIL_SERVICE_ID } from "@/lib/hospitality/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishFrontOfficeEventInput } from "@/types/hospitality-front-office";
import type { ServiceContext } from "@/types/services";

/** Publishes front office events to IIL (Mission P-007.4). */
export function publishFrontOfficeEvent(
  input: PublishFrontOfficeEventInput,
  context: ServiceContext,
): void {
  try {
    const service = getIntelligenceIntegrationService();
    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: HOSPITALITY_IIL_SERVICE_ID,
        sourceWorkspace: "Hospitality",
        entityType: "stay",
        entityId: input.stayId,
        actorId: input.actorId,
        actorName: input.actorName,
        priority: input.eventType === "StayCheckedIn" || input.eventType === "LateDeparture" ? "high" : "normal",
        payload: {
          workspace: "hospitality",
          frontOfficeEvent: input.eventType,
          reservationId: input.reservationId,
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
