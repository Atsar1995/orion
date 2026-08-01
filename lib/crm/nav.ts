import type { WorkspaceNavItem } from "@/lib/workspace-nav";
import { CRM_BASE_PATH, CRM_ROUTE_PERMISSIONS } from "@/lib/crm/constants";

export type CrmNavItem = WorkspaceNavItem & {
  permission?: { action: "read" | "write" };
};

/** CRM workspace sub-navigation (Mission 16A.1 foundation). */
export const CRM_NAV: CrmNavItem[] = [
  { label: "Overview", href: CRM_BASE_PATH, permission: CRM_ROUTE_PERMISSIONS.overview },
  {
    label: "Executive",
    href: "/crm/executive",
    permission: CRM_ROUTE_PERMISSIONS.executive,
  },
  { label: "Customers", href: "/crm/customers", permission: CRM_ROUTE_PERMISSIONS.customers },
  { label: "Parties", href: "/crm/parties", permission: CRM_ROUTE_PERMISSIONS.parties },
  { label: "Companies", href: "/crm/companies", permission: CRM_ROUTE_PERMISSIONS.companies },
  {
    label: "Opportunities",
    href: "/crm/opportunities",
    permission: CRM_ROUTE_PERMISSIONS.opportunities,
  },
  { label: "Leads", href: "/crm/leads", permission: CRM_ROUTE_PERMISSIONS.leads },
  { label: "Forecast", href: "/crm/forecast", permission: CRM_ROUTE_PERMISSIONS.forecast },
  { label: "Proposals", href: "/crm/proposals", permission: CRM_ROUTE_PERMISSIONS.proposals },
  { label: "Contracts", href: "/crm/contracts", permission: CRM_ROUTE_PERMISSIONS.contracts },
  {
    label: "Rate Agreements",
    href: "/crm/rate-agreements",
    permission: CRM_ROUTE_PERMISSIONS.rateAgreements,
  },
  { label: "Renewals", href: "/crm/renewals", permission: CRM_ROUTE_PERMISSIONS.renewals },
  { label: "Analytics", href: "/crm/analytics", permission: CRM_ROUTE_PERMISSIONS.analytics },
  {
    label: "Customer Analytics",
    href: "/crm/customer-analytics",
    permission: CRM_ROUTE_PERMISSIONS.customerAnalytics,
  },
  { label: "Activities", href: "/crm/activities", permission: CRM_ROUTE_PERMISSIONS.activities },
  { label: "Insights", href: "/crm/insights", permission: CRM_ROUTE_PERMISSIONS.insights },
];

export { CRM_BASE_PATH };
