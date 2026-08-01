import { createHash, randomUUID } from "crypto";
import { getPermissionsForRole } from "@/lib/identity/role-permissions";
import type { IdentityUserRecord } from "@/lib/identity/types";
import { SystemRole } from "@/lib/auth/roles";
import { UserStatus } from "@/types/auth";

/** Demo password for alpha environments — override via ORION_DEMO_PASSWORD. */
export const DEMO_PASSWORD = process.env.ORION_DEMO_PASSWORD ?? "orion-dev";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function buildUser(input: {
  id: string;
  email: string;
  name: string;
  role: IdentityUserRecord["role"];
}): IdentityUserRecord {
  const now = new Date();

  return {
    id: input.id,
    email: input.email,
    passwordHash: hashPassword(DEMO_PASSWORD),
    name: input.name,
    status: UserStatus.Active,
    organizationId: "org-orania",
    workspaceId: "workspace-orania",
    role: input.role,
    permissions: getPermissionsForRole(input.role),
    createdAt: now,
    updatedAt: now,
  };
}

/** Seed users for Mission S1A alpha authentication. */
export const DEMO_USERS: IdentityUserRecord[] = [
  buildUser({
    id: "user-super-admin",
    email: "superadmin@orion.dev",
    name: "ORION Super Admin",
    role: SystemRole.SuperAdmin,
  }),
  buildUser({
    id: "user-org-admin",
    email: "admin@orion.dev",
    name: "Organization Admin",
    role: SystemRole.OrganizationAdmin,
  }),
  buildUser({
    id: "user-executive",
    email: "founder@orion.dev",
    name: "Mohammad Shafi",
    role: SystemRole.Executive,
  }),
  buildUser({
    id: "user-manager",
    email: "manager@orion.dev",
    name: "Operations Manager",
    role: SystemRole.Manager,
  }),
  buildUser({
    id: "user-analyst",
    email: "analyst@orion.dev",
    name: "Business Analyst",
    role: SystemRole.Analyst,
  }),
  buildUser({
    id: "user-readonly",
    email: "readonly@orion.dev",
    name: "Read Only User",
    role: SystemRole.ReadOnly,
  }),
];

export function createSessionId(): string {
  return randomUUID();
}
