/** Aurora permission catalog (ES-AURORA-006 §5.2). */

export type AuroraPermission =
  | "aurora.admin.tenant"
  | "aurora.admin.brand"
  | "aurora.admin.config"
  | "aurora.admin.users"
  | "aurora.content.read"
  | "aurora.content.write"
  | "aurora.content.approve"
  | "aurora.content.publish"
  | "aurora.campaign.read"
  | "aurora.campaign.write"
  | "aurora.campaign.approve"
  | "aurora.seo.read"
  | "aurora.seo.write"
  | "aurora.analytics.read"
  | "aurora.analytics.export"
  | "aurora.creative.read"
  | "aurora.creative.write"
  | "aurora.agent.invoke"
  | "aurora.agent.configure"
  | "aurora.integration.manage"
  | "aurora.knowledge.read"
  | "aurora.knowledge.write"
  | "aurora.approval.override";

export const AURORA_ADMIN_PERMISSIONS: readonly AuroraPermission[] = [
  "aurora.admin.tenant",
  "aurora.admin.brand",
  "aurora.admin.config",
  "aurora.admin.users",
];

export function isAuroraAdminPermission(permission: AuroraPermission): boolean {
  return permission.startsWith("aurora.admin.");
}
