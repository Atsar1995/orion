"use client";

import type { AlertCategory } from "@/lib/alerts/models/AlertCategory";
import { ALERT_CATEGORY_ORDER, formatAlertCategory } from "@/lib/alerts/models/AlertCategory";
import type { AlertSeverity } from "@/lib/alerts/models/AlertSeverity";
import { ALERT_SEVERITY_ORDER, formatAlertSeverity } from "@/lib/alerts/models/AlertSeverity";
import type { AlertStatus } from "@/lib/alerts/models/AlertStatus";
import { ALERT_STATUS_ORDER, formatAlertStatus } from "@/lib/alerts/models/AlertStatus";
import type { AlertCenterFilter } from "@/lib/alerts/models/Alert";

type AlertFilterProps = {
  value: AlertCenterFilter;
  onChange: (next: AlertCenterFilter) => void;
};

/** Filter controls for the executive alert center. */
export function AlertFilter({ value, onChange }: AlertFilterProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <label className="space-y-1">
        <span className="text-xs text-white/45">Severity</span>
        <select
          aria-label="Filter by severity"
          className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
          value={value.severity ?? "all"}
          onChange={(event) =>
            onChange({
              ...value,
              severity: event.target.value as AlertSeverity | "all",
            })
          }
        >
          <option value="all">All severities</option>
          {ALERT_SEVERITY_ORDER.map((severity) => (
            <option key={severity} value={severity}>
              {formatAlertSeverity(severity)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-xs text-white/45">Category</span>
        <select
          aria-label="Filter by category"
          className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
          value={value.category ?? "all"}
          onChange={(event) =>
            onChange({
              ...value,
              category: event.target.value as AlertCategory | "all",
            })
          }
        >
          <option value="all">All categories</option>
          {ALERT_CATEGORY_ORDER.map((category) => (
            <option key={category} value={category}>
              {formatAlertCategory(category)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-xs text-white/45">Status</span>
        <select
          aria-label="Filter by status"
          className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
          value={value.status ?? "all"}
          onChange={(event) =>
            onChange({
              ...value,
              status: event.target.value as AlertStatus | "all",
            })
          }
        >
          <option value="all">All statuses</option>
          {ALERT_STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {formatAlertStatus(status)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="text-xs text-white/45">Search</span>
        <input
          aria-label="Search alerts"
          className="w-full rounded-orion-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-white/85"
          placeholder="Search title or message"
          value={value.query ?? ""}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
        />
      </label>
    </div>
  );
}
