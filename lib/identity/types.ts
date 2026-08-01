import type { Organization, Permission, RoleSlug, Workspace } from "@/types/auth";
import { UserStatus } from "@/types/auth";

/** Extended organization profile for tenant settings (Mission S1A). */
export type OrganizationProfile = Organization & {
  branding: {
    displayName: string;
    primaryColor: string;
    logoLabel: string;
  };
  timeZone: string;
  locale: string;
  defaultSettings: {
    currency: string;
    dateFormat: string;
    executiveLanding: string;
  };
};

/** Stored user record for the identity repository. */
export type IdentityUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  status: UserStatus;
  organizationId: string;
  workspaceId: string;
  role: RoleSlug;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
};

/** Compact signed session payload stored in the session cookie. */
export type SessionTokenPayload = {
  sid: string;
  sub: string;
  email: string;
  name: string;
  role: RoleSlug;
  organizationId: string;
  workspaceId: string;
  permissions: Permission[];
  exp: number;
  iat: number;
};

/** Public identity profile returned to clients. */
export type IdentityProfile = {
  id: string;
  email: string;
  name: string;
  role: RoleSlug;
  organizationId: string;
  workspaceId: string;
  organization: OrganizationProfile;
  workspace: Workspace;
};
