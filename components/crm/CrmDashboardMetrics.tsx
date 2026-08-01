import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import type { CrmOverviewView } from "@/lib/crm/models/overview";

type CrmDashboardMetricsProps = {
  dashboard: CrmOverviewView["dashboard"];
};

/** Primary CRM dashboard metrics — health, opportunities, pipeline. */
export function CrmDashboardMetrics({ dashboard }: CrmDashboardMetricsProps) {
  const { customerHealth, activeOpportunities, pipelineValue, pipelineTrend } = dashboard;

  return (
    <Card title="Dashboard" variant="premium">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-orion-md border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
            Customer Health
          </p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold tracking-tight text-white">
              {customerHealth.score}
              <span className="text-base font-light text-white/40">/100</span>
            </p>
            <StatusIndicator status={customerHealth.status} showLabel={false} />
          </div>
          <p className="mt-2 text-xs font-medium text-emerald-400/90">{customerHealth.trend}</p>
        </div>

        <div className="rounded-orion-md border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
            Active Opportunities
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {activeOpportunities}
          </p>
          <p className="mt-2 text-xs font-light text-white/45">Open deals in pipeline</p>
        </div>

        <div className="rounded-orion-md border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
            Pipeline Value
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-orion-gold/95">
            {pipelineValue}
          </p>
          <StatCard label="Trend" value={pipelineTrend} />
        </div>
      </div>
    </Card>
  );
}
