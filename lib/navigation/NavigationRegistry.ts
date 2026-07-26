import {
  DEFAULT_NAVIGATION_SECTIONS,
  ROUTE_DEFINITIONS,
  type NavigationSection,
} from "@/lib/navigation/NavigationConfig";
import type { NavigationItem } from "@/lib/navigation/NavigationItem";
import type { RouteDefinition } from "@/lib/navigation/RouteDefinition";

/** Registry for executive platform navigation sections and routes. */
export class NavigationRegistry {
  private readonly sections: readonly NavigationSection[];
  private readonly routes: readonly RouteDefinition[];

  constructor(
    sections: readonly NavigationSection[] = DEFAULT_NAVIGATION_SECTIONS,
    routes: readonly RouteDefinition[] = ROUTE_DEFINITIONS,
  ) {
    this.sections = sections;
    this.routes = routes;
  }

  getSections(): readonly NavigationSection[] {
    return this.sections;
  }

  getRoutes(): readonly RouteDefinition[] {
    return this.routes;
  }

  findRouteByHref(href: string): RouteDefinition | undefined {
    const normalized = normalizePath(href);
    return [...this.routes]
      .sort((left, right) => right.href.length - left.href.length)
      .find((route) => normalized === route.href || normalized.startsWith(`${route.href}/`));
  }

  findItemByHref(href: string): NavigationItem | undefined {
    const route = this.findRouteByHref(href);
    if (!route) {
      return undefined;
    }

    return {
      label: route.label,
      href: route.href,
      icon: route.icon,
    };
  }
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export const defaultNavigationRegistry = new NavigationRegistry();
