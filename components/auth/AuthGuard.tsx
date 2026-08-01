"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { LoadingState } from "@/components/ui/LoadingState";
import { isAuthPublicPath } from "@/lib/auth/routes";

type AuthGuardProps = {
  children: ReactNode;
};

/** Client-side route guard — redirects unauthenticated users to sign in. */
export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useSession();

  const isPublicRoute = isAuthPublicPath(pathname);
  const isUnauthorizedPage = pathname === "/unauthorized";
  const isForbiddenPage = pathname === "/forbidden";

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated && !isPublicRoute && !isUnauthorizedPage) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace("/brief");
    }
  }, [isAuthenticated, isPublicRoute, isUnauthorizedPage, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orion-navy">
        <LoadingState label="Loading session..." />
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute && !isUnauthorizedPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orion-navy">
        <LoadingState label="Redirecting to sign in..." />
      </div>
    );
  }

  if (isAuthenticated && isPublicRoute && !isForbiddenPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orion-navy">
        <LoadingState label="Redirecting to workspace..." />
      </div>
    );
  }

  return children;
}
