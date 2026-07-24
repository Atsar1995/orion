import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import type { CrmKpiMetric, CrmTrendDirection } from "@/lib/crm-insights";
import { CRM_ENHANCED_KPIS } from "@/lib/crm-insights";
import { cn } from "@/lib/utils";

const TREND_CLASS: Record<CrmTrendDirection, string> = {
  up: "text-emerald-400/90",
  down: "text-red-400/90",
  neutral: "text-white/45",
};

function EnhancedKpiCard({ metric }: { metric: CrmKpiMetric }) {
  return (
    <div className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
      <p className="text-[11px] font-medium tracking-wide text-white/40 uppercase">
        {metric.label}
      </p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-white">
        {metric.value}
      </p>
      <p className={cn("mt-1 text-xs font-medium", TREND_CLASS[metric.direction])}>
        {metric.change}
      </p>
    </div>
  );
}

/** Enhanced customer intelligence KPI cards with trend indicators. */
export function CrmEnhancedKpiCards() {
  return (
    <Card title="Key Metrics">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        {CRM_ENHANCED_KPIS.map((metric) => (
          <EnhancedKpiCard key={metric.label} metric={metric} />
        ))}
      </div>
    </Card>
  );
}

/** Compact KPI row for Executive Brief integration. */
export function CrmKpiSummaryRow() {
  const summaryMetrics = CRM_ENHANCED_KPIS.slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {summaryMetrics.map((metric) => (
        <StatCard key={metric.label} label={metric.label} value={metric.value} />
      ))}
    </div>
  );
}
