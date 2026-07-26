/** Business domain category for executive alerts. */
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

/** Ordered categories for deterministic filter rendering. */
export const ALERT_CATEGORY_ORDER: readonly AlertCategory[] = [
  "hospitality",
  "finance",
  "revenue",
  "operations",
  "crm",
  "marketing",
  "commerce",
  "compliance",
  "infrastructure",
  "security",
] as const;

const CATEGORY_LABEL: Record<AlertCategory, string> = {
  revenue: "Revenue",
  finance: "Finance",
  operations: "Operations",
  hospitality: "Hospitality",
  crm: "CRM",
  marketing: "Marketing",
  commerce: "Commerce",
  compliance: "Compliance",
  infrastructure: "Infrastructure",
  security: "Security",
};

/** Human-readable category label. */
export function formatAlertCategory(category: AlertCategory): string {
  return CATEGORY_LABEL[category];
}
