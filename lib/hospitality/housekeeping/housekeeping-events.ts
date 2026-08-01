import { HOSPITALITY_IIL_SERVICE_ID } from "@/lib/hospitality/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishHousekeepingEventInput } from "@/types/hospitality-housekeeping";
import type { ServiceContext } from "@/types/services";

/** Publishes housekeeping & maintenance events to IIL (Mission P-007.5). */
export function publishHousekeepingEvent(
  input: PublishHousekeepingEventInput,
  context: ServiceContext,
): void {
  try {
    const service = getIntelligenceIntegrationService();
    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: HOSPITALITY_IIL_SERVICE_ID,
        sourceWorkspace: "Hospitality",
        entityType: "housekeeping",
        entityId: input.taskId ?? input.workOrderId ?? input.inventoryItemId ?? "housekeeping",
        actorId: input.actorId,
        actorName: input.actorName,
        priority: input.eventType === "MaintenanceRequested" || input.eventType === "InspectionFailed" ? "high" : "normal",
        payload: {
          workspace: "hospitality",
          housekeepingEvent: input.eventType,
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
