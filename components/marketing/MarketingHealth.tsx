import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { MARKETING_HEALTH, MARKETING_METRICS } from "@/lib/marketing-data";

/** Marketing health score, status, and key KPIs. */
export function MarketingHealth() {
  return (
    <Card title="Marketing Health">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StatusIndicator status={MARKETING_HEALTH.status} />
          <div className="text-right">
            <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
              Health Score
            </p>
            <p className="text-2xl font-semibold tracking-tight text-white">
              {MARKETING_HEALTH.score}/100
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-light text-white/55">
          <p>
            Top channel:{" "}
            <span className="font-medium text-orion-gold/90">
              {MARKETING_HEALTH.topChannel}
            </span>
          </p>
          <p>
            Needs attention:{" "}
            <span className="font-medium text-amber-400/90">
              {MARKETING_HEALTH.lowestChannel}
            </span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
          {MARKETING_METRICS.map((metric) => (
            <StatCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </div>
    </Card>
  );
}
