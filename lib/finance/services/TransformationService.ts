import type { FinancialEventPipelineService } from "@/lib/finance/event-pipeline/FinancialEventPipelineService";
import type { EventService } from "@/lib/finance/services/EventService";
import type { ServiceContext, ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

/** Event transformation service — delegates to Financial Event Pipeline (P-009.6). */
export type TransformationService = {
  transformBusinessEvent(
    context: ServiceContext,
    inboundEventId: string,
  ): ServiceResult<{ financialEventType: string }>;
};

export class DefaultTransformationService implements TransformationService {
  constructor(
    private readonly pipeline: FinancialEventPipelineService,
    private readonly eventService: EventService,
  ) {}

  transformBusinessEvent(
    context: ServiceContext,
    inboundEventId: string,
  ): ServiceResult<{ financialEventType: string }> {
    const inbound = this.eventService
      .listInboundBusinessEvents(context)
      .find((event) => event.id === inboundEventId);

    if (!inbound) {
      return {
        success: false,
        error: { code: ServiceErrorCode.Validation, message: "INBOUND_EVENT_NOT_FOUND" },
      };
    }

    const result = this.pipeline.processIntake(
      {
        businessEventType: inbound.eventType,
        sourceService: inbound.sourceService,
        sourceEntityType: inbound.sourceEntityType,
        sourceEntityId: inbound.sourceEntityId,
        correlationId: inbound.correlationId,
        idempotencyKey: inbound.id,
        periodId: "period-2026-07",
        currency: { transactionCurrency: "ZAR" },
      },
      context,
    );

    if (!result.success || !result.financialEvent) {
      return {
        success: false,
        error: {
          code: ServiceErrorCode.Validation,
          message: result.errorMessage ?? "TRANSFORMATION_FAILED",
        },
      };
    }

    return {
      success: true,
      data: { financialEventType: result.financialEvent.financialEventType },
    };
  }
}
