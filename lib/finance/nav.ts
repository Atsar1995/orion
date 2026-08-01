import type { WorkspaceNavItem } from "@/lib/workspace-nav";
import { FINANCE_BASE_PATH, FINANCE_ROUTE_PERMISSIONS } from "@/lib/finance/constants";

export type FinanceNavItem = WorkspaceNavItem & {
  permission?: { action: "read" | "write" };
};

/** Finance workspace sub-navigation (Mission P-009.1). */
export const FINANCE_NAV: FinanceNavItem[] = [
  { label: "Overview", href: FINANCE_BASE_PATH, permission: FINANCE_ROUTE_PERMISSIONS.overview },
  { label: "Cash", href: "/finance/cash", permission: FINANCE_ROUTE_PERMISSIONS.cash },
  { label: "Revenue", href: "/finance/revenue", permission: FINANCE_ROUTE_PERMISSIONS.revenue },
  { label: "Expenses", href: "/finance/expenses", permission: FINANCE_ROUTE_PERMISSIONS.expenses },
  {
    label: "Receivables",
    href: "/finance/receivables",
    permission: FINANCE_ROUTE_PERMISSIONS.receivables,
  },
  { label: "Payables", href: "/finance/payables", permission: FINANCE_ROUTE_PERMISSIONS.payables },
  { label: "Forecast", href: "/finance/forecast", permission: FINANCE_ROUTE_PERMISSIONS.forecast },
  { label: "Reports", href: "/finance/reports", permission: FINANCE_ROUTE_PERMISSIONS.reports },
  { label: "Settings", href: "/finance/settings", permission: FINANCE_ROUTE_PERMISSIONS.settings },
];

export { FINANCE_BASE_PATH };
