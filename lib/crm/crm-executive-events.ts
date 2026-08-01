import { CRM_IIL_SERVICE_ID } from "@/lib/crm/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishExecutiveDashboardEventInput } from "@/types/crm-executive-dashboard";
import type { ServiceContext } from "@/types/services";

/** Publishes executive dashboard events to IIL (Mission P-008.7). */
export function publishExecutiveDashboardEvent(
  input: PublishExecutiveDashboardEventInput,
  context: ServiceContext,
): void {
  try {
    const service = getIntelligenceIntegrationService();
    const priority =
      input.eventType === "ExecutiveAlertRaised" ? "high" : "normal";

    service.publish(
      {
        eventType: "CustomEvent",
        sourceService: CRM_IIL_SERVICE_ID,
        sourceWorkspace: "Commercial Executive Dashboard",
        entityType: "executive_dashboard",
        entityId: input.entityId,
        actorId: input.actorId ?? context.userId,
        actorName: input.actorName,
        priority,
        payload: {
          workspace: "crm",
          executiveDashboardEvent: input.eventType,
          ...input.payload,
        },
      },
      context,
    );
  } catch {
    /* Idempotent / unauthorized in demo context */
  }
}
