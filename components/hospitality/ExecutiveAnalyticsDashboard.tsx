import { Card } from "@/components/ui/Card";
import type { ExecutiveDashboardView } from "@/lib/hospitality/models/analytics";

type ExecutiveAnalyticsDashboardProps = {
  readonly dashboard: ExecutiveDashboardView;
};

/** Executive analytics dashboard (Mission P-007.7). */
export function ExecutiveAnalyticsDashboard({ dashboard }: ExecutiveAnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card title="Operational Health">
          <p className="text-2xl font-semibold text-orion-gold">{dashboard.health.operational}</p>
        </Card>
        <Card title="Revenue Health">
          <p className="text-2xl font-semibold text-orion-gold">{dashboard.health.revenue}</p>
        </Card>
        <Card title="Guest Experience">
          <p className="text-2xl font-semibold text-orion-gold">{dashboard.health.guestExperience}</p>
        </Card>
        <Card title="Overall Score">
          <p className="text-2xl font-semibold text-orion-gold">{dashboard.health.overall}</p>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Executive KPIs">
          <ul className="space-y-2">
            {dashboard.kpis.map((entry) => (
              <li key={entry.label} className="flex justify-between text-sm text-white/70">
                <span>{entry.label}</span>
                <span>
                  {entry.value}
                  {entry.trend ? <span className="ml-2 text-white/40">{entry.trend}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Forecasts">
          <ul className="space-y-2">
            {dashboard.forecasts.map((entry) => (
              <li key={entry.label} className="flex justify-between text-sm text-white/70">
                <span>{entry.label}</span>
                <span>
                  {entry.value} <span className="text-white/40">({entry.confidence}% conf.)</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {dashboard.criticalRisks.length > 0 ? (
        <Card title="Critical Risks">
          <ul className="space-y-2">
            {dashboard.criticalRisks.map((risk) => (
              <li key={risk} className="text-sm text-white/65">
                {risk}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
