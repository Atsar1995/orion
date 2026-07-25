/** Severity tier for executive alerts. */
export type AlertSeverity = "critical" | "high" | "medium" | "low" | "information";

/** Business domain category for an alert. */
export type AlertCategory =
  | "revenue"
  | "finance"
  | "operations"
  | "hospitality"
  | "crm"
  | "marketing"
  | "commerce"
  | "compliance"
  | "infrastructure"
  | "security";

/** Origin of an alert signal. */
export type AlertSource = "provider" | "rule" | "event" | "platform" | "escalation";

/** Lifecycle status of an alert. */
export type AlertStatus = "active" | "resolved" | "escalated";

/** Condition evaluated by the alert rule engine. */
export type AlertCondition = {
  field: string;
  operator: "equals" | "contains" | "lt" | "gt" | "exists";
  value?: string | number | boolean;
};

/** Incoming event from a provider or platform signal. */
export type AlertTrigger = {
  id: string;
  eventType: string;
  source: AlertSource;
  providerId?: string;
  workspace?: string;
  payload: Record<string, string>;
  occurredAt: string;
};

/** Configuration-driven alert rule definition. */
export type AlertRule = {
  id: string;
  name: string;
  enabled: boolean;
  category: AlertCategory;
  severity: AlertSeverity;
  eventType: string;
  conditions: AlertCondition[];
  title: string;
  messageTemplate: string;
  groupKey?: string;
  escalationHours?: number;
};

/** Suggested response action for an alert. */
export type AlertAction = {
  id: string;
  label: string;
  description: string;
};

/** Resolution metadata when an alert is closed. */
export type AlertResolution = {
  resolvedAt: string;
  resolvedBy?: string;
  note?: string;
};

/** Notification dispatch record. */
export type AlertNotification = {
  id: string;
  channel: "dashboard" | "email" | "push";
  dispatchedAt: string;
  status: "pending" | "sent" | "failed";
};

/** Structured alert output from the Alert Engine (ES-030). */
export type Alert = {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  category: AlertCategory;
  source: AlertSource;
  status: AlertStatus;
  trigger: AlertTrigger;
  groupId?: string;
  actions?: AlertAction[];
  resolution?: AlertResolution;
  notifications?: AlertNotification[];
  createdAt: string;
  updatedAt: string;
  escalatedAt?: string;
};

/** Group of related alerts. */
export type AlertGroup = {
  id: string;
  label: string;
  category: AlertCategory;
  alerts: Alert[];
};

/** Alert count summary for dashboard panels. */
export type AlertCounts = {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  information: number;
  active: number;
  resolved: number;
  escalated: number;
};

/** Full alert bundle returned by the Alert Engine. */
export type AlertBundle = {
  generatedAt: string;
  active: Alert[];
  critical: Alert[];
  recent: Alert[];
  resolved: Alert[];
  groups: AlertGroup[];
  counts: AlertCounts;
};

/** Dashboard alert panel payload. */
export type AlertPanelSnapshot = {
  critical: import("@/types/intelligence").Alert[];
  recent: import("@/types/intelligence").Alert[];
  resolved: import("@/types/intelligence").Alert[];
  counts: AlertCounts;
};

/** Event evaluation context assembled from intelligence inputs. */
export type AlertEvaluationContext = {
  contributions: import("@/types/providers").ProviderDashboardContribution[];
  trends: import("@/types/intelligence").Trend[];
  metrics: import("@/types/intelligence").ExecutiveMetricsBundle;
  businessHealth: import("@/types/intelligence").BusinessHealth;
};

/** Historical alert record entry. */
export type AlertHistoryEntry = {
  alertId: string;
  status: AlertStatus;
  severity: AlertSeverity;
  category: AlertCategory;
  recordedAt: string;
};
