import { randomUUID } from "crypto";
import { publishFinanceEvent } from "@/lib/finance/finance-events";
import type { EventService } from "@/lib/finance/services/EventService";
import type {
  FinanceBusinessEventType,
  FinanceInboundBusinessEventRecord,
  PublishFinanceEventInput,
} from "@/types/finance-events";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext, ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";
import { validateAuthorizedEventSource } from "@/lib/finance/validation/stages";

/** In-memory event service — contracts only, no financial transformation. */
export class DefaultEventService implements EventService {
  private readonly inboundEvents = new Map<string, FinanceInboundBusinessEventRecord[]>();
  private subscriptionCount = 0;

  setSubscriptionCount(count: number): void {
    this.subscriptionCount = count;
  }

  publishFinancialEvent(
    input: PublishFinanceEventInput,
    context: ServiceContext,
  ): ServiceResult<IntelligenceEvent> {
    try {
      const event = publishFinanceEvent(input, context);
      return { success: true, data: event };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ServiceErrorCode.Dependency,
          message: error instanceof Error ? error.message : "FINANCE_EVENT_PUBLISH_FAILED",
        },
      };
    }
  }

  recordInboundBusinessEvent(
    event: IntelligenceEvent,
    businessEventType: FinanceBusinessEventType,
    context: ServiceContext,
  ): ServiceResult<FinanceInboundBusinessEventRecord> {
    const sourceIssues = validateAuthorizedEventSource(event.sourceService);
    if (sourceIssues.length > 0) {
      return {
        success: false,
        error: {
          code: ServiceErrorCode.Validation,
          message: sourceIssues[0]?.message ?? "UNAUTHORIZED_EVENT_SOURCE",
        },
      };
    }

    if (event.organizationId !== context.organizationId) {
      return {
        success: false,
        error: {
          code: ServiceErrorCode.Validation,
          message: "ORGANIZATION_MISMATCH",
        },
      };
    }

    const record: FinanceInboundBusinessEventRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      eventType: businessEventType,
      sourceService: event.sourceService,
      sourceEntityType: event.entityType,
      sourceEntityId: event.entityId,
      correlationId: event.correlationId,
      receivedAt: new Date().toISOString(),
      status: "received",
    };

    const bucket = this.inboundEvents.get(context.organizationId) ?? [];
    bucket.push(record);
    this.inboundEvents.set(context.organizationId, bucket);

    return { success: true, data: record };
  }

  listInboundBusinessEvents(context: ServiceContext): readonly FinanceInboundBusinessEventRecord[] {
    return this.inboundEvents.get(context.organizationId) ?? [];
  }

  getSubscriptionCount(): number {
    return this.subscriptionCount;
  }
}

export const defaultEventService = new DefaultEventService();
