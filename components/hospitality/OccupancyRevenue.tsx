import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { OCCUPANCY_REVENUE } from "@/lib/hospitality-data";

type OccupancyRevenueProps = {
  metrics?: readonly { label: string; value: string }[];
};

/** Occupancy and revenue metrics at a glance. */
export function OccupancyRevenue({ metrics = OCCUPANCY_REVENUE }: OccupancyRevenueProps) {
  return (
    <Card title="Occupancy & Revenue">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
    </Card>
  );
}
