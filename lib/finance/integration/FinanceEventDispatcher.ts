import type { FinanceInboundProcessor } from "@/lib/finance/integration/FinanceInboundProcessor";
import {
  resolveCanonicalEventType,
  type HcmFinanceEventType,
} from "@/lib/finance/integration/FinanceEventMapper";
import type { FinanceEventResult } from "@/lib/finance/integration/FinanceEventResult";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

/** Routes inbound HCM events to the Finance inbound processor (P-009.9). */
export class FinanceEventDispatcher {
  constructor(private readonly processor: FinanceInboundProcessor) {}

  /** Dispatches a supported canonical event type to the processor. */
  async dispatch(
    event: IntelligenceEvent,
    context: ServiceContext,
    eventType: HcmFinanceEventType,
  ): Promise<FinanceEventResult> {
    switch (eventType) {
      case "hcm.workforce.cost.recorded":
      case "hcm.expense.approved":
        return this.processor.process(event, context, eventType);
      default: {
        const unsupported: never = eventType;
        return {
          status: "rejected",
          eventId: event.eventId,
          eventType: unsupported,
          code: "UNSUPPORTED_EVENT",
          message: "Unsupported HCM finance event type",
        };
      }
    }
  }

  /** Resolves and dispatches when the envelope carries a supported canonical type. */
  async dispatchIfSupported(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): Promise<FinanceEventResult | null> {
    const eventType = resolveCanonicalEventType(event);
    if (!eventType) {
      return null;
    }

    return this.dispatch(event, context, eventType);
  }
}
