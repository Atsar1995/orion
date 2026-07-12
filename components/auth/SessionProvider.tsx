"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createPlaceholderSession } from "@/lib/auth/placeholder-session";
import { isPlaceholderSessionActive } from "@/lib/auth/routes";
import { isSessionActive } from "@/lib/auth/session";
import type { Session } from "@/types/auth";

type SessionContextValue = {
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function createInitialSession(): Session | null {
  if (!isPlaceholderSessionActive()) {
    return null;
  }

  const placeholderSession = createPlaceholderSession();
  return isSessionActive(placeholderSession) ? placeholderSession : null;
}

type SessionProviderProps = {
  children: ReactNode;
};

export function SessionProvider({ children }: SessionProviderProps) {
  const [session] = useState<Session | null>(createInitialSession);
  const [loading] = useState(false);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      loading,
      isAuthenticated: session !== null && isSessionActive(session),
    }),
    [session, loading],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/** Returns the session context. Must be used within {@link SessionProvider}. */
export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider.");
  }

  return context;
}
