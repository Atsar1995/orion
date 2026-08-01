import { randomUUID } from "crypto";
import { LedgerRulesEngine } from "@/lib/finance/general-ledger/LedgerRulesEngine";
import { publishLedgerEvent } from "@/lib/finance/general-ledger/ledger-events";
import type {
  LedgerAccountBalanceView,
  LedgerConsistencyResult,
  LedgerInquiryView,
  TrialBalanceView,
} from "@/lib/finance/models/general-ledger";
import type { ChartOfAccountsRepository } from "@/lib/finance/repositories/ChartOfAccountsRepository";
import type { GeneralLedgerRepository } from "@/lib/finance/repositories/GeneralLedgerRepository";
import type { PeriodRepository } from "@/lib/finance/repositories/PeriodRepository";
import type { FiscalPeriodRecord } from "@/types/finance-period";
import type {
  ConsumedFinancialEventRecord,
  LedgerBalanceRecord,
  LedgerInquiryQuery,
  LedgerOpeningBalanceInput,
  LedgerPostingInput,
  LedgerPostingRecord,
} from "@/types/finance-general-ledger";
import type { PublishFinanceEventInput } from "@/types/finance-events";
import type { ServiceContext } from "@/types/services";

function todayIso(): string {
  return new Date().toISOString();
}

/** General Ledger service — authoritative balances (Mission P-009.3). */
export class GeneralLedgerService {
  readonly rules: LedgerRulesEngine;

  constructor(
    private readonly ledgerRepository: GeneralLedgerRepository,
    private readonly periodRepository: PeriodRepository,
    private readonly chartOfAccountsRepository: ChartOfAccountsRepository,
  ) {
    this.rules = new LedgerRulesEngine(ledgerRepository, periodRepository, chartOfAccountsRepository);
  }

  listPeriods(context: ServiceContext): readonly FiscalPeriodRecord[] {
    return this.periodRepository.list(context.organizationId);
  }

  getPeriod(periodId: string, context: ServiceContext): FiscalPeriodRecord | null {
    return this.periodRepository.findById(context.organizationId, periodId);
  }

  getCurrentPeriod(context: ServiceContext): FiscalPeriodRecord | null {
    return this.periodRepository.getCurrentPeriod(context.organizationId);
  }

  getAccountBalance(
    accountId: string,
    periodId: string,
    context: ServiceContext,
  ): LedgerAccountBalanceView | null {
    const balance = this.ledgerRepository.getBalance(context.organizationId, accountId, periodId);
    if (!balance) return null;

    const account = this.chartOfAccountsRepository.findById(context.organizationId, accountId);
    if (!account) return null;

    return {
      ...balance,
      accountCode: account.code,
      accountName: account.name,
      accountType: account.accountType,
    };
  }

