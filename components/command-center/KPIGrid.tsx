import { MetricCard } from "@/components/dashboard/MetricCard";
import type { CommandCenterKpi } from "@/lib/command-center/snapshot-view";
import { WORKSPACE_GRID_4_COL } from "@/lib/constants";

type KPIGridProps = {
  kpis: CommandCenterKpi[];
};

/** Responsive KPI grid for the Command Center business snapshot. */
export function KPIGrid({ kpis }: KPIGridProps) {
  return (
    <div className={WORKSPACE_GRID_4_COL}>
      {kpis.map((kpi) => (
        <MetricCard
          key={kpi.id}
          label={kpi.label}
          value={kpi.value}
          change={kpi.change}
          trend={kpi.trend}
          workspace={kpi.workspace}
        />
      ))}
    </div>
  );
}
