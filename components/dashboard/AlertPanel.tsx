import { AlertCard } from "@/components/dashboard/AlertCard";
import { ExecutiveCard } from "@/components/dashboard/ExecutiveCard";
import type { AlertPanelSnapshot } from "@/types/alerts";

type AlertPanelProps = {
  panel: AlertPanelSnapshot;
};

/** Executive alert panel — consumes Alert Service output only. */
export function AlertPanel({ panel }: AlertPanelProps) {
  return (
    <div className="space-y-[var(--orion-space-4)]">
      <div className="grid grid-cols-2 gap-[var(--orion-space-3)] md:grid-cols-4">
        <AlertCountCard label="Active" value={panel.counts.active} />
        <AlertCountCard label="Critical" value={panel.counts.critical} emphasis />
        <AlertCountCard label="Resolved" value={panel.counts.resolved} />
        <AlertCountCard label="Total" value={panel.counts.total} />
      </div>

      <ExecutiveCard title="Critical Alerts">
        {panel.critical.length > 0 ? (
          <ul className="grid grid-cols-1 gap-[var(--orion-space-3)] lg:grid-cols-2">
            {panel.critical.map((alert) => (
              <li key={alert.id}>
                <AlertCard alert={alert} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-light text-orion-muted">No critical alerts at this time.</p>
        )}
      </ExecutiveCard>

      <ExecutiveCard title="Recent Alerts">
        <ul className="grid grid-cols-1 gap-[var(--orion-space-3)] lg:grid-cols-3">
          {panel.recent.map((alert) => (
            <li key={alert.id}>
              <AlertCard alert={alert} />
            </li>
          ))}
        </ul>
      </ExecutiveCard>

      <ExecutiveCard title="Resolved Alerts">
        {panel.resolved.length > 0 ? (
          <ul className="grid grid-cols-1 gap-[var(--orion-space-3)] lg:grid-cols-2">
            {panel.resolved.map((alert) => (
              <li key={alert.id}>
                <AlertCard alert={alert} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-light text-orion-muted">No recently resolved alerts.</p>
        )}
      </ExecutiveCard>
    </div>
  );
}

function AlertCountCard({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: number;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-orion-md border border-orion-border bg-orion-surface p-[var(--orion-space-3)]">
      <p className="text-[10px] font-medium tracking-wide text-orion-muted uppercase">{label}</p>
      <p
        className={
          emphasis
            ? "mt-1 text-2xl font-medium tracking-tight text-red-300"
            : "mt-1 text-2xl font-medium tracking-tight text-orion-text"
        }
      >
        {value}
      </p>
    </div>
  );
}
