import type { NavigationIcon, NavigationItem } from "@/lib/navigation/NavigationItem";

/** Navigation section identifiers for registry grouping. */
export type NavigationSectionId = "executive" | "primary" | "modules" | "utility";

/** Route metadata used by navigation and breadcrumb builders. */
export type RouteDefinition = {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly icon: NavigationIcon;
  readonly section: NavigationSectionId;
  readonly order: number;
  readonly parentHref?: string;
};

/** Converts a route definition to a navigation item. */
export function toNavigationItem(route: RouteDefinition): NavigationItem {
  return {
    label: route.label,
    href: route.href,
    icon: route.icon,
  };
}
