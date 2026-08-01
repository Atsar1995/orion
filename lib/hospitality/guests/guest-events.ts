import { HOSPITALITY_IIL_SERVICE_ID } from "@/lib/hospitality/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishGuestEngineEventInput } from "@/types/hospitality-guest";
import type { ServiceContext } from "@/types/services";

/** Publishes guest intelligence events to IIL (Mission P-007.3). */
export function publishGuestEngineEvent(
  input: PublishGuestEngineEventInput,
  context: ServiceContext,
): void {
  try {
    const service = getIntelligenceIntegrationService();
    const eventType = "CustomEvent";
    service.publish(
      {
        eventType,
        sourceService: HOSPITALITY_IIL_SERVICE_ID,
        sourceWorkspace: "Hospitality",
        entityType: "guest",
        entityId: input.guestId,
        actorId: input.actorId,
        actorName: input.actorName,
        priority: input.eventType === "VipFlagged" ? "high" : "normal",
        payload: {
          workspace: "hospitality",
          guestEvent: input.eventType,
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
