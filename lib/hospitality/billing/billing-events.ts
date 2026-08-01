import { HOSPITALITY_IIL_SERVICE_ID } from "@/lib/hospitality/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishBillingEventInput } from "@/types/hospitality-billing";
import type { ServiceContext } from "@/types/services";

/** Publishes hospitality financial events to IIL for Finance Workspace consumption (P-007.6). */
export function publishBillingEvent(input: PublishBillingEventInput, context: ServiceContext): void {
  try {
    const service = getIntelligenceIntegrationService();
    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: HOSPITALITY_IIL_SERVICE_ID,
        sourceWorkspace: "Hospitality",
        entityType: "billing",
        entityId: input.folioId ?? input.chargeId ?? input.paymentId ?? "billing",
        actorId: input.actorId,
        actorName: input.actorName,
        priority: input.eventType === "RefundIssued" ? "high" : "normal",
        payload: {
          workspace: "hospitality",
          billingEvent: input.eventType,
          amount: String(input.amount ?? 0),
          financeWorkspaceTarget: "true",
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
