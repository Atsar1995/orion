import type { FinanceCapabilityDescriptor } from "@/types/finance-core";

/** Workspace foundation capabilities shipped in P-009.1. */
export const FINANCE_FOUNDATION_CAPABILITIES: readonly FinanceCapabilityDescriptor[] = [
  { key: "workspace", label: "Finance Workspace", status: "active", mission: "P-009.1" },
  { key: "validation", label: "Validation Framework", status: "active", mission: "P-009.1" },
  { key: "events", label: "Event Contracts", status: "active", mission: "P-009.1" },
  { key: "chart_of_accounts", label: "Chart of Accounts", status: "active", mission: "P-009.2" },
  { key: "general_ledger", label: "General Ledger", status: "active", mission: "P-009.3" },
  { key: "journal", label: "Journal Processing", status: "planned", mission: "P-009.4" },
  { key: "fiscal_period", label: "Fiscal Period Management", status: "active", mission: "P-009.5" },
  { key: "event_pipeline", label: "Financial Event Pipeline", status: "active", mission: "P-009.6" },
  { key: "executive_intelligence", label: "Executive Financial Intelligence", status: "active", mission: "P-009.7" },
  { key: "receivables", label: "Accounts Receivable", status: "planned", mission: "P-009.8" },
  { key: "payables", label: "Accounts Payable", status: "planned", mission: "P-009.8" },
  { key: "cash", label: "Cash Management", status: "planned", mission: "P-009.8" },
  { key: "budget", label: "Budgeting", status: "planned", mission: "P-009.9" },
  { key: "forecast", label: "Forecasting", status: "planned", mission: "P-009.9" },
  { key: "tax", label: "Tax Management", status: "planned", mission: "P-009.10" },
];
