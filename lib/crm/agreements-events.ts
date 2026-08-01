import { CRM_IIL_SERVICE_ID } from "@/lib/crm/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishAgreementsEngineEventInput } from "@/types/crm-agreements";
import type { ServiceContext } from "@/types/services";

/** Publishes commercial agreements events to IIL (Mission P-008.3). */
export function publishAgreementsEngineEvent(
  input: PublishAgreementsEngineEventInput,
  context: ServiceContext,
): void {
  try {
    const service = getIntelligenceIntegrationService();
    const priority =
      input.eventType === "ContractSigned" || input.eventType === "ContractExpired" ? "high" : "normal";

    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: CRM_IIL_SERVICE_ID,
        sourceWorkspace: "Customer Intelligence",
        entityType: input.eventType.startsWith("Proposal") ? "proposal" : "contract",
        entityId: input.entityId,
        actorId: input.actorId ?? context.userId,
        actorName: input.actorName,
        priority,
        payload: {
          workspace: "crm",
          agreementsEvent: input.eventType,
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
