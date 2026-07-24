import type { WorkspaceNavItem } from "@/lib/workspace-nav";

export type FinanceNavItem = WorkspaceNavItem;

/** Finance workspace sub-navigation. Overview lives at `/finance`. */
export const FINANCE_NAV: FinanceNavItem[] = [
  { label: "Overview", href: "/finance" },
  { label: "Cash", href: "/finance/cash" },
  { label: "Revenue", href: "/finance/revenue" },
  { label: "Expenses", href: "/finance/expenses" },
  { label: "Receivables", href: "/finance/receivables" },
  { label: "Payables", href: "/finance/payables" },
  { label: "Forecast", href: "/finance/forecast" },
  { label: "Reports", href: "/finance/reports" },
  { label: "Settings", href: "/finance/settings" },
];
