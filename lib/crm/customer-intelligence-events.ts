import { CRM_IIL_SERVICE_ID } from "@/lib/crm/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishCustomerIntelligenceEventInput } from "@/types/crm-customer-intelligence";
import type { ServiceContext } from "@/types/services";

/** Publishes customer intelligence events to IIL (Mission P-008.6). */
export function publishCustomerIntelligenceEvent(
  input: PublishCustomerIntelligenceEventInput,
  context: ServiceContext,
): void {
  try {
    const service = getIntelligenceIntegrationService();
    const priority =
      input.eventType === "RetentionRiskDetected" ? "high" : "normal";

    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: CRM_IIL_SERVICE_ID,
        sourceWorkspace: "Customer Intelligence",
        entityType: "customer_intelligence",
        entityId: input.entityId,
        actorId: input.actorId ?? context.userId,
        actorName: input.actorName,
        priority,
        payload: {
          workspace: "crm",
          customerIntelligenceEvent: input.eventType,
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
