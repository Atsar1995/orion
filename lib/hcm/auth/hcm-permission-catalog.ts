/**
 * HCM domain permission catalog (Mission P-015.6 · ADR-009).
 */

import { buildPermissionCode, type PermissionCode } from "@/lib/platform/security/Permission";
import { HCM_PERMISSIONS } from "@/lib/platform/security/RoleRegistry";

export { HCM_PERMISSIONS };

export type HcmRoutePermissionRule = {
  readonly method: string;
  readonly pathPattern: RegExp;
  readonly permission: PermissionCode;
};

const HCM_ROUTE_RULES: readonly HcmRoutePermissionRule[] = [
  { method: "GET", pathPattern: /^\/api\/hcm\/employees(?:\/|$)/, permission: HCM_PERMISSIONS.employeeRead },
  { method: "POST", pathPattern: /^\/api\/hcm\/employees(?:\/|$)/, permission: HCM_PERMISSIONS.employeeWrite },
  { method: "PATCH", pathPattern: /^\/api\/hcm\/employees\//, permission: HCM_PERMISSIONS.employeeWrite },
  { method: "GET", pathPattern: /^\/api\/hcm\/organization\//, permission: HCM_PERMISSIONS.orgRead },
  { method: "POST", pathPattern: /^\/api\/hcm\/organization\//, permission: HCM_PERMISSIONS.orgWrite },
  { method: "PATCH", pathPattern: /^\/api\/hcm\/organization\//, permission: HCM_PERMISSIONS.orgWrite },
  { method: "GET", pathPattern: /^\/api\/hcm\/employment(?:\/|$)/, permission: HCM_PERMISSIONS.employmentRead },
  { method: "POST", pathPattern: /^\/api\/hcm\/employment(?:\/|$)/, permission: HCM_PERMISSIONS.employmentWrite },
  { method: "PATCH", pathPattern: /^\/api\/hcm\/employment\//, permission: HCM_PERMISSIONS.employmentWrite },
  { method: "GET", pathPattern: /^\/api\/hcm\/recruitment\//, permission: HCM_PERMISSIONS.recruitmentRead },
  { method: "POST", pathPattern: /^\/api\/hcm\/recruitment\//, permission: HCM_PERMISSIONS.recruitmentWrite },
  { method: "PATCH", pathPattern: /^\/api\/hcm\/recruitment\//, permission: HCM_PERMISSIONS.recruitmentWrite },
  { method: "GET", pathPattern: /^\/api\/hcm\/onboarding(?:\/|$)/, permission: HCM_PERMISSIONS.onboardingRead },
  { method: "POST", pathPattern: /^\/api\/hcm\/onboarding(?:\/|$)/, permission: HCM_PERMISSIONS.onboardingWrite },
  { method: "PATCH", pathPattern: /^\/api\/hcm\/onboarding(?:\/|$)/, permission: HCM_PERMISSIONS.onboardingWrite },
  { method: "GET", pathPattern: /^\/api\/hcm\/(attendance|leave|roster|calendars)(?:\/|$)/, permission: HCM_PERMISSIONS.timeRead },
  { method: "POST", pathPattern: /^\/api\/hcm\/(attendance|leave|roster)(?:\/|$)/, permission: HCM_PERMISSIONS.timeWrite },
  { method: "POST", pathPattern: /^\/api\/hcm\/leave\/actions/, permission: HCM_PERMISSIONS.timeApprove },
  { method: "GET", pathPattern: /^\/api\/hcm\/payroll(?:\/|$)/, permission: HCM_PERMISSIONS.payrollRead },
  { method: "POST", pathPattern: /^\/api\/hcm\/payroll(?:\/|$)/, permission: HCM_PERMISSIONS.payrollWrite },
];

/** Resolves required HCM permission for an API route. Default deny for unknown mutating routes. */
export function resolveHcmRoutePermission(method: string, pathname: string): PermissionCode | null {
  const normalizedMethod = method.toUpperCase();

  for (const rule of HCM_ROUTE_RULES) {
    if (rule.method === normalizedMethod && rule.pathPattern.test(pathname)) {
      return rule.permission;
    }
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod) && pathname.startsWith("/api/hcm/")) {
    return buildPermissionCode("hcm", "unknown", "write");
  }

  if (normalizedMethod === "GET" && pathname.startsWith("/api/hcm/")) {
    return HCM_PERMISSIONS.employeeRead;
  }

  return null;
}

export function listHcmRouteRules(): readonly HcmRoutePermissionRule[] {
  return HCM_ROUTE_RULES;
}
