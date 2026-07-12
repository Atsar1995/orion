/**
 * ORION Identity — route classification for auth middleware and guards.
 */

import { createPlaceholderSession } from "@/lib/auth/placeholder-session";
import { isSessionActive } from "@/lib/auth/session";

/** Paths accessible without an authenticated session. */
export const AUTH_PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
] as const;

export type AuthPublicPath = (typeof AUTH_PUBLIC_PATHS)[number];

/** Returns true when the pathname is a public authentication route. */
export function isAuthPublicPath(pathname: string): boolean {
  return AUTH_PUBLIC_PATHS.some((path) => pathname === path);
}

/**
 * Placeholder session detection for Phase 3 foundation.
 * Disabled when NEXT_PUBLIC_ORION_PLACEHOLDER_AUTH is explicitly set to "false".
 */
export function isPlaceholderSessionActive(): boolean {
  return process.env.NEXT_PUBLIC_ORION_PLACEHOLDER_AUTH !== "false";
}

/**
 * Returns true when a valid placeholder session should be treated as authenticated.
 * Shared by middleware and SessionProvider to prevent redirect loops.
 */
export function isAuthenticatedPlaceholder(): boolean {
  if (!isPlaceholderSessionActive()) {
    return false;
  }

  return isSessionActive(createPlaceholderSession());
}
