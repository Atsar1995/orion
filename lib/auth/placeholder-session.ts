/**
 * ORION Identity — placeholder session factory for Phase 3 foundation.
 * No persistence, cookies, or real authentication.
 */

import { createSession } from "@/lib/auth/session";
import { SystemRole } from "@/lib/auth/roles";
import type { Session } from "@/types/auth";
import { OrganizationStatus, UserStatus } from "@/types/auth";

/** Creates a typed placeholder session for development and foundation testing. */
export function createPlaceholderSession(): Session {
  const now = new Date();
  const organizationId = "org-orania";
  const workspaceId = "workspace-orania";

  return createSession({
    now,
    user: {
      id: "user-placeholder-founder",
      email: "founder@orion.dev",
      name: "Mohammad Shafi",
      status: UserStatus.Active,
      organizationId,
      workspaceId,
      role: SystemRole.Founder,
      permissions: [
        { module: "mission-control", action: "read" },
        { module: "mission-control", action: "write" },
        { module: "intelligence", action: "read" },
        { module: "hotels", action: "read" },
        { module: "commerce", action: "read" },
        { module: "marketing", action: "read" },
        { module: "crm", action: "read" },
        { module: "finance", action: "read" },
        { module: "settings", action: "write" },
        { module: "users", action: "write" },
      ],
      createdAt: now,
      updatedAt: now,
    },
    activeWorkspace: {
      id: workspaceId,
      organizationId,
      name: "ORANIA",
      slug: "orania",
      modules: [
        "mission-control",
        "intelligence",
        "hotels",
        "commerce",
        "marketing",
        "crm",
        "finance",
      ],
    },
  });
}

/** Placeholder organization metadata aligned with the demo session. */
export const PLACEHOLDER_ORGANIZATION = {
  id: "org-orania",
  name: "ORANIA",
  slug: "orania",
  status: OrganizationStatus.Active,
} as const;
