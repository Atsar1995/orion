/**
 * Finance domain authorization service (Mission P-009.14 · ADR-009).
 */

import "@/lib/finance/security";

import type { PermissionCode } from "@/lib/platform/security/Permission";
import type { AuthorizationOptions } from "@/lib/platform/security/AuthorizationService";
import {
  AuthorizationService,
  defaultAuthorizationService,
} from "@/lib/platform/security/AuthorizationService";
import type { AuthorizationResult } from "@/lib/platform/security/AuthorizationResult";
import { FINANCE_PERMISSIONS } from "@/lib/finance/security/finance-permission-catalog";
import type { ServiceContext } from "@/types/services";

/** Domain authorization helpers for Finance services and validation stages. */
export class FinanceAuthorizationService {
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

  canPostJournal(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.journalPost);
  }

  canCreateJournal(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.journalCreate);
  }

  canReverseJournal(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.journalReverse);
  }

  canReadJournal(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.journalRead);
  }

  canClosePeriod(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.periodClose);
  }

  canReopenPeriod(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.periodReopen);
  }

  canReadCoa(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.coaRead);
  }

  canWriteCoa(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.coaWrite);
  }

  canReplayEvent(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.eventReplay);
  }

  canReadAudit(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.auditRead);
  }

  canReadIntelligence(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.intelligenceRead);
  }

  canManageConfiguration(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.configurationManage);
  }

  canAdministerFinance(context: ServiceContext): boolean {
    return this.isAuthorized(context, FINANCE_PERMISSIONS.admin);
  }
}

export const defaultFinanceAuthorizationService = new FinanceAuthorizationService();
