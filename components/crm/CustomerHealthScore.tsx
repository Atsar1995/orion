import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import { CUSTOMER_HEALTH_SCORE } from "@/lib/crm-insights";

/** Customer health score with trend and relationship drivers. */
export function CustomerHealthScore() {
  return (
    <Card title="Customer Health Score" variant="premium">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
              Score
            </p>
            <p className="mt-1 text-4xl font-semibold tracking-tight text-white">
              {CUSTOMER_HEALTH_SCORE.score}
              <span className="text-lg font-light text-white/40">/100</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusIndicator status={CUSTOMER_HEALTH_SCORE.status} />
            <StatCard label="Trend" value={CUSTOMER_HEALTH_SCORE.trend} />
          </div>
        </div>
        <p className={WORKSPACE_SUMMARY_CLASS}>{CUSTOMER_HEALTH_SCORE.summary}</p>
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {CUSTOMER_HEALTH_SCORE.drivers.map((driver) => (
            <li
              key={driver.label}
              className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
            >
              <p className="text-[11px] font-medium tracking-wide text-white/40 uppercase">
                {driver.label}
              </p>
              <div className="mt-2">
                <StatusIndicator status={driver.status} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
