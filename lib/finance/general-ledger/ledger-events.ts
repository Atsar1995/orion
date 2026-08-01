import { FINANCE_IIL_SERVICE_ID } from "@/lib/finance/constants";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishLedgerEventInput } from "@/types/finance-general-ledger";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

/** Publishes General Ledger domain events to IIL (Mission P-009.3). */
export function publishLedgerEvent(
  input: PublishLedgerEventInput,
  context: ServiceContext,
): IntelligenceEvent {
  const service = getIntelligenceIntegrationService();

  return service.publish(
    {
      eventType: "CustomEvent",
      sourceService: FINANCE_IIL_SERVICE_ID,
      sourceWorkspace: "Finance",
      entityType: input.entityType,
      entityId: input.entityId,
      actorId: context.userId,
      correlationId: input.correlationId,
      payload: {
        workspace: "finance",
        ledgerEvent: input.eventType,
        ...(input.payload ?? {}),
      },
    },
    context,
  );
}
