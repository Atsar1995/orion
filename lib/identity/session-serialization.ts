import type { Session } from "@/types/auth";

/** JSON-safe session representation for API responses. */
export type SerializedSession = {
  user: Omit<Session["user"], "createdAt" | "updatedAt"> & {
    createdAt: string;
    updatedAt: string;
  };
  activeWorkspace: Session["activeWorkspace"];
  expiresAt: string;
};

export function serializeSession(session: Session): SerializedSession {
  return {
    user: {
      ...session.user,
      createdAt: session.user.createdAt.toISOString(),
      updatedAt: session.user.updatedAt.toISOString(),
    },
    activeWorkspace: session.activeWorkspace,
    expiresAt: session.expiresAt.toISOString(),
  };
}

export function deserializeSession(value: SerializedSession): Session {
  return {
    user: {
      ...value.user,
      createdAt: new Date(value.user.createdAt),
      updatedAt: new Date(value.user.updatedAt),
    },
    activeWorkspace: value.activeWorkspace,
    expiresAt: new Date(value.expiresAt),
  };
}
