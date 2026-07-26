"use client";

import { useMemo, useState } from "react";
import { AlertBadge } from "@/components/alerts/AlertBadge";
import { AlertFilter } from "@/components/alerts/AlertFilter";
import { AlertList } from "@/components/alerts/AlertList";
import type { AlertCenterFilter, AlertCenterSnapshot } from "@/lib/alerts/models/Alert";
import { filterAlerts } from "@/lib/alerts/models/Alert";
import { ALERT_SEVERITY_ORDER } from "@/lib/alerts/models/AlertSeverity";

type AlertCenterProps = {
  snapshot: AlertCenterSnapshot;
};

const DEFAULT_FILTER: AlertCenterFilter = {
  severity: "all",
  category: "all",
  status: "all",
  query: "",
};

/** Centralized executive notification and alert center. */
export function AlertCenter({ snapshot }: AlertCenterProps) {
  const [filter, setFilter] = useState<AlertCenterFilter>(DEFAULT_FILTER);

  const filteredAlerts = useMemo(
    () => filterAlerts(snapshot.alerts, filter),
    [snapshot.alerts, filter],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {ALERT_SEVERITY_ORDER.map((severity) => {
          const count =
            severity === "information"
              ? snapshot.counts.information
              : snapshot.counts[severity];

          if (count === 0) {
            return null;
          }

          return <AlertBadge key={severity} severity={severity} count={count} />;
        })}
        <span className="text-xs text-white/45">
          {snapshot.counts.active} active · {snapshot.counts.total} total
        </span>
      </div>

      <AlertFilter value={filter} onChange={setFilter} />
      <AlertList alerts={filteredAlerts} />
    </div>
  );
}
