import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { HOTEL_HEALTH, HOTEL_KPIS } from "@/lib/hospitality-data";

/** Hotel health score, status, and core hospitality KPIs. */
export function HotelHealth() {
  return (
    <Card title="Hotel Health Score">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StatusIndicator status={HOTEL_HEALTH.status} />
          <div className="text-right">
            <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
              Health Score
            </p>
            <p className="text-2xl font-semibold tracking-tight text-white">
              {HOTEL_HEALTH.score}/100
            </p>
          </div>
        </div>
        <p className="text-sm font-light text-white/55">{HOTEL_HEALTH.property}</p>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
          {HOTEL_KPIS.map((metric) => (
            <StatCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </div>
    </Card>
  );
}
