export type {
  BreadcrumbItem,
  NavIcon,
  NavItem,
  NavigationIcon,
  NavigationItem,
} from "@/lib/navigation/NavigationItem";
export type {
  NavigationSectionId,
  RouteDefinition,
} from "@/lib/navigation/RouteDefinition";
export { toNavigationItem } from "@/lib/navigation/RouteDefinition";
export {
  DEFAULT_NAVIGATION_SECTIONS,
  ROUTE_DEFINITIONS,
  executiveNav,
  moduleNav,
  primaryNav,
  utilityNav,
  type NavigationSection,
} from "@/lib/navigation/NavigationConfig";
export {
  NavigationRegistry,
  defaultNavigationRegistry,
} from "@/lib/navigation/NavigationRegistry";
export { buildBreadcrumbs } from "@/lib/navigation/BreadcrumbBuilder";
