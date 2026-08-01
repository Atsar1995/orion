import { FINANCE_IIL_SERVICE_ID } from "@/lib/finance/constants";
import { financeEventPipelineService } from "@/lib/finance/FinanceFacade";
import { defaultEventService } from "@/lib/finance/services/DefaultEventService";
import { FINANCE_BUSINESS_EVENT_SUBSCRIPTIONS } from "@/lib/finance/events/subscriptions";
import type { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import type { FinanceBusinessEventType } from "@/types/finance-events";
import type { IntelligenceEvent } from "@/types/intelligence-integration";

const initializedServices = new WeakSet<IntelligenceIntegrationService>();

function resolveBusinessEventType(event: IntelligenceEvent): FinanceBusinessEventType {
  const payloadType = event.payload.businessEvent ?? event.payload.partyEvent ?? event.payload.billingEvent;

  if (payloadType === "ContractSigned") return "ContractSigned";
  if (payloadType === "ContractRenewed") return "ContractRenewed";
  if (payloadType === "FolioSettled") return "FolioSettled";
  if (payloadType === "BillingChargePosted") return "BillingChargePosted";
  if (payloadType === "OpportunityWon") return "OpportunityWon";

  if (event.eventType === "InvoiceIssued") return "CustomEvent";
  if (event.eventType === "ReservationCreated") return "FolioSettled";

  return "CustomEvent";
}

/** Registers Finance IIL subscriptions — routes events through pipeline (P-009.6). */
export function registerFinanceEventSubscriptions(service: IntelligenceIntegrationService): void {
  if (initializedServices.has(service)) {
    return;
  }

  initializedServices.add(service);

  service.subscribe(
    {
      subscriberId: FINANCE_IIL_SERVICE_ID,
      eventTypes: [
        "CustomEvent",
        "InvoiceIssued",
        "CustomerUpdated",
        "ReservationCreated",
      ],
      priority: 25,
    },
    async (event, context) => {
      if (
        !(FINANCE_BUSINESS_EVENT_SUBSCRIPTIONS.sourceServices as readonly string[]).includes(
          event.sourceService,
        )
      ) {
        return;
      }

      const businessEventType = resolveBusinessEventType(event);
      const recorded = defaultEventService.recordInboundBusinessEvent(event, businessEventType, context);

      if (recorded.success) {
        financeEventPipelineService.processIntake(
          {
            businessEventType,
            sourceService: event.sourceService,
            sourceEntityType: event.entityType,
            sourceEntityId: event.entityId,
            correlationId: event.correlationId,
            idempotencyKey: recorded.data.id,
            periodId: "period-2026-07",
            currency: { transactionCurrency: "ZAR" },
          },
          context,
        );
      }
    },
  );

  defaultEventService.setSubscriptionCount(1);
}

export { FINANCE_BUSINESS_EVENT_SUBSCRIPTIONS };
