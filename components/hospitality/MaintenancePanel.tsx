import { Card } from "@/components/ui/Card";
import type { MaintenanceDashboardView } from "@/lib/hospitality/models/housekeeping";

type MaintenancePanelProps = {
  readonly maintenance: MaintenanceDashboardView;
};

/** Maintenance backlog and work order panel (Mission P-007.5). */
export function MaintenancePanel({ maintenance }: MaintenancePanelProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card title="Backlog">
          <p className="text-2xl font-semibold text-orion-gold">{maintenance.backlog}</p>
        </Card>
        <Card title="Critical">
          <p className="text-2xl font-semibold text-orion-gold">{maintenance.critical}</p>
        </Card>
        <Card title="Preventive Due">
          <p className="text-2xl font-semibold text-orion-gold">{maintenance.preventiveDue}</p>
        </Card>
      </div>
      <Card title="Work Orders">
        <ul className="space-y-3">
          {maintenance.workOrders.map((request) => (
            <li
              key={request.id}
              className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-medium text-white/85">{request.title}</p>
                <span className="text-xs uppercase tracking-wide text-white/40">{request.priority}</span>
              </div>
              <p className="mt-1 text-xs text-white/45">
                {request.type} · {request.status}
                {request.roomLabel ? ` · ${request.roomLabel}` : ""}
              </p>
              <p className="mt-2 text-sm font-light text-white/60">{request.description}</p>
              {request.assignedTo ? (
                <p className="mt-2 text-xs text-white/35">Assigned: {request.assignedTo}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
