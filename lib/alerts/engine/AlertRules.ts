import type { AlertCategory } from "@/lib/alerts/models/AlertCategory";
import type { AlertSeverity } from "@/lib/alerts/models/AlertSeverity";
import type { AlertSource } from "@/lib/alerts/models/AlertSource";

/** Static alert rule metadata for EP-003 deterministic processing. */
export type ExecutiveAlertRule = {
  readonly id: string;
  readonly name: string;
  readonly category: AlertCategory;
  readonly severity: AlertSeverity;
  readonly source: AlertSource;
  readonly workspace: string;
  readonly dedupeKey: string;
  readonly title: string;
  readonly messageTemplate: string;
};

/** Default EP-003 alert rules — configuration only, no provider evaluation. */
export const DEFAULT_EXECUTIVE_ALERT_RULES: readonly ExecutiveAlertRule[] = [
  {
    id: "rule-guest-escalation",
    name: "Guest Escalation",
    category: "hospitality",
    severity: "critical",
    source: "platform",
    workspace: "Hospitality",
    dedupeKey: "guest-complaint-room-305",
    title: "Guest complaint awaiting response",
    messageTemplate: "Room 305 complaint requires executive attention before noon.",
  },
  {
    id: "rule-marketing-roas",
    name: "Marketing ROAS Threshold",
    category: "marketing",
    severity: "high",
    source: "rule",
    workspace: "Marketing",
    dedupeKey: "marketing-roas-below-target",
    title: "Meta campaign ROAS below target",
    messageTemplate: "Meta campaign ROAS has remained below target for 48 hours.",
  },
  {
    id: "rule-finance-close",
    name: "Finance Close Reminder",
    category: "finance",
    severity: "medium",
    source: "event",
    workspace: "Finance",
    dedupeKey: "finance-week-close",
    title: "Week-close adjustments pending approval",
    messageTemplate: "Finance week-close adjustments are waiting for executive approval.",
  },
  {
    id: "rule-crm-follow-up",
    name: "CRM Follow-up",
    category: "crm",
    severity: "low",
    source: "provider",
    workspace: "CRM",
    dedupeKey: "crm-vip-follow-up",
    title: "VIP follow-up due today",
    messageTemplate: "Two VIP accounts require follow-up before end of day.",
  },
  {
    id: "rule-platform-sync",
    name: "Platform Sync Notice",
    category: "operations",
    severity: "information",
    source: "platform",
    workspace: "Platform",
    dedupeKey: "platform-sync-complete",
    title: "Nightly sync completed",
    messageTemplate: "All registered workspace providers completed the nightly sync.",
  },
] as const;

/** Finds a configured alert rule by identifier. */
export function findExecutiveAlertRule(ruleId: string): ExecutiveAlertRule | undefined {
  return DEFAULT_EXECUTIVE_ALERT_RULES.find((rule) => rule.id === ruleId);
}
