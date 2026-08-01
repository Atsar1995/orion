/** Finance workspace module constants (Mission P-009.1). */

export const FINANCE_IIL_SERVICE_ID = "finance-workspace" as const;

export const FINANCE_WORKSPACE_ID = "finance" as const;

export const FINANCE_MODULE_KEY = "finance" as const;

export const FINANCE_PROVIDER_ID = "finance" as const;

export const FINANCE_WORKSPACE_LABEL = "Finance" as const;

export const FINANCE_BASE_PATH = "/finance" as const;

export const FINANCE_MISSION_FOUNDATION = "P-009.1" as const;

export const FINANCE_MISSION_CHART_OF_ACCOUNTS = "P-009.2" as const;

export const FINANCE_MISSION_GENERAL_LEDGER = "P-009.3" as const;

export const FINANCE_MISSION_FISCAL_PERIOD = "P-009.5" as const;

export const FINANCE_MISSION_EVENT_PIPELINE = "P-009.6" as const;

export const FINANCE_MISSION_EXECUTIVE_INTELLIGENCE = "P-009.7" as const;

/** Route permission metadata — enforced when RBAC ships (ES-009). */
export const FINANCE_ROUTE_PERMISSIONS = {
  overview: { action: "read" as const },
  cash: { action: "read" as const },
  revenue: { action: "read" as const },
  expenses: { action: "read" as const },
  receivables: { action: "read" as const },
  payables: { action: "read" as const },
  forecast: { action: "read" as const },
  reports: { action: "read" as const },
  settings: { action: "write" as const },
} as const;

/** Authorized business event source services (D-008 §6). */
export const FINANCE_AUTHORIZED_EVENT_SOURCES = [
  "crm-workspace",
  "hospitality-workspace",
  "hr-workspace",
  "procurement-workspace",
  "inventory-workspace",
] as const;
