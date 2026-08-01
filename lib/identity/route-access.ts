import { canAccess } from "@/lib/auth/permissions";
import type { RoleSlug } from "@/types/auth";
import type { Permission } from "@/types/auth";

type RouteAccessRule = {
  prefix: string;
  module: string;
  action?: string;
  roles?: RoleSlug[];
};

/** Longest-prefix route access rules for RBAC enforcement (Mission S1A). */
export const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  { prefix: "/roles", module: "users", action: "read", roles: ["super_admin", "organization_admin"] },
  { prefix: "/users", module: "users", action: "read", roles: ["super_admin", "organization_admin"] },
  { prefix: "/organization", module: "executive", action: "read" },
  { prefix: "/engineering", module: "engineering", action: "read", roles: ["super_admin"] },
  { prefix: "/configuration", module: "settings", action: "read" },
  { prefix: "/profile/security", module: "settings", action: "read" },
  { prefix: "/profile", module: "executive", action: "read" },
  { prefix: "/crm", module: "crm", action: "read" },
  { prefix: "/finance", module: "finance", action: "read" },
  { prefix: "/hospitality", module: "hospitality", action: "read" },
  { prefix: "/marketing", module: "marketing", action: "read" },
  { prefix: "/integrations", module: "integrations", action: "read" },
  { prefix: "/intelligence", module: "intelligence", action: "read" },
  { prefix: "/mission-control", module: "mission-control", action: "read" },
  { prefix: "/command-center", module: "executive", action: "read" },
  { prefix: "/memory", module: "executive", action: "read" },
  { prefix: "/decisions", module: "executive", action: "read" },
  { prefix: "/brief", module: "executive", action: "read" },
];

/** Paths that do not require module permission checks once authenticated. */
export const AUTHENTICATED_PUBLIC_PATHS = ["/unauthorized", "/forbidden"] as const;

export function findRouteAccessRule(pathname: string): RouteAccessRule | null {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  const matches = ROUTE_ACCESS_RULES.filter(
    (rule) => normalized === rule.prefix || normalized.startsWith(`${rule.prefix}/`),
  );

  if (matches.length === 0) {
    return null;
  }

  return matches.sort((left, right) => right.prefix.length - left.prefix.length)[0] ?? null;
}

/** Returns true when the user may access the given pathname. */
export function canAccessRoute(input: {
  pathname: string;
  role: RoleSlug;
  permissions: Permission[];
}): boolean {
  const rule = findRouteAccessRule(input.pathname);

  if (!rule) {
    return true;
  }

  if (rule.roles && !rule.roles.includes(input.role)) {
    return false;
  }

  return canAccess(
    { permissions: input.permissions },
    rule.module,
    rule.action ?? "read",
  );
}
