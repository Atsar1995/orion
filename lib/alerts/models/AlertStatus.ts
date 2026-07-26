/** Lifecycle status for executive alerts. */
export type AlertStatus = "active" | "resolved" | "escalated";

/** Ordered statuses for deterministic filter rendering. */
export const ALERT_STATUS_ORDER: readonly AlertStatus[] = [
  "active",
  "escalated",
  "resolved",
] as const;

const STATUS_LABEL: Record<AlertStatus, string> = {
  active: "Active",
  escalated: "Escalated",
  resolved: "Resolved",
};

/** Human-readable alert status label. */
export function formatAlertStatus(status: AlertStatus): string {
  return STATUS_LABEL[status];
}
