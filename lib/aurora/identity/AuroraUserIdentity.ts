import type { AuroraPermission } from "@/lib/aurora/identity/aurora-permission-catalog";
import type { AuroraRole } from "@/lib/aurora/identity/aurora-role-permissions";

/** Aurora user identity extension (ES-AURORA-006 §2.2). */
export interface AuroraUserIdentity {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
  readonly orionOrganizationId: string;
  readonly orionWorkspaceId: string;
  readonly orionRoles: readonly string[];
  readonly auroraRoles: readonly AuroraRole[];
  readonly auroraPermissions: ReadonlySet<AuroraPermission>;
  readonly locale: string;
  readonly timezone: string;
}
