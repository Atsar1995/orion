import type { FinanceInboundProcessor } from "@/lib/finance/integration/FinanceInboundProcessor";
import {
  resolveCanonicalEventType,
  resolveCrmCanonicalEventType,
  resolveProcurementCanonicalEventType,
  type CrmFinanceEventType,
  type FinanceInboundEventType,
  type HcmFinanceEventType,
} from "@/lib/finance/integration/FinanceEventMapper";
import type { ProcurementFinanceEventType } from "@/lib/finance/integration/FinanceProcurementSupportedEvents";
import type { FinanceEventResult } from "@/lib/finance/integration/FinanceEventResult";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

/** Routes inbound HCM, CRM, and Procurement events to the Finance inbound processor (P-009.9 · P-009.19 · P-010.19). */
export class FinanceEventDispatcher {
  constructor(private readonly processor: FinanceInboundProcessor) {}

  /** Dispatches a supported canonical event type to the processor. */
  async dispatch(
    event: IntelligenceEvent,
    context: ServiceContext,
    eventType: FinanceInboundEventType,
  ): Promise<FinanceEventResult> {
    switch (eventType) {
      case "hcm.workforce.cost.recorded":
      case "hcm.expense.approved":
      case "crm.revenue.recognized":
      case "crm.salesorder.confirmed":
      case "procurement.invoice.approved":
      case "procurement.purchaseorder.approved":
      case "procurement.goods.received":
        return this.processor.process(event, context, eventType);
      default: {
        const unsupported: never = eventType;
        return {
          status: "rejected",
          eventId: event.eventId,
          eventType: unsupported,
          code: "UNSUPPORTED_EVENT",
          message: "Unsupported inbound finance event type",
        };
      }
    }
  }

  /** Resolves and dispatches when the envelope carries a supported HCM canonical type. */
  async dispatchHcmIfSupported(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): Promise<FinanceEventResult | null> {
    const eventType = resolveCanonicalEventType(event);
    if (!eventType) {
      return null;
    }

    return this.dispatch(event, context, eventType);
  }

  /** Resolves and dispatches when the envelope carries a supported CRM canonical type. */
  async dispatchCrmIfSupported(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): Promise<FinanceEventResult | null> {
    const eventType = resolveCrmCanonicalEventType(event);
    if (!eventType) {
      return null;
    }

    return this.dispatch(event, context, eventType);
  }

  /** Resolves and dispatches when the envelope carries a supported Procurement canonical type. */
  async dispatchProcurementIfSupported(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): Promise<FinanceEventResult | null> {
    const eventType = resolveProcurementCanonicalEventType(event);
    if (!eventType) {
      return null;
    }

    return this.dispatch(event, context, eventType);
  }
}

export type {
  CrmFinanceEventType,
  FinanceInboundEventType,
  HcmFinanceEventType,
  ProcurementFinanceEventType,
};
