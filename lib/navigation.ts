export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
};

export type NavIcon =
  | "advisor"
  | "command-center"
  | "mission-control"
  | "engineering"
  | "configuration"
  | "intelligence"
  | "tasks"
  | "calendar"
  | "messages"
  | "hospitality"
  | "commerce"
  | "marketing"
  | "crm"
  | "finance"
  | "knowledge"
  | "integrations"
  | "settings";

/** Executive intelligence layer — founder daily briefing surfaces. */
export const executiveNav: NavItem[] = [
  { label: "ORION Advisor", href: "/advisor", icon: "advisor" },
  { label: "Command Center", href: "/command-center", icon: "command-center" },
  { label: "Mission Control", href: "/", icon: "mission-control" },
];

export const primaryNav: NavItem[] = [
  { label: "Intelligence", href: "/intelligence", icon: "intelligence" },
  { label: "Engineering", href: "/engineering", icon: "engineering" },
  { label: "Configuration", href: "/configuration", icon: "configuration" },
  { label: "Tasks", href: "/tasks", icon: "tasks" },
  { label: "Calendar", href: "/calendar", icon: "calendar" },
  { label: "Messages", href: "/messages", icon: "messages" },
];

export const moduleNav: NavItem[] = [
  { label: "Hospitality", href: "/hospitality", icon: "hospitality" },
  { label: "Marketing", href: "/marketing", icon: "marketing" },
  { label: "Commerce", href: "/commerce", icon: "commerce" },
  { label: "CRM", href: "/crm", icon: "crm" },
  { label: "Finance", href: "/finance", icon: "finance" },
  { label: "Knowledge Vault", href: "/knowledge", icon: "knowledge" },
  { label: "Integrations", href: "/integrations", icon: "integrations" },
];

export const utilityNav: NavItem[] = [
  { label: "Settings", href: "/settings", icon: "settings" },
];
