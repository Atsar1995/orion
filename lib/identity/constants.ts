/** ORION Identity Service constants (Mission S1A). */

export const SESSION_COOKIE_NAME = "orion_session";

export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export const DEFAULT_SESSION_SECRET = "orion-dev-session-secret-change-in-production";

export function getSessionSecret(): string {
  return process.env.ORION_SESSION_SECRET ?? DEFAULT_SESSION_SECRET;
}
