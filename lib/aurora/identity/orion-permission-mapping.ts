import type { AuroraPermission } from "@/lib/aurora/identity/aurora-permission-catalog";
import type { AuroraRole } from "@/lib/aurora/identity/aurora-role-permissions";
import { resolveAuroraPermissions } from "@/lib/aurora/identity/aurora-role-permissions";
import type { Permission } from "@/types/auth";

const AURORA_PERMISSION_VALUES: ReadonlySet<string> = new Set<AuroraPermission>([
  "aurora.admin.tenant",
  "aurora.admin.brand",
  "aurora.admin.config",
  "aurora.admin.users",
  "aurora.content.read",
  "aurora.content.write",
  "aurora.content.approve",
  "aurora.content.publish",
  "aurora.campaign.read",
  "aurora.campaign.write",
  "aurora.campaign.approve",
  "aurora.seo.read",
  "aurora.seo.write",
  "aurora.analytics.read",
  "aurora.analytics.export",
  "aurora.creative.read",
  "aurora.creative.write",
  "aurora.agent.invoke",
  "aurora.agent.configure",
  "aurora.integration.manage",
  "aurora.knowledge.read",
  "aurora.knowledge.write",
  "aurora.approval.override",
]);

function isAuroraPermissionValue(value: string): value is AuroraPermission {
  return AURORA_PERMISSION_VALUES.has(value);
}

/** Map a single ORION permission grant to an Aurora permission when explicitly scoped. */
export function mapOrionPermissionToAurora(permission: Permission): AuroraPermission | null {
  if (permission.module !== "aurora") {
    return null;
  }

  const candidate = permission.action.startsWith("aurora.")
    ? permission.action
    : `aurora.${permission.action}`;

  return isAuroraPermissionValue(candidate) ? candidate : null;
}

/** Map ORION session permission grants to Aurora permissions (ADR-002 extension). */
export function mapOrionPermissionsToAurora(
  permissions: readonly Permission[],
): ReadonlySet<AuroraPermission> {
  const mapped = new Set<AuroraPermission>();
  for (const permission of permissions) {
    const auroraPermission = mapOrionPermissionToAurora(permission);
    if (auroraPermission) {
      mapped.add(auroraPermission);
    }
  }
  return mapped;
}

/**
 * Effective Aurora permissions = role-derived UNION ORION session grants (ADR-002).
 * ORION grants are extended, never replaced.
 */
export function resolveEffectiveAuroraPermissions(
  roles: readonly AuroraRole[],
  orionPermissions: readonly Permission[],
): ReadonlySet<AuroraPermission> {
  const effective = new Set(resolveAuroraPermissions(roles));
  for (const permission of mapOrionPermissionsToAurora(orionPermissions)) {
    effective.add(permission);
  }
  return effective;
}
