import { DEMO_ORGANIZATION } from "@/lib/identity/data/demo-organizations";
import { DEMO_USERS } from "@/lib/identity/data/demo-users";
import type { IdentityUserRecord } from "@/lib/identity/types";
import type { OrganizationProfile } from "@/lib/identity/types";
import type { Workspace } from "@/types/auth";

const DEMO_WORKSPACE: Workspace = {
  id: "workspace-orania",
  organizationId: DEMO_ORGANIZATION.id,
  name: "ORANIA Executive Workspace",
  slug: "orania",
  modules: [
    "executive",
    "mission-control",
    "intelligence",
    "crm",
    "finance",
    "hospitality",
    "marketing",
    "integrations",
  ],
};

/** In-memory user repository (Mission S1A — replace with persistence in Phase 2). */
export class UserRepository {
  private readonly users: IdentityUserRecord[];

  constructor(users: IdentityUserRecord[] = DEMO_USERS) {
    this.users = users;
  }

  findByEmail(email: string): IdentityUserRecord | null {
    const normalized = email.trim().toLowerCase();
    return this.users.find((user) => user.email.toLowerCase() === normalized) ?? null;
  }

  findById(id: string): IdentityUserRecord | null {
    return this.users.find((user) => user.id === id) ?? null;
  }
}

/** In-memory organization repository. */
export class OrganizationRepository {
  getById(id: string): OrganizationProfile | null {
    if (id === DEMO_ORGANIZATION.id) {
      return DEMO_ORGANIZATION;
    }

    return null;
  }

  getWorkspace(workspaceId: string): Workspace | null {
    if (workspaceId === DEMO_WORKSPACE.id) {
      return DEMO_WORKSPACE;
    }

    return null;
  }
}

export const defaultUserRepository = new UserRepository();
export const defaultOrganizationRepository = new OrganizationRepository();
