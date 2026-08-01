import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { HOTEL_HEALTH, HOTEL_KPIS } from "@/lib/hospitality-data";

type HotelHealthProps = {
  health?: typeof HOTEL_HEALTH;
  kpis?: readonly { label: string; value: string }[];
};

/** Hotel health score, status, and core hospitality KPIs. */
export function HotelHealth({
  health = HOTEL_HEALTH,
  kpis = HOTEL_KPIS,
}: HotelHealthProps) {
  return (
    <Card title="Hotel Health Score">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StatusIndicator status={health.status} />
          <div className="text-right">
            <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
              Health Score
            </p>
            <p className="text-2xl font-semibold tracking-tight text-white">
              {health.score}/100
            </p>
          </div>
        </div>
        <p className="text-sm font-light text-white/55">{health.property}</p>
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
          {kpis.map((metric) => (
            <StatCard key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </div>
    </Card>
  );
}
