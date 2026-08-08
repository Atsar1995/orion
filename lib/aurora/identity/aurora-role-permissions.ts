import type { AuroraPermission } from "@/lib/aurora/identity/aurora-permission-catalog";
import type { RoleSlug } from "@/types/auth";

export type AuroraRole =
  | "aurora.admin"
  | "aurora.director"
  | "aurora.manager"
  | "aurora.editor"
  | "aurora.approver"
  | "aurora.viewer"
  | "aurora.agent.service";

const ALL_AURORA_PERMISSIONS: readonly AuroraPermission[] = [
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
];

const DIRECTOR_PERMISSIONS: readonly AuroraPermission[] = ALL_AURORA_PERMISSIONS.filter(
  (permission) => permission !== "aurora.admin.tenant",
);

const MANAGER_PERMISSIONS: readonly AuroraPermission[] = [
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
  "aurora.creative.read",
  "aurora.creative.write",
  "aurora.agent.invoke",
  "aurora.approval.override",
];

const EDITOR_PERMISSIONS: readonly AuroraPermission[] = [
  "aurora.content.read",
  "aurora.content.write",
  "aurora.campaign.read",
  "aurora.campaign.write",
  "aurora.seo.read",
  "aurora.seo.write",
  "aurora.analytics.read",
  "aurora.creative.read",
  "aurora.creative.write",
  "aurora.agent.invoke",
];

const APPROVER_PERMISSIONS: readonly AuroraPermission[] = [
  "aurora.content.read",
  "aurora.content.approve",
  "aurora.campaign.read",
  "aurora.campaign.approve",
  "aurora.seo.read",
  "aurora.analytics.read",
  "aurora.creative.read",
];

const VIEWER_PERMISSIONS: readonly AuroraPermission[] = [
  "aurora.content.read",
  "aurora.campaign.read",
  "aurora.seo.read",
  "aurora.analytics.read",
  "aurora.creative.read",
];

const AGENT_SERVICE_PERMISSIONS: readonly AuroraPermission[] = [
  "aurora.content.read",
  "aurora.content.write",
  "aurora.campaign.read",
  "aurora.campaign.write",
  "aurora.seo.read",
  "aurora.seo.write",
  "aurora.agent.invoke",
];

const ROLE_PERMISSIONS: Record<AuroraRole, readonly AuroraPermission[]> = {
  "aurora.admin": ALL_AURORA_PERMISSIONS,
  "aurora.director": DIRECTOR_PERMISSIONS,
  "aurora.manager": MANAGER_PERMISSIONS,
  "aurora.editor": EDITOR_PERMISSIONS,
  "aurora.approver": APPROVER_PERMISSIONS,
  "aurora.viewer": VIEWER_PERMISSIONS,
  "aurora.agent.service": AGENT_SERVICE_PERMISSIONS,
};

/** Map ORION role slug to Aurora roles (ES-AURORA-006 §5.3). */
export function resolveAuroraRolesFromOrionRole(orionRole: RoleSlug): readonly AuroraRole[] {
  switch (orionRole) {
    case "super_admin":
    case "organization_admin":
    case "administrator":
      return ["aurora.admin"];
    case "founder":
    case "executive":
      return ["aurora.director"];
    case "manager":
      return ["aurora.manager"];
    case "analyst":
    case "staff":
      return ["aurora.editor"];
    case "read_only":
    case "guest":
      return ["aurora.viewer"];
    case "service_account":
      return ["aurora.agent.service"];
    default:
      return ["aurora.viewer"];
  }
}

export function getPermissionsForAuroraRole(role: AuroraRole): readonly AuroraPermission[] {
  return ROLE_PERMISSIONS[role];
}

export function resolveAuroraPermissions(roles: readonly AuroraRole[]): ReadonlySet<AuroraPermission> {
  const permissions = new Set<AuroraPermission>();
  for (const role of roles) {
    for (const permission of getPermissionsForAuroraRole(role)) {
      permissions.add(permission);
    }
  }
  return permissions;
}
