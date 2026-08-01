"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { BriefAlert } from "@/types/executive";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type CriticalAlertsSectionProps = {
  alerts: BriefAlert[];
  className?: string;
  maxVisible?: number;
};

const SEVERITY_ORDER: Record<BriefAlert["severity"], number> = {
  critical: 0,
  attention: 1,
};

const SEVERITY_DOT: Record<BriefAlert["severity"], string> = {
  critical: "bg-red-400",
  attention: "bg-amber-400",
};

function sortAlerts(alerts: BriefAlert[]): BriefAlert[] {
  return [...alerts].sort(
    (left, right) => SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity],
  );
}

/** EC-001 critical alerts panel — must-see items requiring executive judgment. */
export function CriticalAlertsSection({
  alerts,
  className,
  maxVisible = 3,
}: CriticalAlertsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const sortedAlerts = useMemo(() => sortAlerts(alerts), [alerts]);
  const visibleAlerts = expanded ? sortedAlerts : sortedAlerts.slice(0, maxVisible);
  const hiddenCount = sortedAlerts.length - maxVisible;

  return (
    <Card
      title={`Requires Attention${alerts.length > 0 ? ` (${alerts.length})` : ""}`}
      className={className}
    >
      {alerts.length > 0 ? (
        <>
          <ul className="space-y-3">
            {visibleAlerts.map((alert) => (
              <li
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 rounded-orion-md border bg-orion-surface px-3 py-3",
                  alert.severity === "critical"
                    ? "border-red-400/25"
                    : "border-amber-400/20",
                )}
              >
                <span
                  aria-hidden
                  className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", SEVERITY_DOT[alert.severity])}
                />
                <div className="min-w-0 flex-1">
                  {alert.href ? (
                    <Link href={alert.href} className="block hover:opacity-90">
                      <p className="text-sm font-light leading-relaxed text-orion-text/90">
                        {alert.message}
                      </p>
                    </Link>
                  ) : (
                    <p className="text-sm font-light leading-relaxed text-orion-text/90">
                      {alert.message}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-2 text-[10px] font-medium tracking-wide text-orion-muted uppercase">
                    <span>{alert.category}</span>
                    {alert.ageLabel ? <span>{alert.ageLabel}</span> : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {hiddenCount > 0 ? (
            <button
              type="button"
              aria-expanded={expanded}
              className="mt-3 text-xs font-medium text-orion-gold/80 transition-colors hover:text-orion-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orion-gold/50"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? "Show fewer alerts" : `View all ${alerts.length} alerts`}
            </button>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="All clear"
          description="No critical alerts require your judgment right now."
        />
      )}
    </Card>
  );
}
