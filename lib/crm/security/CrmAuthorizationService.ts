/**
 * CRM domain authorization service (Mission P-008.12 · ADR-009).
 */

import "@/lib/crm/security";

import type { PermissionCode } from "@/lib/platform/security/Permission";
import type { AuthorizationOptions } from "@/lib/platform/security/AuthorizationService";
import {
  AuthorizationService,
  defaultAuthorizationService,
} from "@/lib/platform/security/AuthorizationService";
import type { AuthorizationResult } from "@/lib/platform/security/AuthorizationResult";
import { CRM_PERMISSIONS } from "@/lib/crm/security/crm-permission-catalog";
import type { ServiceContext } from "@/types/services";

/** Domain authorization helpers for CRM services and future API routes. */
export class CrmAuthorizationService {
  constructor(private readonly authorizationService: AuthorizationService = defaultAuthorizationService) {}

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

  canAdministerCrm(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.admin);
  }

  canCreateLead(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.leadCreate);
  }

  canQualifyLead(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.leadQualify);
  }

  canCreateOpportunity(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.opportunityWrite);
  }

  canCreateQuote(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.quoteWrite);
  }

  canApproveQuote(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.quoteWrite);
  }

  canCreateSalesOrder(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.salesOrderWrite);
  }

  canManageAccount(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.accountWrite);
  }

  canManageContact(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.contactWrite);
  }

  canManageCase(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.caseWrite);
  }

  canReplayEvents(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.eventReplay);
  }

  canManageConfiguration(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.configurationManage);
  }

  canReadIntelligence(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.intelligenceRead);
  }

  canReadAudit(context: ServiceContext): boolean {
    return this.isAuthorized(context, CRM_PERMISSIONS.auditRead);
  }
}

export const defaultCrmAuthorizationService = new CrmAuthorizationService();
