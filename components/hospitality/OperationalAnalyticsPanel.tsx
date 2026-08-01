import { Card } from "@/components/ui/Card";
import type { OperationalAnalyticsView } from "@/lib/hospitality/models/analytics";

type OperationalAnalyticsPanelProps = {
  readonly operational: OperationalAnalyticsView;
};

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** Operational analytics panel (Mission P-007.7). */
export function OperationalAnalyticsPanel({ operational }: OperationalAnalyticsPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Today's Operations">
        <dl className="space-y-2 text-sm text-white/70">
          <div className="flex justify-between"><dt>Arrivals</dt><dd>{operational.today.arrivals}</dd></div>
          <div className="flex justify-between"><dt>Departures</dt><dd>{operational.today.departures}</dd></div>
          <div className="flex justify-between"><dt>In-house</dt><dd>{operational.today.inHouse}</dd></div>
          <div className="flex justify-between"><dt>Revenue</dt><dd>{formatCurrency(operational.today.revenue)}</dd></div>
          <div className="flex justify-between"><dt>Outstanding folios</dt><dd>{operational.today.outstandingFolios}</dd></div>
        </dl>
      </Card>
      <Card title="Housekeeping Progress">
        <dl className="space-y-2 text-sm text-white/70">
          <div className="flex justify-between"><dt>Ready</dt><dd>{operational.housekeeping.readyRooms}</dd></div>
          <div className="flex justify-between"><dt>Awaiting cleaning</dt><dd>{operational.housekeeping.awaitingCleaning}</dd></div>
          <div className="flex justify-between"><dt>In progress</dt><dd>{operational.housekeeping.inProgress}</dd></div>
          <div className="flex justify-between"><dt>Progress</dt><dd>{operational.housekeeping.progressPercent}%</dd></div>
        </dl>
      </Card>
      <Card title="Maintenance">
        <dl className="space-y-2 text-sm text-white/70">
          <div className="flex justify-between"><dt>Backlog</dt><dd>{operational.maintenance.backlog}</dd></div>
          <div className="flex justify-between"><dt>Critical</dt><dd>{operational.maintenance.critical}</dd></div>
          <div className="flex justify-between"><dt>Preventive due</dt><dd>{operational.maintenance.preventiveDue}</dd></div>
        </dl>
      </Card>
      <Card title="Operational Rates">
        <dl className="space-y-2 text-sm text-white/70">
          <div className="flex justify-between"><dt>Arrival rate</dt><dd>{operational.rates.arrivalRate}%</dd></div>
          <div className="flex justify-between"><dt>Departure rate</dt><dd>{operational.rates.departureRate}%</dd></div>
          <div className="flex justify-between"><dt>Cancellation rate</dt><dd>{operational.rates.cancellationRate}%</dd></div>
          <div className="flex justify-between"><dt>No-show rate</dt><dd>{operational.rates.noShowRate}%</dd></div>
        </dl>
      </Card>
    </div>
  );
}
