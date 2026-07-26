import type { NavigationSectionId } from "@/lib/navigation/RouteDefinition";
import type { NavigationItem } from "@/lib/navigation/NavigationItem";

/** Grouped navigation section for sidebar rendering. */
export type NavigationSection = {
  readonly id: NavigationSectionId;
  readonly label?: string;
  readonly items: readonly NavigationItem[];
};

/** Executive intelligence layer — founder daily briefing surfaces. */
export const executiveNav: NavigationItem[] = [
  { label: "Executive Brief", href: "/brief", icon: "advisor" },
  { label: "Command Center", href: "/command-center", icon: "command-center" },
  { label: "Mission Control", href: "/mission-control", icon: "mission-control" },
];

export const primaryNav: NavigationItem[] = [
  { label: "Intelligence", href: "/intelligence", icon: "intelligence" },
  { label: "Engineering", href: "/engineering", icon: "engineering" },
  { label: "Configuration", href: "/configuration", icon: "configuration" },
  { label: "Tasks", href: "/tasks", icon: "tasks" },
  { label: "Calendar", href: "/calendar", icon: "calendar" },
  { label: "Messages", href: "/messages", icon: "messages" },
];

export const moduleNav: NavigationItem[] = [
  { label: "Hospitality", href: "/hospitality", icon: "hospitality" },
  { label: "Marketing", href: "/marketing", icon: "marketing" },
  { label: "Commerce", href: "/commerce", icon: "commerce" },
  { label: "CRM", href: "/crm", icon: "crm" },
  { label: "Finance", href: "/finance", icon: "finance" },
  { label: "Knowledge Vault", href: "/knowledge", icon: "knowledge" },
  { label: "Integrations", href: "/integrations", icon: "integrations" },
];

export const utilityNav: NavigationItem[] = [
  { label: "Settings", href: "/settings", icon: "settings" },
];

/** Default navigation sections for the executive platform shell. */
export const DEFAULT_NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  { id: "executive", label: "Executive", items: executiveNav },
  { id: "primary", label: "Platform", items: primaryNav },
  { id: "modules", label: "Workspaces", items: moduleNav },
  { id: "utility", items: utilityNav },
];

/** Flat route lookup table for breadcrumb generation. */
export const ROUTE_DEFINITIONS = [
  ...executiveNav.map((item, index) => ({
    id: item.href,
    label: item.label,
    href: item.href,
    icon: item.icon,
    section: "executive" as const,
    order: index,
  })),
  ...primaryNav.map((item, index) => ({
    id: item.href,
    label: item.label,
    href: item.href,
    icon: item.icon,
    section: "primary" as const,
    order: index,
  })),
  ...moduleNav.map((item, index) => ({
    id: item.href,
    label: item.label,
    href: item.href,
    icon: item.icon,
    section: "modules" as const,
    order: index,
  })),
  ...utilityNav.map((item, index) => ({
    id: item.href,
    label: item.label,
    href: item.href,
    icon: item.icon,
    section: "utility" as const,
    order: index,
  })),
] as const;
