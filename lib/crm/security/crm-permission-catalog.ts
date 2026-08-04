/**
 * CRM domain permission catalog (Mission P-008.12 · ADR-009).
 */

import { buildPermissionCode, type PermissionCode } from "@/lib/platform/security/Permission";

/** Canonical CRM permission codes — `crm:resource:action` format (ADR-009). */
export const CRM_PERMISSIONS = {
  admin: buildPermissionCode("crm", "admin", "manage"),
  accountRead: buildPermissionCode("crm", "account", "read"),
  accountWrite: buildPermissionCode("crm", "account", "write"),
  contactRead: buildPermissionCode("crm", "contact", "read"),
  contactWrite: buildPermissionCode("crm", "contact", "write"),
  organizationRead: buildPermissionCode("crm", "organization", "read"),
  organizationWrite: buildPermissionCode("crm", "organization", "write"),
  leadRead: buildPermissionCode("crm", "lead", "read"),
  leadCreate: buildPermissionCode("crm", "lead", "create"),
  leadQualify: buildPermissionCode("crm", "lead", "qualify"),
  opportunityRead: buildPermissionCode("crm", "opportunity", "read"),
  opportunityWrite: buildPermissionCode("crm", "opportunity", "write"),
  quoteRead: buildPermissionCode("crm", "quote", "read"),
  quoteWrite: buildPermissionCode("crm", "quote", "write"),
  salesOrderRead: buildPermissionCode("crm", "salesorder", "read"),
  salesOrderWrite: buildPermissionCode("crm", "salesorder", "write"),
  caseRead: buildPermissionCode("crm", "case", "read"),
  caseWrite: buildPermissionCode("crm", "case", "write"),
  activityRead: buildPermissionCode("crm", "activity", "read"),
  activityWrite: buildPermissionCode("crm", "activity", "write"),
  auditRead: buildPermissionCode("crm", "audit", "read"),
  configurationManage: buildPermissionCode("crm", "configuration", "manage"),
  eventReplay: buildPermissionCode("crm", "event", "replay"),
  intelligenceRead: buildPermissionCode("crm", "intelligence", "read"),
} as const;

export type CrmPermissionCode = (typeof CRM_PERMISSIONS)[keyof typeof CRM_PERMISSIONS];

export type CrmRoutePermissionRule = {
  readonly method: string;
  readonly pathPattern: RegExp;
  readonly permission: PermissionCode;
};

