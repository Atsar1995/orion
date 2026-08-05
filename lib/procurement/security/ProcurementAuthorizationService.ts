/**
 * Procurement domain authorization service (Mission P-010.5 · ADR-009).
 */

import "@/lib/procurement/security";

import type { PermissionCode } from "@/lib/platform/security/Permission";
import type { AuthorizationOptions } from "@/lib/platform/security/AuthorizationService";
import {
  AuthorizationService,
  defaultAuthorizationService,
} from "@/lib/platform/security/AuthorizationService";
import type { AuthorizationResult } from "@/lib/platform/security/AuthorizationResult";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import type { ServiceContext } from "@/types/services";

/** Domain authorization helpers for Procurement services and future API routes. */
export class ProcurementAuthorizationService {
  constructor(
    private readonly authorizationService: AuthorizationService = defaultAuthorizationService,
  ) {}

  authorize(
    context: ServiceContext,
    permission: PermissionCode,
    options: AuthorizationOptions = {},
  ): AuthorizationResult {
    return this.authorizationService.authorizeServiceContext(context, permission, options);
  }

  isAuthorized(context: ServiceContext, permission: PermissionCode): boolean {
    return this.authorize(context, permission).allowed;
  }

  canAdministerProcurement(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.admin);
  }

  canCreateSupplier(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.supplierWrite);
  }

  canApproveSupplier(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.vendorApprove);
  }

  canCreateRequisition(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.requisitionCreate);
  }

  canApproveRequisition(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.requisitionApprove);
  }

  canCreatePurchaseOrder(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.purchaseOrderCreate);
  }

  canApprovePurchaseOrder(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.purchaseOrderApprove);
  }

  canReceiveGoods(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.goodsReceiptWrite);
  }

  canApproveInvoice(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.invoiceApprove);
  }

  canManageContracts(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.contractWrite);
  }

  canReplayEvents(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.eventReplay);
  }

  canManageConfiguration(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.configurationManage);
  }

  canReadIntelligence(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.intelligenceRead);
  }

  canReadAudit(context: ServiceContext): boolean {
    return this.isAuthorized(context, PROCUREMENT_PERMISSIONS.auditRead);
  }
}

export const defaultProcurementAuthorizationService = new ProcurementAuthorizationService();