  getTrialBalance(periodId: string, context: ServiceContext): TrialBalanceView {
    const balances = this.ledgerRepository.listBalances(context.organizationId, periodId);
    const currency = balances[0]?.currency ?? "ZAR";

    const lines = balances
      .map((balance) => {
        const account = this.chartOfAccountsRepository.findById(context.organizationId, balance.accountId);
        if (!account) return null;

        return {
          accountId: balance.accountId,
          accountCode: account.code,
          accountName: account.name,
          accountType: account.accountType,
          debitTotal: balance.closingDebit,
          creditTotal: balance.closingCredit,
          runningBalance: balance.runningBalance,
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null)
      .sort((a, b) => a.accountCode.localeCompare(b.accountCode));

    const totalDebit = lines.reduce((sum, line) => sum + line.debitTotal, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.creditTotal, 0);

    return {
      periodId,
      currency,
      lines,
      totalDebit,
      totalCredit,
      balanced: Math.abs(totalDebit - totalCredit) < 0.0001,
    };
  }

  inquiry(query: LedgerInquiryQuery, context: ServiceContext): LedgerInquiryView {
    const periodId = query.periodId ?? this.periodRepository.getCurrentPeriod(context.organizationId)?.id;
    if (!periodId) {
      return { balances: [], recentPostings: [], totalAccounts: 0 };
    }

    let balances = this.ledgerRepository.listBalances(context.organizationId, periodId);

    if (query.accountId) {
      balances = balances.filter((balance) => balance.accountId === query.accountId);
    }

    if (query.currency) {
      balances = balances.filter((balance) => balance.currency === query.currency);
    }

    const balanceViews = balances
      .map((balance) => this.getAccountBalance(balance.accountId, periodId, context))
      .filter((view): view is LedgerAccountBalanceView => view !== null);

    const recentPostings = this.ledgerRepository
      .listPostings(context.organizationId, periodId)
      .slice(-10);

    return {
      balances: balanceViews,
      recentPostings,
      totalAccounts: balanceViews.length,
    };
  }

  applyOpeningBalance(input: LedgerOpeningBalanceInput, context: ServiceContext): LedgerBalanceRecord {
    const issues = this.rules.validateOpeningBalance(input, context.organizationId);
    if (issues.length > 0) {
      throw new Error(issues[0]?.code ?? "LEDGER_VALIDATION_FAILED");
    }

    const existing = this.ledgerRepository.getBalance(
      context.organizationId,
      input.accountId,
      input.periodId,
    );

    const runningBalance = input.debitAmount - input.creditAmount;
    const now = todayIso();

    const balance: LedgerBalanceRecord = {
      id: existing?.id ?? randomUUID(),
      organizationId: context.organizationId,
      accountId: input.accountId,
      periodId: input.periodId,
      currency: input.currency,
      openingDebit: input.debitAmount,
      openingCredit: input.creditAmount,
      periodDebit: existing?.periodDebit ?? 0,
      periodCredit: existing?.periodCredit ?? 0,
      closingDebit: input.debitAmount + (existing?.periodDebit ?? 0),
      closingCredit: input.creditAmount + (existing?.periodCredit ?? 0),
      runningBalance: runningBalance + (existing?.periodDebit ?? 0) - (existing?.periodCredit ?? 0),
      updatedAt: now,
    };

    return this.ledgerRepository.upsertBalance(balance);
  }

  /** Ledger posting interface — applies balanced entries without journal engine (P-009.4). */
  applyPosting(input: LedgerPostingInput, context: ServiceContext): LedgerPostingRecord {
    const issues = this.rules.validatePosting(input, context.organizationId);
    if (issues.length > 0) {
      publishLedgerEvent(
        {
          eventType: "LedgerValidationFailed",
          entityType: "ledger_posting",
          entityId: input.idempotencyKey,
          correlationId: input.correlationId,
          payload: { code: issues[0]?.code ?? "VALIDATION_FAILED" },
        },
        context,
      );
      throw new Error(issues[0]?.code ?? "LEDGER_VALIDATION_FAILED");
    }

    const totalDebit = input.lines.reduce((sum, line) => sum + line.debitAmount, 0);
    const totalCredit = input.lines.reduce((sum, line) => sum + line.creditAmount, 0);
    const now = todayIso();

    for (const line of input.lines) {
      this.applyLineToBalance(input.periodId, input.currency, line, context, now);
    }

    const posting: LedgerPostingRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      periodId: input.periodId,
      currency: input.currency,
      lines: input.lines,
      totalDebit,
      totalCredit,
      correlationId: input.correlationId,
      idempotencyKey: input.idempotencyKey,
      auditReference: input.auditReference,
      sourceEventId: input.sourceEventId,
      postedBy: context.userId,
      postedAt: now,
    };

    this.ledgerRepository.createPosting(posting);

    publishLedgerEvent(
      {
        eventType: "LedgerUpdated",
        entityType: "ledger_posting",
        entityId: posting.id,
        correlationId: input.correlationId,
        payload: { periodId: input.periodId, totalDebit: String(totalDebit) },
      },
      context,
    );

    publishLedgerEvent(
      {
        eventType: "LedgerBalanced",
        entityType: "ledger_period",
        entityId: input.periodId,
        correlationId: input.correlationId,
        payload: { totalDebit: String(totalDebit), totalCredit: String(totalCredit) },
      },
      context,
    );

    return posting;
  }

  consumeFinancialEvent(
    event: PublishFinanceEventInput & { eventId?: string },
    context: ServiceContext,
  ): ConsumedFinancialEventRecord {
    const record: ConsumedFinancialEventRecord = {
      id: randomUUID(),
      organizationId: context.organizationId,
      eventType: event.eventType,
      eventId: event.eventId ?? randomUUID(),
      correlationId: event.correlationId ?? randomUUID(),
      consumedAt: todayIso(),
      status: "consumed",
    };

    return this.ledgerRepository.recordConsumedEvent(record);
  }

  validateConsistency(periodId: string, context: ServiceContext): LedgerConsistencyResult {
    const issues = this.rules.validateLedgerConsistency(context.organizationId, periodId);

    if (issues.length > 0) {
      publishLedgerEvent(
        {
          eventType: "LedgerValidationFailed",
          entityType: "ledger_period",
          entityId: periodId,
          payload: { code: issues[0]?.code ?? "CONSISTENCY_FAILED" },
        },
        context,
      );
    }

    return { passed: issues.length === 0, issues };
  }

  reconcilePeriod(periodId: string, context: ServiceContext): LedgerConsistencyResult {
    const consistency = this.validateConsistency(periodId, context);
    if (!consistency.passed) {
      throw new Error(consistency.issues[0]?.code ?? "LEDGER_NOT_BALANCED");
    }

    this.ledgerRepository.markPeriodReconciled(context.organizationId, periodId);

    publishLedgerEvent(
      {
        eventType: "LedgerReconciled",
        entityType: "ledger_period",
        entityId: periodId,
      },
      context,
    );

    return consistency;
  }

  closePeriod(periodId: string, context: ServiceContext): FiscalPeriodRecord {
    const consistency = this.validateConsistency(periodId, context);
    if (!consistency.passed) {
      throw new Error("PERIOD_NOT_BALANCED");
    }

    const closed = this.periodRepository.updateState(context.organizationId, periodId, "hard_closed");

    publishLedgerEvent(
      {
        eventType: "LedgerClosed",
        entityType: "ledger_period",
        entityId: periodId,
      },
      context,
    );

    return closed;
  }

  getClosingBalances(periodId: string, context: ServiceContext): readonly LedgerAccountBalanceView[] {
    return this.ledgerRepository
      .listBalances(context.organizationId, periodId)
      .map((balance) => this.getAccountBalance(balance.accountId, periodId, context))
      .filter((view): view is LedgerAccountBalanceView => view !== null);
  }

  private applyLineToBalance(
    periodId: string,
    currency: string,
    line: LedgerPostingInput["lines"][number],
    context: ServiceContext,
    now: string,
  ): void {
    const existing =
      this.ledgerRepository.getBalance(context.organizationId, line.accountId, periodId) ??
      ({
        id: randomUUID(),
        organizationId: context.organizationId,
        accountId: line.accountId,
        periodId,
        currency,
        openingDebit: 0,
        openingCredit: 0,
        periodDebit: 0,
        periodCredit: 0,
        closingDebit: 0,
        closingCredit: 0,
        runningBalance: 0,
        updatedAt: now,
      } satisfies LedgerBalanceRecord);

    const periodDebit = existing.periodDebit + line.debitAmount;
    const periodCredit = existing.periodCredit + line.creditAmount;
    const closingDebit = existing.openingDebit + periodDebit;
    const closingCredit = existing.openingCredit + periodCredit;

    this.ledgerRepository.upsertBalance({
      ...existing,
      periodDebit,
      periodCredit,
      closingDebit,
      closingCredit,
      runningBalance: closingDebit - closingCredit,
      updatedAt: now,
    });
  }
}
