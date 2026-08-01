import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, getSessionSecret } from "@/lib/identity/constants";
import {
  AUTHENTICATED_PUBLIC_PATHS,
  canAccessRoute,
} from "@/lib/identity/route-access";
import { verifySessionToken } from "@/lib/identity/session-token";
import type { SessionTokenPayload } from "@/lib/identity/types";

/** API auth routes that bypass middleware session enforcement. */
export const AUTH_API_PREFIX = "/api/auth";

/** Health/ops API routes for load balancers and monitoring (Mission S1D). */
export const HEALTH_API_PREFIX = "/api/health";

export function isAuthApiPath(pathname: string): boolean {
  return pathname.startsWith(`${AUTH_API_PREFIX}/`);
}

export function isHealthApiPath(pathname: string): boolean {
  return pathname.startsWith(`${HEALTH_API_PREFIX}`);
}

/** Paths reachable when authenticated but lacking module permissions. */
export function isAuthenticatedPublicPath(pathname: string): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  return AUTHENTICATED_PUBLIC_PATHS.some(
    (path) => normalized === path || normalized.startsWith(`${path}/`),
  );
}

export async function getSessionPayloadFromRequest(
  request: NextRequest,
): Promise<SessionTokenPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token, getSessionSecret());
}

export function canAccessPathWithPayload(
  pathname: string,
  payload: SessionTokenPayload,
): boolean {
  return canAccessRoute({
    pathname,
    role: payload.role,
    permissions: payload.permissions,
  });
}
