import { Card } from "@/components/ui/Card";
import type { HospitalityAnalyticsView } from "@/lib/hospitality/models/analytics";

type HospitalityInsightsPanelProps = {
  readonly analytics: HospitalityAnalyticsView;
};

/** Insight, trend, and recommendation panel (Mission P-007.7). */
export function HospitalityInsightsPanel({ analytics }: HospitalityInsightsPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Executive Insights">
        <ul className="space-y-4">
          {analytics.insights.map((entry) => (
            <li key={entry.id} className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] p-4">
              <p className="text-sm font-medium text-white/85">{entry.title}</p>
              <p className="mt-2 text-sm font-light text-white/60">{entry.narrative}</p>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Recommendations">
        <ul className="space-y-3">
          {analytics.recommendations.map((entry) => (
            <li key={entry.priority} className="text-sm text-white/70">
              <span className="text-orion-gold">P{entry.priority}</span> — {entry.title}
              <p className="mt-1 text-xs text-white/45">{entry.rationale}</p>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Trend Analysis">
        <ul className="space-y-2">
          {analytics.trends.map((entry) => (
            <li key={entry.id} className="text-sm text-white/70">
              <span className="font-medium">{entry.label}</span> ({entry.direction} {entry.changePercent}%): {entry.narrative}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Benchmarks">
        <ul className="space-y-2">
          {analytics.benchmarks.map((entry) => (
            <li key={entry.id} className="flex justify-between text-sm text-white/70">
              <span>{entry.metric}</span>
              <span>
                {entry.actual} vs {entry.benchmark} {entry.unit} ({entry.status})
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
