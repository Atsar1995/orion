/**
 * Procurement domain permission catalog (Mission P-010.5 · ADR-009).
 */

import { buildPermissionCode, type PermissionCode } from "@/lib/platform/security/Permission";

/** Canonical Procurement permission codes — `procurement:resource:action` format (ADR-009). */
export const PROCUREMENT_PERMISSIONS = {
  admin: buildPermissionCode("procurement", "admin", "manage"),
  supplierRead: buildPermissionCode("procurement", "supplier", "read"),
  supplierWrite: buildPermissionCode("procurement", "supplier", "write"),
  vendorApprove: buildPermissionCode("procurement", "vendor", "approve"),
  requisitionRead: buildPermissionCode("procurement", "requisition", "read"),
  requisitionCreate: buildPermissionCode("procurement", "requisition", "create"),
  requisitionApprove: buildPermissionCode("procurement", "requisition", "approve"),
  rfqRead: buildPermissionCode("procurement", "rfq", "read"),
  rfqWrite: buildPermissionCode("procurement", "rfq", "write"),
  quotationRead: buildPermissionCode("procurement", "quotation", "read"),
  quotationWrite: buildPermissionCode("procurement", "quotation", "write"),
  purchaseOrderRead: buildPermissionCode("procurement", "purchaseorder", "read"),
  purchaseOrderCreate: buildPermissionCode("procurement", "purchaseorder", "create"),
  purchaseOrderApprove: buildPermissionCode("procurement", "purchaseorder", "approve"),
  goodsReceiptRead: buildPermissionCode("procurement", "goodsreceipt", "read"),
  goodsReceiptWrite: buildPermissionCode("procurement", "goodsreceipt", "write"),
  invoiceRead: buildPermissionCode("procurement", "invoice", "read"),
  invoiceApprove: buildPermissionCode("procurement", "invoice", "approve"),
  contractRead: buildPermissionCode("procurement", "contract", "read"),
  contractWrite: buildPermissionCode("procurement", "contract", "write"),
  auditRead: buildPermissionCode("procurement", "audit", "read"),
  configurationManage: buildPermissionCode("procurement", "configuration", "manage"),
  eventReplay: buildPermissionCode("procurement", "event", "replay"),
  intelligenceRead: buildPermissionCode("procurement", "intelligence", "read"),
} as const;

export type ProcurementPermissionCode =
  (typeof PROCUREMENT_PERMISSIONS)[keyof typeof PROCUREMENT_PERMISSIONS];

export type ProcurementRoutePermissionRule = {
  readonly method: string;
  readonly pathPattern: RegExp;
  readonly permission: PermissionCode;
};

