/**
 * ORION Identity — session helpers.
 * No cookie, JWT, or storage implementation in this phase.
 */

import type { Session, User, Workspace } from "@/types/auth";

/** Default session lifetime in milliseconds (8 hours). */
export const DEFAULT_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

/** Input for constructing a new session. */
export interface CreateSessionInput {
  user: User;
  activeWorkspace: Workspace;
  durationMs?: number;
  now?: Date;
}

/** Creates an in-memory session object. Does not persist or store the session. */
export function createSession(input: CreateSessionInput): Session {
  const now = input.now ?? new Date();
  const durationMs = input.durationMs ?? DEFAULT_SESSION_DURATION_MS;

  return {
    user: input.user,
    activeWorkspace: input.activeWorkspace,
    expiresAt: new Date(now.getTime() + durationMs),
  };
}

/** Destroys a session reference. Returns null to signal an inactive session. */
export function destroySession(session: Session): null {
  void session;
  return null;
}

/** Returns true when the session has passed its expiry time. */
export function isSessionExpired(
  session: Pick<Session, "expiresAt">,
  now: Date = new Date(),
): boolean {
  return now.getTime() >= session.expiresAt.getTime();
}

/** Returns true when the session is currently valid. */
export function isSessionActive(
  session: Pick<Session, "expiresAt">,
  now: Date = new Date(),
): boolean {
  return !isSessionExpired(session, now);
}

/** Returns remaining session lifetime in milliseconds. */
export function getSessionRemainingMs(
  session: Pick<Session, "expiresAt">,
  now: Date = new Date(),
): number {
  return Math.max(0, session.expiresAt.getTime() - now.getTime());
}

/** Returns the active workspace identifier from a session. */
export function getActiveWorkspaceId(session: Session): string {
  return session.activeWorkspace.id;
}

/** Returns the authenticated user identifier from a session. */
export function getSessionUserId(session: Session): string {
  return session.user.id;
}

/** Returns the organization identifier scoped to the session user. */
export function getSessionOrganizationId(session: Session): string {
  return session.user.organizationId;
}
