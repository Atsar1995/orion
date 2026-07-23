import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { BOOKING_PERFORMANCE } from "@/lib/hospitality-data";

/** Booking pace, forecast, and reservation activity. */
export function BookingPerformance() {
  return (
    <Card title="Booking Performance">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
        {BOOKING_PERFORMANCE.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
    </Card>
  );
}
