/**
 * CRM authorization integration bootstrap (Mission P-008.12 · ADR-009).
 */

import { defaultPermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import {
  CRM_PERMISSIONS,
  listCrmRouteRules,
  resolveCrmRoutePermission,
} from "@/lib/crm/security/crm-permission-catalog";

export {
  CRM_PERMISSIONS,
  listCrmRouteRules,
  resolveCrmRoutePermission,
} from "@/lib/crm/security/crm-permission-catalog";
export type {
  CrmPermissionCode,
  CrmRoutePermissionRule,
} from "@/lib/crm/security/crm-permission-catalog";

export {
  CrmAuthorizationService,
  defaultCrmAuthorizationService,
} from "@/lib/crm/security/CrmAuthorizationService";

export {
  getCrmApiContext,
  getCrmApiContextForRequest,
  CrmAuthorizationError,
} from "@/lib/crm/security/CrmPermissionGuards";
export type { CrmApiContextOptions } from "@/lib/crm/security/CrmPermissionGuards";

/** Registers CRM domain permissions with the platform permission registry. */
export function registerCrmPermissions(): void {
  for (const code of Object.values(CRM_PERMISSIONS)) {
    const [, resource, action] = code.split(":");

    defaultPermissionRegistry.register({
      code,
      description: `CRM ${resource} ${action} permission.`,
      scope: "domain",
      domain: "crm",
    });
  }
}

registerCrmPermissions();
