import type { RoleSlug, Session } from "@/types/auth";
import { UserStatus } from "@/types/auth";

export const TEST_ORG_ID = "org-acme";
export const TEST_WORKSPACE_ID = "workspace-acme";
export const TEST_USER_ID = "user-acme-001";

export function createTestSession(
  role: RoleSlug,
  overrides: Partial<Session["user"]> = {},
): Session {
  const organizationId = overrides.organizationId ?? TEST_ORG_ID;
  const workspaceId = overrides.workspaceId ?? TEST_WORKSPACE_ID;

  return {
    user: {
      id: TEST_USER_ID,
      email: "user@acme.test",
      name: "Acme User",
      status: UserStatus.Active,
      organizationId,
      workspaceId,
      role,
      permissions: [],
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      ...overrides,
    },
    expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    activeWorkspace: {
      id: workspaceId,
      organizationId,
      name: "Default",
      slug: "default",
      modules: ["executive"],
    },
  };
}
