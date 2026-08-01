import type {
  AccountType,
  ChartOfAccountRecord,
  CreateChartOfAccountInput,
  ModifyChartOfAccountInput,
} from "@/types/finance-chart-of-accounts";
import { ACCOUNT_NUMBERING_CLASS } from "@/types/finance-chart-of-accounts";
import type { ChartOfAccountsRepository } from "@/lib/finance/repositories/ChartOfAccountsRepository";

const CODE_PATTERN = /^\d{4}$/;

export type CoaValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
};

/** Chart of Accounts validation rules (Mission P-009.2). */
export class CoaRulesEngine {
  constructor(private readonly repository: ChartOfAccountsRepository) {}

  validateCreate(
    input: CreateChartOfAccountInput,
    organizationId: string,
  ): CoaValidationIssue[] {
    const issues: CoaValidationIssue[] = [];

    issues.push(...this.validateCode(input.code, input.accountType));
    issues.push(...this.validateName(input.name));

    if (this.repository.findByCode(organizationId, input.code.trim())) {
      issues.push({
        code: "DUPLICATE_ACCOUNT_CODE",
        message: "Account code must be unique within the organization",
        field: "code",
      });
    }

    if (input.parentAccountId) {
      issues.push(
        ...this.validateParent(
          organizationId,
          input.parentAccountId,
          input.accountType,
          undefined,
        ),
      );
    }

    if (input.isControlAccount && input.postingAllowed === false) {
      issues.push({
        code: "CONTROL_ACCOUNT_POSTING",
        message: "Control accounts should allow posting",
        field: "postingAllowed",
      });
    }

    if (input.status === "archived") {
      issues.push({
        code: "INVALID_INITIAL_STATUS",
        message: "New accounts cannot be created as archived",
        field: "status",
      });
    }

    return issues;
  }

  validateUpdate(
    existing: ChartOfAccountRecord,
    input: ModifyChartOfAccountInput,
    organizationId: string,
  ): CoaValidationIssue[] {
    const issues: CoaValidationIssue[] = [];

    if (input.name !== undefined) {
      issues.push(...this.validateName(input.name));
    }

    if (input.status === "archived" && existing.status === "active") {
      const children = this.repository.listChildren(organizationId, existing.id);
      if (children.some((child) => child.status === "active")) {
        issues.push({
          code: "ARCHIVE_WITH_ACTIVE_CHILDREN",
          message: "Cannot archive account with active child accounts",
          field: "status",
        });
      }
    }

    if (input.parentAccountId !== undefined && input.parentAccountId !== null) {
      issues.push(
        ...this.validateParent(
          organizationId,
          input.parentAccountId,
          existing.accountType,
          existing.id,
        ),
      );
    }

    if (input.parentAccountId === existing.id) {
      issues.push({
        code: "CIRCULAR_PARENT",
        message: "Account cannot be its own parent",
        field: "parentAccountId",
      });
    }

    return issues;
  }

  validateHierarchyIntegrity(organizationId: string): CoaValidationIssue[] {
    const accounts = this.repository.list(organizationId);
    const issues: CoaValidationIssue[] = [];

    for (const account of accounts) {
      if (!account.parentAccountId) continue;

      if (this.detectCycle(organizationId, account.id, account.parentAccountId)) {
        issues.push({
          code: "HIERARCHY_CYCLE",
          message: `Circular reference detected for account ${account.code}`,
          field: "parentAccountId",
        });
      }
    }

    return issues;
  }

  private validateCode(code: string, accountType: AccountType): CoaValidationIssue[] {
    const trimmed = code.trim();
    const issues: CoaValidationIssue[] = [];

    if (!trimmed) {
      issues.push({ code: "CODE_REQUIRED", message: "Account code is required", field: "code" });
      return issues;
    }

    if (!CODE_PATTERN.test(trimmed)) {
      issues.push({
        code: "INVALID_CODE_FORMAT",
        message: "Account code must be a 4-digit number",
        field: "code",
      });
      return issues;
    }

    const expectedPrefix = ACCOUNT_NUMBERING_CLASS[accountType];
    if (!trimmed.startsWith(expectedPrefix)) {
      issues.push({
        code: "CODE_TYPE_MISMATCH",
        message: `Account code for ${accountType} should start with ${expectedPrefix}`,
        field: "code",
      });
    }

    return issues;
  }

  private validateName(name: string): CoaValidationIssue[] {
    if (!name.trim()) {
      return [{ code: "NAME_REQUIRED", message: "Account name is required", field: "name" }];
    }
    return [];
  }

  private validateParent(
    organizationId: string,
    parentAccountId: string,
    childType: AccountType,
    excludeAccountId?: string,
  ): CoaValidationIssue[] {
    const issues: CoaValidationIssue[] = [];
    const parent = this.repository.findById(organizationId, parentAccountId);

    if (!parent) {
      issues.push({
        code: "PARENT_NOT_FOUND",
        message: "Parent account does not exist",
        field: "parentAccountId",
      });
      return issues;
    }

    if (parent.organizationId !== organizationId) {
      issues.push({
        code: "PARENT_ORG_MISMATCH",
        message: "Parent account must belong to the same organization",
        field: "parentAccountId",
      });
    }

    if (parent.status === "archived") {
      issues.push({
        code: "PARENT_ARCHIVED",
        message: "Cannot assign archived parent account",
        field: "parentAccountId",
      });
    }

    if (parent.accountType !== childType) {
      issues.push({
        code: "PARENT_TYPE_MISMATCH",
        message: "Parent account type must match child account type",
        field: "parentAccountId",
      });
    }

    if (excludeAccountId && this.detectCycle(organizationId, excludeAccountId, parentAccountId)) {
      issues.push({
        code: "CIRCULAR_REFERENCE",
        message: "Parent assignment would create a circular hierarchy",
        field: "parentAccountId",
      });
    }

    return issues;
  }

  private detectCycle(
    organizationId: string,
    accountId: string,
    proposedParentId: string,
  ): boolean {
    const visited = new Set<string>();
    let current: string | undefined = proposedParentId;

    while (current) {
      if (current === accountId) return true;
      if (visited.has(current)) return true;
      visited.add(current);

      const parent = this.repository.findById(organizationId, current);
      current = parent?.parentAccountId;
    }

    return false;
  }
}
