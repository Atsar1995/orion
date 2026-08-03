/**
 * Finance authorization integration bootstrap (Mission P-009.14 · ADR-009).
 */

import { defaultPermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import {
  FINANCE_PERMISSIONS,
  listFinanceRouteRules,
  resolveFinanceRoutePermission,
} from "@/lib/finance/security/finance-permission-catalog";

export {
  FINANCE_PERMISSIONS,
  listFinanceRouteRules,
  resolveFinanceRoutePermission,
} from "@/lib/finance/security/finance-permission-catalog";
export type {
  FinancePermissionCode,
  FinanceRoutePermissionRule,
} from "@/lib/finance/security/finance-permission-catalog";

/** Registers Finance domain permissions with the platform permission registry. */
export function registerFinancePermissions(): void {
  for (const code of Object.values(FINANCE_PERMISSIONS)) {
    const [, resource, action] = code.split(":");

    defaultPermissionRegistry.register({
      code,
      description: `Finance ${resource} ${action} permission.`,
      scope: "domain",
      domain: "finance",
    });
  }
}

registerFinancePermissions();
