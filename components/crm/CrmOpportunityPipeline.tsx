import { FinanceBarChart } from "@/components/finance/FinanceBarChart";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import {
  getPipelineChartPoints,
  OPPORTUNITY_PIPELINE,
  PIPELINE_SUMMARY,
} from "@/lib/crm-insights";

/** Opportunity pipeline by stage with counts and trend. */
export function CrmOpportunityPipeline() {
  return (
    <Card title="Opportunity Pipeline">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={WORKSPACE_SUMMARY_CLASS}>{PIPELINE_SUMMARY.summary}</p>
          <span className="text-sm font-semibold text-orion-gold/90">
            {PIPELINE_SUMMARY.trend}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
          <StatCard label="Pipeline Value" value={PIPELINE_SUMMARY.totalValue} />
          <StatCard label="Open Deals" value="24" />
        </div>
        <FinanceBarChart
          data={getPipelineChartPoints(OPPORTUNITY_PIPELINE)}
          ariaLabel="Opportunity pipeline by stage"
        />
      </div>
    </Card>
  );
}
