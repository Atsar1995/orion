import { CRM_IIL_SERVICE_ID } from "@/lib/crm/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishPartyEngineEventInput } from "@/types/crm-party";
import type { ServiceContext } from "@/types/services";

/** Publishes CRM party domain events to IIL (Mission P-008.1). */
export function publishPartyEngineEvent(
  input: PublishPartyEngineEventInput,
  context: ServiceContext,
): void {
  try {
    const service = getIntelligenceIntegrationService();
    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: CRM_IIL_SERVICE_ID,
        sourceWorkspace: "Customer Intelligence",
        entityType: "party",
        entityId: input.partyId,
        actorId: input.actorId ?? context.userId,
        actorName: input.actorName,
        priority: input.eventType === "PartyArchived" ? "high" : "normal",
        payload: {
          workspace: "crm",
          partyEvent: input.eventType,
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
