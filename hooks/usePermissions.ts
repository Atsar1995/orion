"use client";

import { useCallback, useMemo } from "react";
import { useSession } from "@/hooks/useSession";
import {
  canAccess as canAccessPermission,
  hasPermission as hasUserPermission,
  hasRole as hasUserRole,
} from "@/lib/auth/permissions";
import type { SystemRole } from "@/lib/auth/roles";
import type { Permission, RoleSlug } from "@/types/auth";

/** Permission helpers scoped to the current session user. */
export function usePermissions() {
  const { session } = useSession();
  const user = session?.user ?? null;

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user) {
        return false;
      }

      return hasUserPermission(user, permission);
    },
    [user],
  );

  const hasRole = useCallback(
    (role: RoleSlug | SystemRole): boolean => {
      if (!user) {
        return false;
      }

      return hasUserRole(user, role);
    },
    [user],
  );

  const canAccess = useCallback(
    (module: string, action = "read"): boolean => {
      if (!user) {
        return false;
      }

      return canAccessPermission(user, module, action);
    },
    [user],
  );

  return useMemo(
    () => ({
      hasPermission,
      hasRole,
      canAccess,
      user,
    }),
    [canAccess, hasPermission, hasRole, user],
  );
}
