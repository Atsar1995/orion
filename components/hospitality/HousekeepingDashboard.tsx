import { Card } from "@/components/ui/Card";
import type { HousekeepingDashboardView } from "@/lib/hospitality/models/housekeeping";

type HousekeepingDashboardProps = {
  readonly dashboard: HousekeepingDashboardView;
};

/** Housekeeping operational summary (Mission P-007.5). */
export function HousekeepingDashboard({ dashboard }: HousekeepingDashboardProps) {
  const { summary } = dashboard;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <Card title="Ready Rooms">
        <p className="text-2xl font-semibold text-orion-gold">{summary.readyRooms}</p>
        <p className="mt-1 text-sm text-white/45">Vacant clean & inspected</p>
      </Card>
      <Card title="Awaiting Cleaning">
        <p className="text-2xl font-semibold text-orion-gold">{summary.awaitingCleaning}</p>
        <p className="mt-1 text-sm text-white/45">Pending assignment</p>
      </Card>
      <Card title="In Progress">
        <p className="text-2xl font-semibold text-orion-gold">{summary.inProgress}</p>
        <p className="mt-1 text-sm text-white/45">Active cleaning</p>
      </Card>
      <Card title="Inspection Pending">
        <p className="text-2xl font-semibold text-orion-gold">{summary.inspectionPending}</p>
        <p className="mt-1 text-sm text-white/45">Awaiting supervisor sign-off</p>
      </Card>
      <Card title="Under Maintenance">
        <p className="text-2xl font-semibold text-orion-gold">{summary.underMaintenance}</p>
        <p className="mt-1 text-sm text-white/45">Blocked or engineering hold</p>
      </Card>
    </div>
  );
}
