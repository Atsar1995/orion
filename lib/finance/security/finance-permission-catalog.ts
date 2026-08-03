/**
 * Finance domain permission catalog (Mission P-009.14 · ADR-009 · ES-FIN-002 §6).
 */

import { buildPermissionCode, type PermissionCode } from "@/lib/platform/security/Permission";

/** Canonical Finance permission codes — `finance:resource:action` format (ADR-009). */
export const FINANCE_PERMISSIONS = {
  admin: buildPermissionCode("finance", "admin", "manage"),
  journalCreate: buildPermissionCode("finance", "journal", "create"),
  journalPost: buildPermissionCode("finance", "journal", "post"),
  journalReverse: buildPermissionCode("finance", "journal", "reverse"),
  journalRead: buildPermissionCode("finance", "journal", "read"),
  coaRead: buildPermissionCode("finance", "coa", "read"),
  coaWrite: buildPermissionCode("finance", "coa", "write"),
  periodRead: buildPermissionCode("finance", "period", "read"),
  periodClose: buildPermissionCode("finance", "period", "close"),
  periodReopen: buildPermissionCode("finance", "period", "reopen"),
  paymentRead: buildPermissionCode("finance", "payment", "read"),
  paymentWrite: buildPermissionCode("finance", "payment", "write"),
  auditRead: buildPermissionCode("finance", "audit", "read"),
  eventReplay: buildPermissionCode("finance", "event", "replay"),
  intelligenceRead: buildPermissionCode("finance", "intelligence", "read"),
  configurationManage: buildPermissionCode("finance", "configuration", "manage"),
} as const;

export type FinancePermissionCode = (typeof FINANCE_PERMISSIONS)[keyof typeof FINANCE_PERMISSIONS];

export type FinanceRoutePermissionRule = {
  readonly method: string;
  readonly pathPattern: RegExp;
  readonly permission: PermissionCode;
};

const FINANCE_ROUTE_RULES: readonly FinanceRoutePermissionRule[] = [
  { method: "GET", pathPattern: /^\/api\/finance\/accounts(?:\/|$)/, permission: FINANCE_PERMISSIONS.coaRead },
  { method: "GET", pathPattern: /^\/api\/finance\/accounts\/hierarchy/, permission: FINANCE_PERMISSIONS.coaRead },
  { method: "POST", pathPattern: /^\/api\/finance\/accounts(?:\/|$)/, permission: FINANCE_PERMISSIONS.coaWrite },
  { method: "PATCH", pathPattern: /^\/api\/finance\/accounts\//, permission: FINANCE_PERMISSIONS.coaWrite },
  { method: "PUT", pathPattern: /^\/api\/finance\/accounts\//, permission: FINANCE_PERMISSIONS.coaWrite },
  { method: "DELETE", pathPattern: /^\/api\/finance\/accounts\//, permission: FINANCE_PERMISSIONS.coaWrite },
  { method: "GET", pathPattern: /^\/api\/finance\/ledger\//, permission: FINANCE_PERMISSIONS.journalRead },
  { method: "POST", pathPattern: /^\/api\/finance\/ledger\/postings/, permission: FINANCE_PERMISSIONS.journalPost },
  { method: "POST", pathPattern: /^\/api\/finance\/ledger\/opening-balances/, permission: FINANCE_PERMISSIONS.journalCreate },
  { method: "POST", pathPattern: /^\/api\/finance\/ledger\/periods\/[^/]+\/close/, permission: FINANCE_PERMISSIONS.periodClose },
  { method: "POST", pathPattern: /^\/api\/finance\/ledger\/periods\/[^/]+\/reconcile/, permission: FINANCE_PERMISSIONS.journalPost },
  { method: "GET", pathPattern: /^\/api\/finance\/periods(?:\/|$)/, permission: FINANCE_PERMISSIONS.periodRead },
  { method: "GET", pathPattern: /^\/api\/finance\/periods\/calendar/, permission: FINANCE_PERMISSIONS.periodRead },
  { method: "GET", pathPattern: /^\/api\/finance\/periods\/inquiry/, permission: FINANCE_PERMISSIONS.periodRead },
  { method: "POST", pathPattern: /^\/api\/finance\/periods\/[^/]+\/open/, permission: FINANCE_PERMISSIONS.periodClose },
  { method: "POST", pathPattern: /^\/api\/finance\/periods\/[^/]+\/soft-close/, permission: FINANCE_PERMISSIONS.periodClose },
  { method: "POST", pathPattern: /^\/api\/finance\/periods\/[^/]+\/hard-close/, permission: FINANCE_PERMISSIONS.periodClose },
  { method: "POST", pathPattern: /^\/api\/finance\/periods\/[^/]+\/reopen/, permission: FINANCE_PERMISSIONS.periodReopen },
  { method: "POST", pathPattern: /^\/api\/finance\/periods\/years\/[^/]+\/close/, permission: FINANCE_PERMISSIONS.periodClose },
  { method: "GET", pathPattern: /^\/api\/finance\/intelligence\//, permission: FINANCE_PERMISSIONS.intelligenceRead },
  { method: "GET", pathPattern: /^\/api\/finance\/events\/pipeline(?:\/|$)/, permission: FINANCE_PERMISSIONS.auditRead },
  { method: "GET", pathPattern: /^\/api\/finance\/events\/pipeline\/[^/]+/, permission: FINANCE_PERMISSIONS.auditRead },
  { method: "POST", pathPattern: /^\/api\/finance\/events\/pipeline\/intake/, permission: FINANCE_PERMISSIONS.configurationManage },
  { method: "POST", pathPattern: /^\/api\/finance\/events\/pipeline\/registration/, permission: FINANCE_PERMISSIONS.configurationManage },
  { method: "POST", pathPattern: /^\/api\/finance\/events\/pipeline\/[^/]+/, permission: FINANCE_PERMISSIONS.eventReplay },
  { method: "GET", pathPattern: /^\/api\/finance\/events\/pipeline\/dead-letters/, permission: FINANCE_PERMISSIONS.auditRead },
];

/** Resolves required Finance permission for an API route. Default deny for unknown mutating routes. */
export function resolveFinanceRoutePermission(method: string, pathname: string): PermissionCode | null {
  const normalizedMethod = method.toUpperCase();

  for (const rule of FINANCE_ROUTE_RULES) {
    if (rule.method === normalizedMethod && rule.pathPattern.test(pathname)) {
      return rule.permission;
    }
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod) && pathname.startsWith("/api/finance/")) {
    return buildPermissionCode("finance", "unknown", "write");
  }

  if (normalizedMethod === "GET" && pathname.startsWith("/api/finance/")) {
    return FINANCE_PERMISSIONS.journalRead;
  }

  return null;
}

export function listFinanceRouteRules(): readonly FinanceRoutePermissionRule[] {
  return FINANCE_ROUTE_RULES;
}
