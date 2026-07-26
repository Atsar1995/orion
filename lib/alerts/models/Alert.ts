import type { AlertCategory } from "@/lib/alerts/models/AlertCategory";
import type { AlertSeverity } from "@/lib/alerts/models/AlertSeverity";
import type { AlertSource } from "@/lib/alerts/models/AlertSource";
import type { AlertStatus } from "@/lib/alerts/models/AlertStatus";

/** Executive alert record for the notification center. */
export type ExecutiveAlert = {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly severity: AlertSeverity;
  readonly category: AlertCategory;
  readonly source: AlertSource;
  readonly status: AlertStatus;
  readonly workspace: string;
  readonly dedupeKey: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Incoming alert signal before engine normalization. */
export type ExecutiveAlertSignal = {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly severity: AlertSeverity;
  readonly category: AlertCategory;
  readonly source: AlertSource;
  readonly status: AlertStatus;
  readonly workspace: string;
  readonly dedupeKey: string;
  readonly createdAt: string;
};

/** Count summary for the executive alert center. */
export type AlertCenterCounts = {
  readonly total: number;
  readonly active: number;
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
  readonly low: number;
  readonly information: number;
  readonly resolved: number;
  readonly escalated: number;
};

/** Processed snapshot consumed by the alert center UI. */
export type AlertCenterSnapshot = {
  readonly generatedAt: string;
  readonly alerts: readonly ExecutiveAlert[];
  readonly counts: AlertCenterCounts;
};

/** Filter criteria for the alert center presentation layer. */
export type AlertCenterFilter = {
  readonly severity?: AlertSeverity | "all";
  readonly category?: AlertCategory | "all";
  readonly status?: AlertStatus | "all";
  readonly query?: string;
};

/** Applies deterministic filters to an alert center snapshot. */
export function filterAlerts(
  alerts: readonly ExecutiveAlert[],
  filter: AlertCenterFilter,
): ExecutiveAlert[] {
  const query = filter.query?.trim().toLowerCase() ?? "";

  return alerts.filter((alert) => {
    if (filter.severity && filter.severity !== "all" && alert.severity !== filter.severity) {
      return false;
    }

    if (filter.category && filter.category !== "all" && alert.category !== filter.category) {
      return false;
    }

    if (filter.status && filter.status !== "all" && alert.status !== filter.status) {
      return false;
    }

    if (query.length > 0) {
      const haystack = `${alert.title} ${alert.message} ${alert.workspace}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    return true;
  });
}

/** Computes alert counts from a list of executive alerts. */
export function buildAlertCenterCounts(alerts: readonly ExecutiveAlert[]): AlertCenterCounts {
  return alerts.reduce<AlertCenterCounts>(
    (counts, alert) => ({
      total: counts.total + 1,
      active: counts.active + (alert.status === "active" ? 1 : 0),
      critical: counts.critical + (alert.severity === "critical" ? 1 : 0),
      high: counts.high + (alert.severity === "high" ? 1 : 0),
      medium: counts.medium + (alert.severity === "medium" ? 1 : 0),
      low: counts.low + (alert.severity === "low" ? 1 : 0),
      information: counts.information + (alert.severity === "information" ? 1 : 0),
      resolved: counts.resolved + (alert.status === "resolved" ? 1 : 0),
      escalated: counts.escalated + (alert.status === "escalated" ? 1 : 0),
    }),
    {
      total: 0,
      active: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      information: 0,
      resolved: 0,
      escalated: 0,
    },
  );
}
