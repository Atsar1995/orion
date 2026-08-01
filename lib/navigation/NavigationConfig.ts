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
  { label: "Morning Brief", href: "/brief", icon: "advisor" },
  { label: "Executive Memory", href: "/memory", icon: "intelligence" },
  { label: "Decision Intelligence", href: "/decisions", icon: "intelligence" },
  { label: "Command Center", href: "/command-center", icon: "command-center" },
  { label: "Mission Control", href: "/mission-control", icon: "mission-control" },
];

export const primaryNav: NavigationItem[] = [
  { label: "Organization", href: "/organization", icon: "configuration" },
  { label: "Users", href: "/users", icon: "settings" },
  { label: "Roles", href: "/roles", icon: "settings" },
  { label: "Intelligence", href: "/intelligence", icon: "intelligence" },
  { label: "Integration Layer", href: "/intelligence/integration", icon: "integrations" },
  { label: "Engineering", href: "/engineering", icon: "engineering" },
  { label: "Configuration", href: "/configuration", icon: "configuration" },
];

export const comingSoonPrimaryNav: NavigationItem[] = [
  { label: "Tasks", href: "/tasks", icon: "tasks", availability: "coming-soon" },
  { label: "Calendar", href: "/calendar", icon: "calendar", availability: "coming-soon" },
  { label: "Messages", href: "/messages", icon: "messages", availability: "coming-soon" },
];

export const moduleNav: NavigationItem[] = [
  { label: "Hospitality", href: "/hospitality", icon: "hospitality" },
  { label: "Marketing", href: "/marketing", icon: "marketing" },
  { label: "CRM", href: "/crm", icon: "crm" },
  { label: "Finance", href: "/finance", icon: "finance" },
  { label: "Integrations", href: "/integrations", icon: "integrations" },
];

export const comingSoonModuleNav: NavigationItem[] = [
  { label: "Commerce", href: "/commerce", icon: "commerce", availability: "coming-soon" },
  { label: "Knowledge Vault", href: "/knowledge", icon: "knowledge", availability: "coming-soon" },
];

export const utilityNav: NavigationItem[] = [
  { label: "Settings", href: "/configuration", icon: "settings" },
];

/** Default navigation sections for the executive platform shell. */
export const DEFAULT_NAVIGATION_SECTIONS: readonly NavigationSection[] = [
  { id: "executive", label: "Daily Briefing", items: executiveNav },
  { id: "primary", label: "Platform", items: [...primaryNav, ...comingSoonPrimaryNav] },
  { id: "modules", label: "Workspaces", items: [...moduleNav, ...comingSoonModuleNav] },
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
