import { AlertCard } from "@/components/alerts/AlertCard";
import { AlertEmptyState } from "@/components/alerts/AlertEmptyState";
import type { ExecutiveAlert } from "@/lib/alerts/models/Alert";

type AlertListProps = {
  alerts: readonly ExecutiveAlert[];
};

/** Renders a list of executive alerts or the empty state. */
export function AlertList({ alerts }: AlertListProps) {
  if (alerts.length === 0) {
    return <AlertEmptyState />;
  }

  return (
    <ul className="space-y-3" aria-label="Executive alerts">
      {alerts.map((alert) => (
        <li key={alert.id}>
          <AlertCard alert={alert} />
        </li>
      ))}
    </ul>
  );
}
