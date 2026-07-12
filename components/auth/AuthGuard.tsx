"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { LoadingState } from "@/components/ui/LoadingState";
import { isAuthPublicPath } from "@/lib/auth/routes";

type AuthGuardProps = {
  children: ReactNode;
};

/**
 * Client-side route guard for placeholder session flow.
 * Redirects unauthenticated users to /login and authenticated users away from auth pages.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useSession();

  const isPublicRoute = isAuthPublicPath(pathname);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace("/");
    }
  }, [isAuthenticated, isPublicRoute, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orion-navy">
        <LoadingState label="Loading session..." />
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orion-navy">
        <LoadingState label="Redirecting to sign in..." />
      </div>
    );
  }

  if (isAuthenticated && isPublicRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orion-navy">
        <LoadingState label="Redirecting to workspace..." />
      </div>
    );
  }

  return children;
}
