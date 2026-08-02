/**
 * HCM authorization integration (Mission P-015.6 · ADR-009).
 */

import { defaultPermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import { buildPermissionCode } from "@/lib/platform/security/Permission";
import { HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";

export {
  HCM_PERMISSIONS,
  listHcmRouteRules,
  resolveHcmRoutePermission,
} from "@/lib/hcm/auth/hcm-permission-catalog";
export type { HcmRoutePermissionRule } from "@/lib/hcm/auth/hcm-permission-catalog";

/** Registers HCM domain permissions with the platform permission registry. */
export function registerHcmPermissions(): void {
  for (const code of Object.values(HCM_PERMISSIONS)) {
    const [, resource, action] = code.split(":");
    defaultPermissionRegistry.register({
      code,
      description: `HCM ${resource} ${action} permission.`,
      scope: "domain",
      domain: "hcm",
      inherits:
        action === "write" || action === "approve"
          ? [buildPermissionCode("hcm", resource, "read")]
          : undefined,
    });
  }
}

registerHcmPermissions();