const PROCUREMENT_ROUTE_RULES: readonly ProcurementRoutePermissionRule[] = [
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/vendors\/[^/]+\/approve/,
    permission: PROCUREMENT_PERMISSIONS.vendorApprove,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/vendors\/[^/]+\/(?:activate|deactivate)/,
    permission: PROCUREMENT_PERMISSIONS.supplierWrite,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/vendors\/[^/]+\/(?:contacts|scorecards)/,
    permission: PROCUREMENT_PERMISSIONS.supplierRead,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/vendors\/[^/]+\/(?:contacts|scorecards)/,
    permission: PROCUREMENT_PERMISSIONS.supplierWrite,
  },
  {
    method: "PATCH",
    pathPattern: /^\/api\/procurement\/vendors\/[^/]+\/(?:contacts|scorecards)\//,
    permission: PROCUREMENT_PERMISSIONS.supplierWrite,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/vendors\/[^/]+$/,
    permission: PROCUREMENT_PERMISSIONS.supplierRead,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/vendors(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.supplierRead,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/vendors(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.supplierWrite,
  },
  {
    method: "PATCH",
    pathPattern: /^\/api\/procurement\/vendors\//,
    permission: PROCUREMENT_PERMISSIONS.supplierWrite,
  },
  {
    method: "PUT",
    pathPattern: /^\/api\/procurement\/vendors\//,
    permission: PROCUREMENT_PERMISSIONS.supplierWrite,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/requisitions\/[^/]+\/approve/,
    permission: PROCUREMENT_PERMISSIONS.requisitionApprove,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/requisitions\/[^/]+\/(?:submit|cancel)/,
    permission: PROCUREMENT_PERMISSIONS.requisitionCreate,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/requisitions\/[^/]+\/(?:reject|close)/,
    permission: PROCUREMENT_PERMISSIONS.requisitionApprove,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/requisitions\/[^/]+\/approval/,
    permission: PROCUREMENT_PERMISSIONS.requisitionRead,
  },
  {
    method: "PATCH",
    pathPattern: /^\/api\/procurement\/requisitions\//,
    permission: PROCUREMENT_PERMISSIONS.requisitionCreate,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/requisitions\/[^/]+$/,
    permission: PROCUREMENT_PERMISSIONS.requisitionRead,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/requisitions(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.requisitionRead,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/requisitions(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.requisitionCreate,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/rfqs(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.rfqRead,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/rfqs(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.rfqWrite,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/quotations(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.quotationRead,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/quotations(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.quotationWrite,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/purchase-orders\/[^/]+\/approve/,
    permission: PROCUREMENT_PERMISSIONS.purchaseOrderApprove,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/purchase-orders\/[^/]+\/(?:submit|cancel)/,
    permission: PROCUREMENT_PERMISSIONS.purchaseOrderCreate,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/purchase-orders\/[^/]+\/close/,
    permission: PROCUREMENT_PERMISSIONS.purchaseOrderApprove,
  },
  {
    method: "PATCH",
    pathPattern: /^\/api\/procurement\/purchase-orders\//,
    permission: PROCUREMENT_PERMISSIONS.purchaseOrderCreate,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/purchase-orders\/[^/]+$/,
    permission: PROCUREMENT_PERMISSIONS.purchaseOrderRead,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/purchase-orders(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.purchaseOrderRead,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/purchase-orders(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.purchaseOrderCreate,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/goods-receipts(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.goodsReceiptRead,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/goods-receipts(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/goods-receipts\/[^/]+\/lines/,
    permission: PROCUREMENT_PERMISSIONS.goodsReceiptRead,
  },
  {
    method: "PATCH",
    pathPattern: /^\/api\/procurement\/goods-receipts\/[^/]+\/lines\//,
    permission: PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
  },
  {
    method: "PATCH",
    pathPattern: /^\/api\/procurement\/goods-receipts\//,
    permission: PROCUREMENT_PERMISSIONS.goodsReceiptWrite,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/goods-receipts\/[^/]+$/,
    permission: PROCUREMENT_PERMISSIONS.goodsReceiptRead,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/invoices\/[^/]+\/approve/,
    permission: PROCUREMENT_PERMISSIONS.invoiceApprove,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/invoices(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.invoiceRead,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/invoices(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.invoiceRead,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/contracts(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.contractRead,
  },
  {
    method: "POST",
    pathPattern: /^\/api\/procurement\/contracts(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.contractWrite,
  },
  {
    method: "PATCH",
    pathPattern: /^\/api\/procurement\/contracts\//,
    permission: PROCUREMENT_PERMISSIONS.contractWrite,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/contracts\/[^/]+$/,
    permission: PROCUREMENT_PERMISSIONS.contractRead,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/analytics(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.intelligenceRead,
  },
  {
    method: "GET",
    pathPattern: /^\/api\/procurement\/executive(?:\/|$)/,
    permission: PROCUREMENT_PERMISSIONS.intelligenceRead,
  },
];

/** Resolves required Procurement permission for an API route. Default deny for unknown mutating routes. */
export function resolveProcurementRoutePermission(
  method: string,
  pathname: string,
): PermissionCode | null {
  const normalizedMethod = method.toUpperCase();

  for (const rule of PROCUREMENT_ROUTE_RULES) {
    if (rule.method === normalizedMethod && rule.pathPattern.test(pathname)) {
      return rule.permission;
    }
  }

  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(normalizedMethod) &&
    pathname.startsWith("/api/procurement/")
  ) {
    return buildPermissionCode("procurement", "unknown", "write");
  }

  if (normalizedMethod === "GET" && pathname.startsWith("/api/procurement/")) {
    return PROCUREMENT_PERMISSIONS.requisitionRead;
  }

  return null;
}

export function listProcurementRouteRules(): readonly ProcurementRoutePermissionRule[] {
  return PROCUREMENT_ROUTE_RULES;
}
