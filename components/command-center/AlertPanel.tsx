import { AlertCard } from "@/components/dashboard/AlertCard";
import { filterAlertsBySeverity } from "@/lib/command-center/snapshot-view";
import type { DashboardSnapshot } from "@/types/intelligence";
import { Card } from "@/components/ui/Card";

type AlertPanelProps = {
  snapshot: DashboardSnapshot;
};

/** Alert Center — critical, high, medium, and resolved tiers from orchestrator snapshot. */
export function AlertPanel({ snapshot }: AlertPanelProps) {
  const { alertPanel } = snapshot;
  const highAlerts = filterAlertsBySeverity(alertPanel.recent, "attention");
  const mediumAlerts = alertPanel.recent.filter(
    (alert) => alert.severity === "healthy" && alert.category === "operational",
  );

  return (
    <div className="space-y-[var(--orion-space-4)]">
      <div className="grid grid-cols-2 gap-[var(--orion-space-3)] md:grid-cols-4">
        <AlertTierCount label="Critical" value={alertPanel.counts.critical} emphasis />
        <AlertTierCount label="High" value={alertPanel.counts.high || highAlerts.length} />
        <AlertTierCount label="Medium" value={alertPanel.counts.medium || mediumAlerts.length} />
        <AlertTierCount label="Resolved" value={alertPanel.counts.resolved} />
      </div>

      <Card title="Alert Center">
        <AlertTierSection title="Critical" alerts={alertPanel.critical} empty="No critical alerts." />
        <AlertTierSection title="High" alerts={highAlerts} empty="No high-priority alerts." />
        <AlertTierSection title="Medium" alerts={mediumAlerts} empty="No medium-priority alerts." />
        <AlertTierSection
          title="Resolved"
          alerts={alertPanel.resolved}
          empty="No recently resolved alerts."
        />
      </Card>
    </div>
  );
}

function AlertTierCount({
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

function AlertTierSection({
  title,
  alerts,
  empty,
}: {
  title: string;
  alerts: DashboardSnapshot["alerts"];
  empty: string;
}) {
  return (
    <section aria-label={title} className="border-t border-orion-border py-4 first:border-t-0 first:pt-0">
      <h4 className="mb-3 text-[11px] font-medium tracking-[0.14em] text-orion-gold/80 uppercase">
        {title}
      </h4>
      {alerts.length > 0 ? (
        <ul className="grid grid-cols-1 gap-[var(--orion-space-3)] lg:grid-cols-2">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <AlertCard alert={alert} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm font-light text-orion-muted">{empty}</p>
      )}
    </section>
  );
}
