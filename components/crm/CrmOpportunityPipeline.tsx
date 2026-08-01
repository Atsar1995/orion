import { FinanceBarChart } from "@/components/finance/FinanceBarChart";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { getPipelineChartPoints } from "@/lib/crm";
import type { CrmPipelineView } from "@/lib/crm/models/overview";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";

type CrmOpportunityPipelineProps = {
  pipeline: CrmPipelineView;
};

/** Opportunity pipeline by stage with counts and trend. */
export function CrmOpportunityPipeline({ pipeline }: CrmOpportunityPipelineProps) {
  return (
    <Card title="Opportunity Pipeline">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={WORKSPACE_SUMMARY_CLASS}>{pipeline.summary}</p>
          <span className="text-sm font-semibold text-orion-gold/90">{pipeline.trend}</span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
          <StatCard label="Pipeline Value" value={pipeline.totalValue} />
          <StatCard label="Open Deals" value={String(pipeline.activeOpportunities)} />
        </div>
        <FinanceBarChart
          data={getPipelineChartPoints(pipeline.stages)}
          ariaLabel="Opportunity pipeline by stage"
        />
      </div>
    </Card>
  );
}