const CRM_ROUTE_RULES: readonly CrmRoutePermissionRule[] = [
  { method: "GET", pathPattern: /^\/api\/crm\/leads(?:\/|$)/, permission: CRM_PERMISSIONS.leadRead },
  { method: "POST", pathPattern: /^\/api\/crm\/leads\/convert/, permission: CRM_PERMISSIONS.leadQualify },
  { method: "POST", pathPattern: /^\/api\/crm\/leads(?:\/|$)/, permission: CRM_PERMISSIONS.leadCreate },
  { method: "PATCH", pathPattern: /^\/api\/crm\/leads\//, permission: CRM_PERMISSIONS.leadQualify },
  { method: "PUT", pathPattern: /^\/api\/crm\/leads\//, permission: CRM_PERMISSIONS.leadQualify },
  { method: "GET", pathPattern: /^\/api\/crm\/opportunities(?:\/|$)/, permission: CRM_PERMISSIONS.opportunityRead },
  { method: "POST", pathPattern: /^\/api\/crm\/opportunities(?:\/|$)/, permission: CRM_PERMISSIONS.opportunityWrite },
  { method: "PATCH", pathPattern: /^\/api\/crm\/opportunities\//, permission: CRM_PERMISSIONS.opportunityWrite },
  { method: "PUT", pathPattern: /^\/api\/crm\/opportunities\//, permission: CRM_PERMISSIONS.opportunityWrite },
  { method: "GET", pathPattern: /^\/api\/crm\/quotations/, permission: CRM_PERMISSIONS.quoteRead },
  { method: "POST", pathPattern: /^\/api\/crm\/quotations/, permission: CRM_PERMISSIONS.quoteWrite },
  { method: "GET", pathPattern: /^\/api\/crm\/proposals/, permission: CRM_PERMISSIONS.quoteRead },
  { method: "POST", pathPattern: /^\/api\/crm\/proposals/, permission: CRM_PERMISSIONS.quoteWrite },
  { method: "PATCH", pathPattern: /^\/api\/crm\/proposals\//, permission: CRM_PERMISSIONS.quoteWrite },
  { method: "GET", pathPattern: /^\/api\/crm\/contracts/, permission: CRM_PERMISSIONS.salesOrderRead },
  { method: "POST", pathPattern: /^\/api\/crm\/contracts/, permission: CRM_PERMISSIONS.salesOrderWrite },
  { method: "GET", pathPattern: /^\/api\/crm\/organisations/, permission: CRM_PERMISSIONS.organizationRead },
  { method: "POST", pathPattern: /^\/api\/crm\/organisations/, permission: CRM_PERMISSIONS.organizationWrite },
  { method: "PATCH", pathPattern: /^\/api\/crm\/organisations\//, permission: CRM_PERMISSIONS.organizationWrite },
  { method: "GET", pathPattern: /^\/api\/crm\/parties/, permission: CRM_PERMISSIONS.organizationRead },
  { method: "POST", pathPattern: /^\/api\/crm\/parties/, permission: CRM_PERMISSIONS.organizationWrite },
  { method: "PATCH", pathPattern: /^\/api\/crm\/parties\//, permission: CRM_PERMISSIONS.organizationWrite },
  { method: "POST", pathPattern: /^\/api\/crm\/parties\/merge/, permission: CRM_PERMISSIONS.organizationWrite },
  { method: "GET", pathPattern: /^\/api\/crm\/pipeline/, permission: CRM_PERMISSIONS.opportunityRead },
  { method: "GET", pathPattern: /^\/api\/crm\/forecasts/, permission: CRM_PERMISSIONS.intelligenceRead },
  { method: "GET", pathPattern: /^\/api\/crm\/intelligence\//, permission: CRM_PERMISSIONS.intelligenceRead },
  { method: "GET", pathPattern: /^\/api\/crm\/executive\//, permission: CRM_PERMISSIONS.intelligenceRead },
  { method: "GET", pathPattern: /^\/api\/crm\/customer-intelligence\//, permission: CRM_PERMISSIONS.intelligenceRead },
  { method: "GET", pathPattern: /^\/api\/crm\/approvals/, permission: CRM_PERMISSIONS.quoteRead },
  { method: "POST", pathPattern: /^\/api\/crm\/approvals/, permission: CRM_PERMISSIONS.quoteWrite },
  { method: "GET", pathPattern: /^\/api\/crm\/renewals/, permission: CRM_PERMISSIONS.accountRead },
  { method: "GET", pathPattern: /^\/api\/crm\/rate-agreements/, permission: CRM_PERMISSIONS.accountRead },
  { method: "GET", pathPattern: /^\/api\/crm\/relationships/, permission: CRM_PERMISSIONS.organizationRead },
];

/** Resolves required CRM permission for an API route. Default deny for unknown mutating routes. */
export function resolveCrmRoutePermission(method: string, pathname: string): PermissionCode | null {
  const normalizedMethod = method.toUpperCase();

  for (const rule of CRM_ROUTE_RULES) {
    if (rule.method === normalizedMethod && rule.pathPattern.test(pathname)) {
      return rule.permission;
    }
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod) && pathname.startsWith("/api/crm/")) {
    return buildPermissionCode("crm", "unknown", "write");
  }

  if (normalizedMethod === "GET" && pathname.startsWith("/api/crm/")) {
    return CRM_PERMISSIONS.leadRead;
  }

  return null;
}

export function listCrmRouteRules(): readonly CrmRoutePermissionRule[] {
  return CRM_ROUTE_RULES;
}
