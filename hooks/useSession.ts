"use client";

import { useSessionContext } from "@/components/auth/SessionProvider";

/** Provides access to the current placeholder session state. */
export function useSession() {
  const { session, loading, isAuthenticated } = useSessionContext();

  return {
    session,
    loading,
    isAuthenticated,
  };
}
