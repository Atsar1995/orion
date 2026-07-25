import { EmptyState } from "@/components/ui/EmptyState";
import type { BriefAlert } from "@/types/executive";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type CriticalAlertsSectionProps = {
  alerts: BriefAlert[];
  className?: string;
};

const SEVERITY_DOT: Record<BriefAlert["severity"], string> = {
  critical: "bg-red-400",
  attention: "bg-amber-400",
};

/** EC-001 critical alerts panel — must-see items requiring executive judgment. */
export function CriticalAlertsSection({ alerts, className }: CriticalAlertsSectionProps) {
  return (
    <Card
      title={`Critical Alerts${alerts.length > 0 ? ` (${alerts.length})` : ""}`}
      className={className}
    >
      {alerts.length > 0 ? (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="flex items-start gap-3 rounded-orion-md border border-orion-border bg-orion-surface px-3 py-3"
            >
              <span
                aria-hidden
                className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", SEVERITY_DOT[alert.severity])}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-light leading-relaxed text-orion-text/90">
                  {alert.message}
                </p>
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                  <span>{alert.category}</span>
                  {alert.ageLabel ? <span>{alert.ageLabel}</span> : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="All clear"
          description="No critical alerts require your judgment right now."
        />
      )}
    </Card>
  );
}
