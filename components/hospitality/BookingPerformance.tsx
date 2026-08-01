import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { BOOKING_PERFORMANCE } from "@/lib/hospitality-data";

type BookingPerformanceProps = {
  metrics?: readonly { label: string; value: string }[];
};

/** Booking pace and forecast metrics. */
export function BookingPerformance({ metrics = BOOKING_PERFORMANCE }: BookingPerformanceProps) {
  return (
    <Card title="Booking Performance">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
    </Card>
  );
}
