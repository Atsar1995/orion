import type { ExecutiveAlert, ExecutiveAlertSignal } from "@/lib/alerts/models/Alert";
import { compareAlertSeverity } from "@/lib/alerts/models/AlertSeverity";

/** Ranks alert signals by severity, then recency, then identifier. */
export function prioritizeAlertSignals(
  signals: readonly ExecutiveAlertSignal[],
): ExecutiveAlertSignal[] {
  return [...signals].sort(compareAlertSignals);
}

/** Ranks executive alerts by severity, then recency, then identifier. */
export function prioritizeExecutiveAlerts(alerts: readonly ExecutiveAlert[]): ExecutiveAlert[] {
  return [...alerts].sort(compareExecutiveAlerts);
}

function compareAlertSignals(left: ExecutiveAlertSignal, right: ExecutiveAlertSignal): number {
  const severityDelta = compareAlertSeverity(left.severity, right.severity);

  if (severityDelta !== 0) {
    return severityDelta;
  }

  const recencyDelta = right.createdAt.localeCompare(left.createdAt);

  if (recencyDelta !== 0) {
    return recencyDelta;
  }

  return left.id.localeCompare(right.id);
}

function compareExecutiveAlerts(left: ExecutiveAlert, right: ExecutiveAlert): number {
  const severityDelta = compareAlertSeverity(left.severity, right.severity);

  if (severityDelta !== 0) {
    return severityDelta;
  }

  const recencyDelta = right.createdAt.localeCompare(left.createdAt);

  if (recencyDelta !== 0) {
    return recencyDelta;
  }

  return left.id.localeCompare(right.id);
}
