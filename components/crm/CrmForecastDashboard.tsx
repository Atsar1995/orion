import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_GRID_2_COL, WORKSPACE_GRID_3_COL } from "@/lib/constants";
import type { ForecastDashboardView } from "@/lib/crm/models/commercial";

type CrmForecastDashboardProps = {
  view: ForecastDashboardView;
};

/** CRM revenue forecast dashboard (Mission P-008.2). */
export function CrmForecastDashboard({ view }: CrmForecastDashboardProps) {
  return (
    <div className="space-y-6">
      <div className={`${WORKSPACE_GRID_3_COL} md:grid-cols-2 xl:grid-cols-4`}>
        {view.forecasts.map((forecast) => (
          <StatCard
            key={forecast.period}
            label={forecast.period}
            value={`₹${(forecast.projectedRevenue / 100000).toFixed(1)}L`}
          />
        ))}
      </div>

      <Card title="Top Opportunities" subtitle="Priority deals by score">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Opportunity</th>
                <th className="px-3 py-2 font-medium">Stage</th>
                <th className="px-3 py-2 font-medium">Value</th>
                <th className="px-3 py-2 font-medium">Expected Revenue</th>
                <th className="px-3 py-2 font-medium">Probability</th>
                <th className="px-3 py-2 font-medium">Owner</th>
              </tr>
            </thead>
            <tbody>
              {view.topOpportunities.map((item) => (
                <tr key={item.id} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2 font-medium">{item.name}</td>
                  <td className="px-3 py-2">{item.stage}</td>
                  <td className="px-3 py-2">{item.value}</td>
                  <td className="px-3 py-2">{item.expectedRevenue}</td>
                  <td className="px-3 py-2 tabular-nums">{item.probability}%</td>
                  <td className="px-3 py-2">{item.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className={WORKSPACE_GRID_2_COL}>
        {view.forecasts.map((forecast) => (
          <Card key={`detail-${forecast.period}`} title={`${forecast.period} Forecast`}>
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Projected revenue</dt>
                <dd className="font-medium">₹{forecast.projectedRevenue.toLocaleString("en-IN")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Confidence</dt>
                <dd>{forecast.confidence}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Opportunities</dt>
                <dd>{forecast.opportunityCount}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>
    </div>
  );
}
