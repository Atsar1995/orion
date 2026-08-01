/**
 * ORION Identity — route classification for auth middleware and guards.
 */

/** Paths accessible without an authenticated session. */
export const AUTH_PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/unauthorized",
] as const;

export type AuthPublicPath = (typeof AUTH_PUBLIC_PATHS)[number];

/** Returns true when the pathname is a public authentication route. */
export function isAuthPublicPath(pathname: string): boolean {
  return AUTH_PUBLIC_PATHS.some((path) => pathname === path);
}
