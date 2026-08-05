/**
 * Procurement authorization integration bootstrap (Mission P-010.5 · ADR-009).
 */

import { defaultPermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import {
  PROCUREMENT_PERMISSIONS,
  listProcurementRouteRules,
  resolveProcurementRoutePermission,
} from "@/lib/procurement/security/procurement-permission-catalog";

export {
  PROCUREMENT_PERMISSIONS,
  listProcurementRouteRules,
  resolveProcurementRoutePermission,
} from "@/lib/procurement/security/procurement-permission-catalog";
export type {
  ProcurementPermissionCode,
  ProcurementRoutePermissionRule,
} from "@/lib/procurement/security/procurement-permission-catalog";

export {
  ProcurementAuthorizationService,
  defaultProcurementAuthorizationService,
} from "@/lib/procurement/security/ProcurementAuthorizationService";

export {
  getProcurementApiContext,
  getProcurementApiContextForRequest,
  ProcurementAuthorizationError,
} from "@/lib/procurement/security/ProcurementPermissionGuards";
export type { ProcurementApiContextOptions } from "@/lib/procurement/security/ProcurementPermissionGuards";

/** Registers Procurement domain permissions with the platform permission registry. */
export function registerProcurementPermissions(): void {
  for (const code of Object.values(PROCUREMENT_PERMISSIONS)) {
    const [, resource, action] = code.split(":");

    defaultPermissionRegistry.register({
      code,
      description: `Procurement ${resource} ${action} permission.`,
      scope: "domain",
      domain: "procurement",
    });
  }
}

registerProcurementPermissions();
