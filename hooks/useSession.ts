"use client";

import { useSessionContext } from "@/components/auth/SessionProvider";

/** Provides access to the current authenticated session state. */
export function useSession() {
  const { session, profile, loading, isAuthenticated, login, logout, refreshSession } =
    useSessionContext();

  return {
    session,
    profile,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshSession,
  };
}
