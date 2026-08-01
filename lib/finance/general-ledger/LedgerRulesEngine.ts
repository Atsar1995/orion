import type {
  LedgerOpeningBalanceInput,
  LedgerPostingInput,
  LedgerPostingLineInput,
} from "@/types/finance-general-ledger";
import { isPeriodPostingAllowed } from "@/types/finance-period";
import type { ChartOfAccountsRepository } from "@/lib/finance/repositories/ChartOfAccountsRepository";
import type { GeneralLedgerRepository } from "@/lib/finance/repositories/GeneralLedgerRepository";
import type { PeriodRepository } from "@/lib/finance/repositories/PeriodRepository";

export type LedgerValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
};

const ISO_CURRENCY = /^[A-Z]{3}$/;

/** General Ledger validation rules (Mission P-009.3). */
export class LedgerRulesEngine {
  constructor(
    private readonly ledgerRepository: GeneralLedgerRepository,
    private readonly periodRepository: PeriodRepository,
    private readonly chartOfAccountsRepository: ChartOfAccountsRepository,
  ) {}

  validatePosting(input: LedgerPostingInput, organizationId: string): LedgerValidationIssue[] {
    const issues: LedgerValidationIssue[] = [];

    issues.push(...this.validatePeriod(organizationId, input.periodId));
    issues.push(...this.validateCurrency(input.currency));

    if (!input.correlationId.trim()) {
      issues.push({ code: "CORRELATION_REQUIRED", message: "Correlation ID is required", field: "correlationId" });
    }

    if (!input.auditReference.trim()) {
      issues.push({ code: "AUDIT_REFERENCE_REQUIRED", message: "Audit reference is required", field: "auditReference" });
    }

    if (!input.idempotencyKey.trim()) {
      issues.push({ code: "IDEMPOTENCY_REQUIRED", message: "Idempotency key is required", field: "idempotencyKey" });
    } else if (this.ledgerRepository.findPostingByIdempotencyKey(organizationId, input.idempotencyKey)) {
      issues.push({ code: "DUPLICATE_POSTING", message: "Posting with this idempotency key already exists", field: "idempotencyKey" });
    }

    if (input.lines.length < 2) {
      issues.push({ code: "MINIMUM_LINES", message: "Posting requires at least two lines", field: "lines" });
    }

    issues.push(...this.validateLines(input.lines, organizationId, input.currency));

    const totalDebit = input.lines.reduce((sum, line) => sum + line.debitAmount, 0);
    const totalCredit = input.lines.reduce((sum, line) => sum + line.creditAmount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.0001) {
      issues.push({ code: "UNBALANCED_POSTING", message: "Total debits must equal total credits", field: "lines" });
    }

    return issues;
  }

  validateOpeningBalance(input: LedgerOpeningBalanceInput, organizationId: string): LedgerValidationIssue[] {
    const issues: LedgerValidationIssue[] = [];

    issues.push(...this.validatePeriod(organizationId, input.periodId));
    issues.push(...this.validateCurrency(input.currency));

    const account = this.chartOfAccountsRepository.findById(organizationId, input.accountId);
    if (!account) {
      issues.push({ code: "ACCOUNT_NOT_FOUND", message: "Account not found", field: "accountId" });
    } else if (!account.postingAllowed) {
      issues.push({ code: "POSTING_NOT_ALLOWED", message: "Account does not allow posting", field: "accountId" });
    }

    if (input.debitAmount < 0 || input.creditAmount < 0) {
      issues.push({ code: "NEGATIVE_AMOUNT", message: "Amounts cannot be negative", field: "amount" });
    }

    if (input.debitAmount > 0 && input.creditAmount > 0) {
      issues.push({ code: "INVALID_OPENING", message: "Opening balance cannot have both debit and credit", field: "amount" });
    }

    return issues;
  }

  validateLedgerConsistency(organizationId: string, periodId: string): LedgerValidationIssue[] {
    const issues: LedgerValidationIssue[] = [];
    const balances = this.ledgerRepository.listBalances(organizationId, periodId);

    let totalDebit = 0;
    let totalCredit = 0;

    for (const balance of balances) {
      totalDebit += balance.closingDebit;
      totalCredit += balance.closingCredit;

      const expectedRunning = balance.closingDebit - balance.closingCredit;
      if (Math.abs(balance.runningBalance - expectedRunning) > 0.0001) {
        issues.push({
          code: "RUNNING_BALANCE_MISMATCH",
          message: `Running balance mismatch for account ${balance.accountId}`,
          field: "runningBalance",
        });
      }
    }

    if (Math.abs(totalDebit - totalCredit) > 0.0001) {
      issues.push({ code: "TRIAL_BALANCE_IMBALANCE", message: "Trial balance does not net to zero" });
    }

    return issues;
  }

  private validatePeriod(organizationId: string, periodId: string): LedgerValidationIssue[] {
    const period = this.periodRepository.findById(organizationId, periodId);
    if (!period) {
      return [{ code: "PERIOD_NOT_FOUND", message: "Accounting period not found", field: "periodId" }];
    }
    if (!isPeriodPostingAllowed(period.state)) {
      return [{ code: "PERIOD_CLOSED", message: "Cannot post to a closed period", field: "periodId" }];
    }
    return [];
  }

  private validateCurrency(currency: string): LedgerValidationIssue[] {
    if (!ISO_CURRENCY.test(currency)) {
      return [{ code: "INVALID_CURRENCY", message: "Currency must be a 3-letter ISO code", field: "currency" }];
    }
    return [];
  }

  private validateLines(
    lines: readonly LedgerPostingLineInput[],
    organizationId: string,
    currency: string,
  ): LedgerValidationIssue[] {
    const issues: LedgerValidationIssue[] = [];

    for (const line of lines) {
      const account = this.chartOfAccountsRepository.findById(organizationId, line.accountId);
      if (!account) {
        issues.push({ code: "ACCOUNT_NOT_FOUND", message: `Account ${line.accountId} not found`, field: "accountId" });
        continue;
      }

      if (account.status !== "active") {
        issues.push({ code: "ACCOUNT_INACTIVE", message: `Account ${account.code} is not active`, field: "accountId" });
      }

      if (!account.postingAllowed) {
        issues.push({ code: "POSTING_NOT_ALLOWED", message: `Account ${account.code} does not allow posting`, field: "accountId" });
      }

      if (line.debitAmount < 0 || line.creditAmount < 0) {
        issues.push({ code: "NEGATIVE_AMOUNT", message: "Line amounts cannot be negative", field: "lines" });
      }

      if (line.debitAmount > 0 && line.creditAmount > 0) {
        issues.push({ code: "INVALID_LINE", message: "Line cannot have both debit and credit", field: "lines" });
      }

      if (line.debitAmount === 0 && line.creditAmount === 0) {
        issues.push({ code: "ZERO_LINE", message: "Line must have a debit or credit amount", field: "lines" });
      }

      void currency;
    }

    return issues;
  }
}
