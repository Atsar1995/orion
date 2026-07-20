export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
};

export type NavIcon =
  | "mission-control"
  | "engineering"
  | "intelligence"
  | "tasks"
  | "calendar"
  | "messages"
  | "hotels"
  | "commerce"
  | "marketing"
  | "crm"
  | "finance"
  | "knowledge"
  | "integrations"
  | "settings";

export const primaryNav: NavItem[] = [
  { label: "Mission Control", href: "/", icon: "mission-control" },
  { label: "Engineering", href: "/engineering", icon: "engineering" },
  { label: "Intelligence", href: "/intelligence", icon: "intelligence" },
  { label: "Tasks", href: "/tasks", icon: "tasks" },
  { label: "Calendar", href: "/calendar", icon: "calendar" },
  { label: "Messages", href: "/messages", icon: "messages" },
];

export const moduleNav: NavItem[] = [
  { label: "Hotels", href: "/hotels", icon: "hotels" },
  { label: "Commerce", href: "/commerce", icon: "commerce" },
  { label: "Marketing", href: "/marketing", icon: "marketing" },
  { label: "CRM", href: "/crm", icon: "crm" },
  { label: "Finance", href: "/finance", icon: "finance" },
  { label: "Knowledge Vault", href: "/knowledge", icon: "knowledge" },
  { label: "Integrations", href: "/integrations", icon: "integrations" },
];

export const utilityNav: NavItem[] = [
  { label: "Settings", href: "/settings", icon: "settings" },
];
