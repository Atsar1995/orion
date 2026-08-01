import type { BreadcrumbItem } from "@/lib/navigation/NavigationItem";
import type { NavigationRegistry } from "@/lib/navigation/NavigationRegistry";
import { defaultNavigationRegistry } from "@/lib/navigation/NavigationRegistry";

const ROOT_BREADCRUMB: BreadcrumbItem = {
  label: "Morning Brief",
  href: "/brief",
};

/** Builds a deterministic breadcrumb trail from a pathname. */
export function buildBreadcrumbs(
  pathname: string,
  registry: NavigationRegistry = defaultNavigationRegistry,
): readonly BreadcrumbItem[] {
  const normalized = normalizePath(pathname);

  if (normalized === ROOT_BREADCRUMB.href) {
    return [ROOT_BREADCRUMB];
  }

  const segments = normalized.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [ROOT_BREADCRUMB];
  }

  const crumbs: BreadcrumbItem[] = [ROOT_BREADCRUMB];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const route = registry.findRouteByHref(currentPath);

    const label =
      route && currentPath === route.href ? route.label : formatSegmentLabel(segment);

    crumbs.push({
      label,
      href: currentPath,
    });
  }

  return crumbs;
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function formatSegmentLabel(segment: string): string {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
