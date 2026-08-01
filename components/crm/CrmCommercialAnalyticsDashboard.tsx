"use client";

import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_GRID_2_COL, WORKSPACE_GRID_3_COL } from "@/lib/constants";
import { formatCommercialCurrency } from "@/lib/crm/commercial";
import type { CommercialExecutiveDashboard } from "@/lib/crm/models/commercial-intelligence";
import { cn } from "@/lib/utils";

type CrmCommercialAnalyticsDashboardProps = {
  view: CommercialExecutiveDashboard;
};

const SEVERITY_CLASS: Record<string, string> = {
  critical: "text-red-400",
  high: "text-amber-400",
  medium: "text-sky-400",
  low: "text-muted-foreground",
};

/** Commercial intelligence executive dashboard (Mission P-008.5). */
export function CrmCommercialAnalyticsDashboard({ view }: CrmCommercialAnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className={`${WORKSPACE_GRID_3_COL} md:grid-cols-2 xl:grid-cols-4`}>
        {view.kpis.slice(0, 8).map((kpi) => (
          <StatCard key={kpi.id} label={kpi.label} value={kpi.value} />
        ))}
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Pipeline by Stage" subtitle={`${view.pipelineSnapshot.openCount} open deals`}>
          <ul className="space-y-2 text-sm">
            {view.pipelineSnapshot.byStage.map((entry) => (
              <li key={entry.stage} className="flex justify-between gap-4">
                <span>{entry.stage}</span>
                <span className="text-muted-foreground">
                  {entry.count} · {formatCommercialCurrency(entry.value)}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Pipeline by Owner">
          <ul className="space-y-2 text-sm">
            {view.pipelineSnapshot.byOwner.map((entry) => (
              <li key={entry.owner} className="flex justify-between gap-4">
                <span>{entry.owner}</span>
                <span className="text-muted-foreground">
                  {entry.count} · {formatCommercialCurrency(entry.value)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Revenue Forecasts" subtitle="Revenue, pipeline, renewal, and opportunity forecasts">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Period</th>
                <th className="px-3 py-2 font-medium">Projected</th>
                <th className="px-3 py-2 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {view.forecasts.map((forecast) => (
                <tr key={`${forecast.forecastType}-${forecast.period}`} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2 capitalize">{forecast.forecastType.replace(/_/g, " ")}</td>
                  <td className="px-3 py-2">{forecast.period}</td>
                  <td className="px-3 py-2">{formatCommercialCurrency(forecast.projectedValue)}</td>
                  <td className="px-3 py-2 tabular-nums">{forecast.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Relationship Health" subtitle="Account-level scoring">
          <ul className="space-y-3 text-sm">
            {view.relationshipHealth.slice(0, 6).map((entry) => (
              <li key={entry.partyId} className="rounded-md border border-border/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{entry.partyName}</span>
                  <span
                    className={cn(
                      "tabular-nums",
                      entry.status === "healthy" && "text-emerald-400",
                      entry.status === "at_risk" && "text-amber-400",
                      entry.status === "critical" && "text-red-400",
                    )}
                  >
                    {entry.score}/100
                  </span>
                </div>
                {entry.drivers[0] ? (
                  <p className="mt-1 text-xs text-muted-foreground">{entry.drivers[0]}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Benchmarks" subtitle="Performance vs industry baseline">
          <ul className="space-y-2 text-sm">
            {view.benchmarks.map((entry) => (
              <li key={entry.id} className="flex justify-between gap-4">
                <span>{entry.label}</span>
                <span className={cn(entry.variance >= 0 ? "text-emerald-400" : "text-amber-400")}>
                  {entry.variance >= 0 ? "+" : ""}
                  {entry.variance}% vs benchmark
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Commercial Insights" subtitle="What, why, and what's likely next">
        <ul className="space-y-4 text-sm">
          {view.insights.map((insight) => (
            <li key={insight.id} className="rounded-md border border-border/60 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{insight.title}</p>
                <span className={cn("text-xs capitalize", SEVERITY_CLASS[insight.impact])}>{insight.impact}</span>
              </div>
              <p className="mt-1">{insight.summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">Why: </span>
                {insight.why}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">Likely next: </span>
                {insight.likelyNext}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Recommendations" subtitle="Executive actions with expected impact">
          <ol className="space-y-3 text-sm">
            {view.recommendations.map((rec) => (
              <li key={rec.id} className="rounded-md border border-border/60 p-3">
                <p className="font-medium">
                  {rec.priority}. {rec.title}
                </p>
                <p className="mt-1">{rec.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{rec.expectedImpact}</p>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Commercial Alerts" subtitle={`${view.alerts.length} active risk signal(s)`}>
          <ul className="space-y-3 text-sm">
            {view.alerts.map((alert) => (
              <li key={alert.id} className="rounded-md border border-border/60 p-3">
                <p className={cn("font-medium capitalize", SEVERITY_CLASS[alert.severity])}>{alert.title}</p>
                <p className="mt-1 text-muted-foreground">{alert.message}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
