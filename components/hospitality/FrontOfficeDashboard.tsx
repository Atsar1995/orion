import { Card } from "@/components/ui/Card";
import type { FrontOfficeDashboardView } from "@/lib/hospitality/models/front-office";

type FrontOfficeDashboardProps = {
  readonly dashboard: FrontOfficeDashboardView;
};

/** Front office operational dashboard (Mission P-007.4). */
export function FrontOfficeDashboard({ dashboard }: FrontOfficeDashboardProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card title="Occupancy">
        <p className="text-2xl font-semibold text-orion-gold">{dashboard.occupancy.percent}%</p>
        <p className="mt-1 text-sm text-white/45">{dashboard.occupancy.inHouse} in-house / {dashboard.occupancy.totalRooms} rooms</p>
      </Card>
      <Card title="Today's Arrivals">
        <p className="text-2xl font-semibold text-orion-gold">{dashboard.today.arrivals}</p>
        <p className="mt-1 text-sm text-white/45">{dashboard.today.vipArrivals} VIP · {dashboard.today.groupArrivals} group</p>
      </Card>
      <Card title="Departures">
        <p className="text-2xl font-semibold text-orion-gold">{dashboard.today.departures}</p>
        <p className="mt-1 text-sm text-white/45">{dashboard.today.stayovers} stayovers</p>
      </Card>
      <Card title="Room Status">
        <p className="text-sm text-white/70">
          Clean {dashboard.occupancy.vacantClean} · Dirty {dashboard.occupancy.vacantDirty} · OOO {dashboard.occupancy.outOfOrder}
        </p>
      </Card>
    </div>
  );
}
