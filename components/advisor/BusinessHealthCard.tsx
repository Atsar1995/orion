import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { BUSINESS_HEALTH } from "@/lib/advisor-data";

/** Overall business health score, trend, and status. */
export function BusinessHealthCard() {
  return (
    <Card title="Business Health" variant="premium">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Health Score" value={`${BUSINESS_HEALTH.score} / 100`} />
        <StatCard label="Trend" value={BUSINESS_HEALTH.trend} />
        <div className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
          <p className="text-[11px] font-medium tracking-wide text-white/40 uppercase">
            Status
          </p>
          <div className="mt-2">
            <StatusIndicator status={BUSINESS_HEALTH.status} />
          </div>
        </div>
      </div>
    </Card>
  );
}
