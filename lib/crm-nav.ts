import type { WorkspaceNavItem } from "@/lib/workspace-nav";

/** Customer Intelligence workspace sub-navigation. Overview lives at `/crm`. */
export const CRM_NAV: WorkspaceNavItem[] = [
  { label: "Overview", href: "/crm" },
  { label: "Customers", href: "/crm/customers" },
  { label: "Opportunities", href: "/crm/opportunities" },
  { label: "Relationships", href: "/crm/relationships" },
  { label: "Activity", href: "/crm/activity" },
  { label: "Communications", href: "/crm/communications" },
  { label: "Insights", href: "/crm/insights" },
  { label: "Reports", href: "/crm/reports" },
  { label: "Settings", href: "/crm/settings" },
];

export const CRM_BASE_PATH = "/crm";
