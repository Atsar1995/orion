import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { OPERATIONS_DETAIL, TODAY_OPERATIONS } from "@/lib/hospitality-data";

type TodayOperationsProps = {
  operations?: readonly { label: string; value: string }[];
  detail?: typeof OPERATIONS_DETAIL;
};

/** Today's operational snapshot for hotel teams and owners. */
export function TodayOperations({
  operations = TODAY_OPERATIONS,
  detail = OPERATIONS_DETAIL,
}: TodayOperationsProps) {
  return (
    <Card title="Today's Operations">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
          {operations.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
        <ul className="grid grid-cols-2 gap-3 text-sm font-light text-white/55 sm:grid-cols-3">
          <li>Rooms out of service: {detail.roomsOutOfService}</li>
          <li>Staff on duty: {detail.staffOnDuty}</li>
          <li>Repeat guests today: {detail.repeatGuests}</li>
          <li>Early arrivals: {detail.earlyArrivals}</li>
          <li>Late check-outs: {detail.lateCheckouts}</li>
          <li>Open maintenance: {detail.maintenanceRequests}</li>
        </ul>
      </div>
    </Card>
  );
}
