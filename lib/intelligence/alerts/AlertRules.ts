import type { AlertCategory, AlertRule, AlertSeverity } from "@/types/alerts";

export const ALERT_SEVERITIES: AlertSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "information",
];

export const ALERT_CATEGORIES: AlertCategory[] = [
  "revenue",
  "finance",
  "operations",
  "hospitality",
  "crm",
  "marketing",
  "commerce",
  "compliance",
  "infrastructure",
  "security",
];

/** Configuration-driven alert rules (ES-030). */
export const ALERT_RULES: AlertRule[] = [
  {
    id: "rule-revenue-drop",
    name: "Revenue Drop",
    enabled: true,
    category: "revenue",
    severity: "high",
    eventType: "revenue.drop",
    conditions: [{ field: "direction", operator: "equals", value: "down" }],
    title: "Revenue trend declining",
    messageTemplate: "Revenue dropped to {currentValue} from {previousValue} over {period}.",
    groupKey: "finance-signals",
    escalationHours: 4,
  },
  {
    id: "rule-occupancy-decline",
    name: "Occupancy Decline",
    enabled: true,
    category: "hospitality",
    severity: "high",
    eventType: "occupancy.decline",
    conditions: [{ field: "signal", operator: "contains", value: "occupancy" }],
    title: "Occupancy below target",
    messageTemplate: "{message}",
    groupKey: "hospitality-operations",
    escalationHours: 6,
  },
  {
    id: "rule-customer-trend-negative",
    name: "Negative Customer Trend",
    enabled: true,
    category: "crm",
    severity: "medium",
    eventType: "customer.trend.negative",
    conditions: [{ field: "workspace", operator: "equals", value: "CRM" }],
    title: "Customer engagement trend weakening",
    messageTemplate: "Pipeline value moved to {currentValue} from {previousValue}.",
    groupKey: "crm-signals",
  },
  {
    id: "rule-marketing-campaign-failure",
    name: "Marketing Campaign Failure",
    enabled: true,
    category: "marketing",
    severity: "high",
    eventType: "marketing.campaign.failure",
    conditions: [{ field: "direction", operator: "equals", value: "down" }],
    title: "Marketing campaign underperforming",
    messageTemplate: "ROAS declined to {currentValue} from {previousValue}.",
    groupKey: "marketing-signals",
    escalationHours: 8,
  },
  {
    id: "rule-inventory-warning",
    name: "Inventory Warning",
    enabled: true,
    category: "commerce",
    severity: "medium",
    eventType: "inventory.warning",
    conditions: [{ field: "level", operator: "equals", value: "low" }],
    title: "Inventory threshold warning",
    messageTemplate: "Catalogue SKU availability dropped below reorder threshold.",
    groupKey: "commerce-operations",
  },
  {
    id: "rule-payment-failure",
    name: "Payment Failure",
    enabled: true,
    category: "finance",
    severity: "high",
    eventType: "payment.failure",
    conditions: [{ field: "status", operator: "equals", value: "overdue" }],
    title: "Payment failure detected",
    messageTemplate: "{message}",
    groupKey: "finance-signals",
    escalationHours: 2,
  },
  {
    id: "rule-booking-cancellation-spike",
    name: "Booking Cancellation Spike",
    enabled: true,
    category: "hospitality",
    severity: "critical",
    eventType: "booking.cancellation.spike",
    conditions: [{ field: "change", operator: "contains", value: "+" }],
    title: "Booking cancellation spike",
    messageTemplate: "Cancellations increased {change} versus prior week.",
    groupKey: "hospitality-operations",
    escalationHours: 1,
  },
  {
    id: "rule-website-outage",
    name: "Website Outage",
    enabled: true,
    category: "infrastructure",
    severity: "critical",
    eventType: "website.outage",
    conditions: [{ field: "status", operator: "equals", value: "down" }],
    title: "Website availability degraded",
    messageTemplate: "Booking engine response time exceeded threshold — possible outage.",
    groupKey: "infrastructure",
    escalationHours: 1,
  },
  {
    id: "rule-guest-complaint",
    name: "Guest Complaint",
    enabled: true,
    category: "operations",
    severity: "critical",
    eventType: "guest.complaint",
    conditions: [{ field: "severity", operator: "equals", value: "critical" }],
    title: "Critical guest complaint",
    messageTemplate: "{message}",
    groupKey: "hospitality-operations",
    escalationHours: 1,
  },
  {
    id: "rule-contract-compliance",
    name: "Contract Compliance",
    enabled: true,
    category: "compliance",
    severity: "high",
    eventType: "contract.pending",
    conditions: [{ field: "message", operator: "contains", value: "contract" }],
    title: "Contract action required",
    messageTemplate: "{message}",
    groupKey: "compliance",
    escalationHours: 24,
  },
];

export function getEnabledAlertRules(): AlertRule[] {
  return ALERT_RULES.filter((rule) => rule.enabled);
}

export function getAlertRule(ruleId: string): AlertRule | undefined {
  return ALERT_RULES.find((rule) => rule.id === ruleId);
}

export function interpolateTemplate(
  template: string,
  payload: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => payload[key] ?? `{${key}}`);
}
