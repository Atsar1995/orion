import type {
  FinanceBusinessEventType,
  FinanceInboundBusinessEventRecord,
  PublishFinanceEventInput,
} from "@/types/finance-events";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext, ServiceResult } from "@/types/services";

/** Event service contract — publish/subscribe without transformation (Mission P-009.1). */
export type EventService = {
  publishFinancialEvent(
    input: PublishFinanceEventInput,
    context: ServiceContext,
  ): ServiceResult<IntelligenceEvent>;
  recordInboundBusinessEvent(
    event: IntelligenceEvent,
    businessEventType: FinanceBusinessEventType,
    context: ServiceContext,
  ): ServiceResult<FinanceInboundBusinessEventRecord>;
  listInboundBusinessEvents(context: ServiceContext): readonly FinanceInboundBusinessEventRecord[];
  getSubscriptionCount(): number;
};
