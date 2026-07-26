/** Severity tier for executive notification center alerts. */
export type AlertSeverity = "critical" | "high" | "medium" | "low" | "information";

/** Severity ordering weight — higher values sort first. */
export const ALERT_SEVERITY_WEIGHT: Record<AlertSeverity, number> = {
  critical: 500,
  high: 400,
  medium: 300,
  low: 200,
  information: 100,
} as const;

/** Ordered severity tiers for deterministic sorting and filters. */
export const ALERT_SEVERITY_ORDER: readonly AlertSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "information",
] as const;

/** Compares two severities — negative when left is higher priority. */
export function compareAlertSeverity(left: AlertSeverity, right: AlertSeverity): number {
  return ALERT_SEVERITY_WEIGHT[right] - ALERT_SEVERITY_WEIGHT[left];
}

/** Human-readable severity label. */
export function formatAlertSeverity(severity: AlertSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}
