/**
 * Authentication context — session validity and fail-closed mode (Mission P-015.6 · ADR-008).
 */

import type { Session } from "@/types/auth";
import type { IdentityContext } from "@/lib/platform/security/IdentityContext";
import { createIdentityContextFromSession } from "@/lib/platform/security/IdentityContext";

export type AuthenticationState = "authenticated" | "anonymous" | "invalid";

export type AuthenticationContext = {
  readonly state: AuthenticationState;
  readonly session: Session | null;
  readonly identity: IdentityContext | null;
  readonly failClosed: boolean;
};

function readFailClosedMode(): boolean {
  if (process.env.ORION_AUTH_FAIL_CLOSED === "true") {
    return true;
  }

  if (process.env.ORION_AUTH_FAIL_CLOSED === "false") {
    return false;
  }

  return process.env.NODE_ENV === "production";
}

/** Resolves authentication context from an optional session. */
export function createAuthenticationContext(session: Session | null): AuthenticationContext {
  const failClosed = readFailClosedMode();

  if (!session) {
    return {
      state: "anonymous",
      session: null,
      identity: null,
      failClosed,
    };
  }

  return {
    state: "authenticated",
    session,
    identity: createIdentityContextFromSession(session),
    failClosed,
  };
}

export function isFailClosedEnabled(): boolean {
  return readFailClosedMode();
}

export function requiresAuthenticatedSession(context: AuthenticationContext): boolean {
  return context.failClosed && context.state !== "authenticated";
}
