import { FINANCE_IIL_SERVICE_ID } from "@/lib/finance/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishFinanceEventInput } from "@/types/finance-events";
import type { IntelligenceEvent, IntelligenceEventType } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

/** Publishes Finance domain financial events to IIL (Mission P-009.1 — contracts only). */
export function publishFinanceEvent(
  input: PublishFinanceEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const service = getIntelligenceIntegrationService();

  const iilEventType: IntelligenceEventType =
    input.eventType === "InvoiceIssued" ? "InvoiceIssued" : "CustomEvent";

  return service.publish(
    {
      eventType: iilEventType,
      sourceService: FINANCE_IIL_SERVICE_ID,
      sourceWorkspace: "Finance",
      entityType: input.entityType,
      entityId: input.entityId,
      actorId: input.actorId ?? context.userId,
      actorName: input.actorName,
      priority: input.priority ?? "normal",
      correlationId: input.correlationId,
      payload: {
        workspace: "finance",
        financeEvent: input.eventType,
        idempotencyKey: input.idempotencyKey ?? "",
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}
