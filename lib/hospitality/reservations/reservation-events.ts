import { HOSPITALITY_IIL_SERVICE_ID } from "@/lib/hospitality/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishReservationEngineEventInput } from "@/types/hospitality-reservation";
import type { ServiceContext } from "@/types/services";

/** Publishes reservation engine events to IIL (Mission P-007.2). */
export function publishReservationEngineEvent(
  input: PublishReservationEngineEventInput,
  context: ServiceContext,
): void {
  try {
    const service = getIntelligenceIntegrationService();
    const eventType =
      input.eventType === "ReservationCreated"
        ? "ReservationCreated"
        : "CustomEvent";
    service.publish(
      {
        eventType,
        sourceService: HOSPITALITY_IIL_SERVICE_ID,
        sourceWorkspace: "Hospitality",
        entityType: "reservation",
        entityId: input.reservationId,
        actorId: input.actorId,
        actorName: input.actorName,
        priority: input.eventType === "ReservationCheckedIn" ? "high" : "normal",
        payload: {
          workspace: "hospitality",
          reservationEvent: input.eventType,
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
