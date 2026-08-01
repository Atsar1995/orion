import type { FinancialEventPipelineService } from "@/lib/finance/event-pipeline/FinancialEventPipelineService";
import type { ExecutiveFinancialIntelligenceService } from "@/lib/finance/executive-intelligence/ExecutiveFinancialIntelligenceService";
import type { ServiceContext, ServiceResult } from "@/types/services";

/** Legacy executive intelligence adapter (Mission P-009.7). */
export type ExecutiveIntelligenceService = {
  getFinancialKpis(context: ServiceContext): ServiceResult<readonly { key: string; value: number }[]>;
};

export class DefaultExecutiveIntelligenceService implements ExecutiveIntelligenceService {
  constructor(
    private readonly intelligence: ExecutiveFinancialIntelligenceService,
    private readonly pipeline?: FinancialEventPipelineService,
  ) {}

  getFinancialKpis(context: ServiceContext): ServiceResult<readonly { key: string; value: number }[]> {
    const kpis = this.intelligence.getFinancialKpis(context);
    return {
      success: true,
      data: kpis.map((kpi) => ({ key: kpi.key, value: kpi.value })),
    };
  }

  /** Refresh intelligence from pipeline processed events. */
  refreshFromPipeline(context: ServiceContext): ServiceResult<{ refreshed: boolean }> {
    if (!this.pipeline) {
      return { success: true, data: { refreshed: false } };
    }

    const inquiry = this.pipeline.inquiry({ status: "processed" }, context);
    for (const event of inquiry.events.slice(0, 5)) {
      this.intelligence.consumeDomainEvent(
        { eventType: "FinancialEventProcessed", entityId: event.id },
        context,
      );
    }

    return { success: true, data: { refreshed: true } };
  }
}
