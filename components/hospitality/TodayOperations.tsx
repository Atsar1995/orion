import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { OPERATIONS_DETAIL, TODAY_OPERATIONS } from "@/lib/hospitality-data";

/** Today's operational snapshot for hotel teams and owners. */
export function TodayOperations() {
  return (
    <Card title="Today's Operations">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
          {TODAY_OPERATIONS.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
        <ul className="grid grid-cols-2 gap-3 text-sm font-light text-white/55 sm:grid-cols-3">
          <li>Rooms out of service: {OPERATIONS_DETAIL.roomsOutOfService}</li>
          <li>Staff on duty: {OPERATIONS_DETAIL.staffOnDuty}</li>
          <li>Repeat guests today: {OPERATIONS_DETAIL.repeatGuests}</li>
          <li>Early arrivals: {OPERATIONS_DETAIL.earlyArrivals}</li>
          <li>Late check-outs: {OPERATIONS_DETAIL.lateCheckouts}</li>
          <li>Open maintenance: {OPERATIONS_DETAIL.maintenanceRequests}</li>
        </ul>
      </div>
    </Card>
  );
}
