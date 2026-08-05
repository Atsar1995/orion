import {
  CrmCanonicalEventPublisher,
} from "@/lib/crm/events";
import type { ServiceContext } from "@/types/services";

/** Confirms sales orders and emits canonical commercial events (Mission P-008.15). */
export class SalesOrderService {
  constructor(private readonly canonicalPublisher: CrmCanonicalEventPublisher) {}

  confirm(
    input: {
      readonly salesOrderId: string;
      readonly quoteId?: string;
      readonly amount: string;
      readonly currencyCode: string;
      readonly correlationId: string;
      readonly causationId?: string;
      readonly period?: string;
    },
    context: ServiceContext,
  ): void {
    this.canonicalPublisher.publishSalesOrderConfirmed(
      {
        salesOrderId: input.salesOrderId,
        quoteId: input.quoteId,
        correlationId: input.correlationId,
        causationId: input.causationId,
      },
      context,
    );

    this.canonicalPublisher.publishRevenueRecognized(
      {
        salesOrderId: input.salesOrderId,
        correlationId: input.correlationId,
        causationId: input.causationId,
        amount: input.amount,
        currencyCode: input.currencyCode,
        period: input.period,
      },
      context,
    );
  }
}
