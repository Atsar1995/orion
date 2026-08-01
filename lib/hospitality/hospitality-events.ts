import { HOSPITALITY_IIL_SERVICE_ID } from "@/lib/hospitality/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishReservationEventInput } from "@/types/hospitality";
import type { PublishInventoryEventInput } from "@/types/hospitality-inventory";
import type { ServiceContext } from "@/types/services";

/** Publishes hospitality events to the Intelligence Integration Layer (Mission P-007). */
export function publishHospitalityEvent(
  input: PublishReservationEventInput,
  context: ServiceContext,
): void {
  try {
    const service = getIntelligenceIntegrationService();
    service.publish(
      {
        eventType: input.eventType,
        sourceService: HOSPITALITY_IIL_SERVICE_ID,
        sourceWorkspace: "Hospitality",
        entityType: "reservation",
        entityId: input.reservationId,
        actorId: input.actorId,
        actorName: input.actorName,
        priority: input.eventType === "ReservationCreated" ? "high" : "normal",
        payload: { workspace: "hospitality" },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}

/** Publishes property & inventory events to IIL (Mission P-007.1). */
export function publishInventoryEvent(input: PublishInventoryEventInput, context: ServiceContext): void {
  try {
    const service = getIntelligenceIntegrationService();
    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: HOSPITALITY_IIL_SERVICE_ID,
        sourceWorkspace: "Hospitality",
        entityType: input.eventType === "PropertyUpdated" ? "property" : "inventory",
        entityId: input.entityId,
        actorId: input.actorId,
        actorName: input.actorName,
        priority: input.eventType === "InventoryStatusChanged" ? "high" : "normal",
        payload: { workspace: "hospitality", hospitalityEvent: input.eventType, ...input.payload },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
