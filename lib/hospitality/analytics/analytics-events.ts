import { HOSPITALITY_IIL_SERVICE_ID } from "@/lib/hospitality/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishAnalyticsEventInput } from "@/types/hospitality-analytics";
import type { ServiceContext } from "@/types/services";

/** Publishes hospitality analytics events to IIL for Executive Memory (P-007.7). */
export function publishAnalyticsEvent(input: PublishAnalyticsEventInput, context: ServiceContext): void {
  try {
    const service = getIntelligenceIntegrationService();
    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: HOSPITALITY_IIL_SERVICE_ID,
        sourceWorkspace: "Hospitality",
        entityType: "analytics",
        entityId: input.entityId,
        actorId: input.actorId,
        actorName: input.actorName,
        priority: input.eventType === "KpiThresholdBreached" ? "high" : "normal",
        payload: {
          workspace: "hospitality",
          analyticsEvent: input.eventType,
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
