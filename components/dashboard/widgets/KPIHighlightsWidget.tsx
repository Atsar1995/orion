import { Widget, WidgetBody, WidgetFooter, WidgetHeader } from "@/components/dashboard";
import type { DashboardKPIData } from "@/lib/dashboard/types";

type KPIHighlightsWidgetProps = {
  data: DashboardKPIData;
};

const TREND_CLASS = {
  up: "text-emerald-300",
  down: "text-red-300",
  flat: "text-white/55",
} as const;

/** EP-002 KPI highlights widget — presentation only. */
export function KPIHighlightsWidget({ data }: KPIHighlightsWidgetProps) {
  return (
    <Widget>
      <WidgetHeader title="KPI Highlights" description="Cross-workspace executive metrics" />
      <WidgetBody>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.items.map((kpi) => (
            <li
              key={kpi.id}
              className="rounded-orion-md border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <p className="text-xs text-white/45">{kpi.label}</p>
              <p className="mt-1 text-xl font-semibold text-white">{kpi.value}</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                <span className={TREND_CLASS[kpi.trend]}>{kpi.change}</span>
                <span className="text-white/45">{kpi.workspace}</span>
              </div>
            </li>
          ))}
        </ul>
      </WidgetBody>
      <WidgetFooter>{data.items.length} KPIs in snapshot</WidgetFooter>
    </Widget>
  );
}
