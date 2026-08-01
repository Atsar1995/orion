/**
 * ORION Identity Service — public API (Mission S1A).
 * Workspaces must consume identity through this module, not auth internals.
 */

export { identityService, IdentityService, getSessionCookieOptions } from "@/lib/identity/IdentityService";
export {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  getSessionSecret,
} from "@/lib/identity/constants";
export { canAccessRoute, findRouteAccessRule, ROUTE_ACCESS_RULES } from "@/lib/identity/route-access";
export { getPermissionsForRole } from "@/lib/identity/role-permissions";
export { verifySessionToken, signSessionToken } from "@/lib/identity/session-token";
export type { IdentityProfile, OrganizationProfile, SessionTokenPayload } from "@/lib/identity/types";
export { DEMO_PASSWORD } from "@/lib/identity/data/demo-users";
export { DEMO_ORGANIZATION } from "@/lib/identity/data/demo-organizations";
export { getDisplayInitials } from "@/lib/identity/user-display";
export { serializeSession, deserializeSession } from "@/lib/identity/session-serialization";
export { getServerSession } from "@/lib/identity/server-session";
