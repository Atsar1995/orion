"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { deserializeSession } from "@/lib/identity/session-serialization";
import type { SerializedSession } from "@/lib/identity/session-serialization";
import { isSessionActive } from "@/lib/auth/session";
import { AuthErrorCode } from "@/types/auth";
import type { AuthResult, LoginCredentials, Session } from "@/types/auth";
import type { IdentityProfile } from "@/lib/identity/types";

type SessionContextValue = {
  session: Session | null;
  profile: IdentityProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult<Session>>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type SessionProviderProps = {
  children: ReactNode;
};

type SessionApiResponse =
  | {
      success: true;
      data: { session: SerializedSession; profile: IdentityProfile | null };
    }
  | { success: false; error?: { message?: string } };

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<IdentityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const expiryTimerRef = useRef<number | null>(null);

  const clearExpiryTimer = useCallback(() => {
    if (expiryTimerRef.current !== null) {
      window.clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }, []);

  const scheduleSessionExpiry = useCallback(
    (nextSession: Session | null) => {
      clearExpiryTimer();

      if (!nextSession || !isSessionActive(nextSession)) {
        return;
      }

      const remainingMs = nextSession.expiresAt.getTime() - Date.now();

      expiryTimerRef.current = window.setTimeout(() => {
        void (async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          setSession(null);
          setProfile(null);
        })();
      }, Math.max(remainingMs, 0));
    },
    [clearExpiryTimer],
  );

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });

      if (!response.ok) {
        setSession(null);
        setProfile(null);
        return;
      }

      const payload = (await response.json()) as SessionApiResponse;

      if (!payload.success) {
        setSession(null);
        setProfile(null);
        return;
      }

      const nextSession = deserializeSession(payload.data.session);

      if (!isSessionActive(nextSession)) {
        setSession(null);
        setProfile(null);
        return;
      }

      setSession(nextSession);
      setProfile(payload.data.profile);
      scheduleSessionExpiry(nextSession);
    } catch {
      setSession(null);
      setProfile(null);
    }
  }, [scheduleSessionExpiry]);

  useEffect(() => {
    void (async () => {
      await refreshSession();
      setLoading(false);
    })();

    return clearExpiryTimer;
  }, [clearExpiryTimer, refreshSession]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResult<Session>> => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const payload = (await response.json()) as
        | { success: true; data: { session: SerializedSession } }
        | { success: false; error: { code?: string; message: string } };

      if (!response.ok || !payload.success) {
        return {
          success: false,
          error: {
            code: AuthErrorCode.InvalidCredentials,
            message:
              "error" in payload && payload.error?.message
                ? payload.error.message
                : "Sign in failed.",
          },
        };
      }

      const nextSession = deserializeSession(payload.data.session);
      setSession(nextSession);
      scheduleSessionExpiry(nextSession);
      await refreshSession();

      return { success: true, data: nextSession };
    },
    [refreshSession, scheduleSessionExpiry],
  );

  const logout = useCallback(async () => {
    clearExpiryTimer();
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    setProfile(null);
  }, [clearExpiryTimer]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      profile,
      loading,
      isAuthenticated: session !== null && isSessionActive(session),
      login,
      logout,
      refreshSession,
    }),
    [session, profile, loading, login, logout, refreshSession],
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
