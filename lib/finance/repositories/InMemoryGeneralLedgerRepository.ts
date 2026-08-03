import type {
  ConsumedFinancialEventRecord,
  LedgerBalanceRecord,
  LedgerEntryQuery,
  LedgerEntryRecord,
  LedgerPostingRecord,
} from "@/types/finance-general-ledger";
import type { GeneralLedgerRepository } from "@/lib/finance/repositories/GeneralLedgerRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import type { GeneralLedgerMutation } from "@/lib/finance/services/GeneralLedgerMutation";
import { getDefaultFinanceBacking } from "@/lib/finance/persistence/createFinanceStore";

/** In-memory General Ledger repository (Mission P-009.3 · P-009.7D). */
export class InMemoryGeneralLedgerRepository implements GeneralLedgerRepository {
  readonly domain = "finance" as const;

  constructor(private readonly backing: FinanceStoreBacking) {}

  private balanceKey(organizationId: string, periodId: string, accountId: string): string {
    return `${organizationId}::${periodId}::${accountId}`;
  }

  private reconciledKey(organizationId: string, periodId: string): string {
    return `${organizationId}::${periodId}`;
  }

  getBalance(
    organizationId: string,
    accountId: string,
    periodId: string,
  ): LedgerBalanceRecord | null {
    return this.getAccountBalance(organizationId, accountId, periodId);
  }

  getAccountBalance(
    organizationId: string,
    accountId: string,
    periodId: string,
  ): LedgerBalanceRecord | null {
    return (
      this.backing.ledgerBalances.get(this.balanceKey(organizationId, periodId, accountId)) ?? null
    );
  }

  listBalances(organizationId: string, periodId: string): readonly LedgerBalanceRecord[] {
    return [...this.backing.ledgerBalances.values()]
      .filter((balance) => balance.organizationId === organizationId && balance.periodId === periodId)
      .sort((a, b) => a.accountId.localeCompare(b.accountId));
  }

  upsertBalance(balance: LedgerBalanceRecord): LedgerBalanceRecord {
    this.backing.ledgerBalances.set(
      this.balanceKey(balance.organizationId, balance.periodId, balance.accountId),
      balance,
    );
    return balance;
  }

  applyMutations(mutations: readonly GeneralLedgerMutation[]): readonly LedgerEntryRecord[] {
    if (mutations.length === 0) {
      return [];
    }

    const organizationId = mutations[0].organizationId;
    const periodId = mutations[0].periodId;
    const entries: LedgerEntryRecord[] = mutations.map((mutation) => ({
      id: `entry-${mutation.journalLineId}`,
      organizationId: mutation.organizationId,
      accountId: mutation.accountId,
      periodId: mutation.periodId,
      journalId: mutation.journalId,
      journalLineId: mutation.journalLineId,
      debitAmount: mutation.debitAmount,
      creditAmount: mutation.creditAmount,
      currency: mutation.currency,
      postedAt: mutation.postedAt,
      correlationId: mutation.correlationId,
      metadata: mutation.metadata,
    }));

    const entryBucket = this.backing.ledgerEntries.get(organizationId) ?? [];
    entryBucket.push(...entries);
    this.backing.ledgerEntries.set(organizationId, entryBucket);

    for (const mutation of mutations) {
      const existing =
        this.getAccountBalance(organizationId, mutation.accountId, periodId) ??
        this.createEmptyBalance(mutation);
      const periodDebit = existing.periodDebit + mutation.debitAmount;
      const periodCredit = existing.periodCredit + mutation.creditAmount;
      const runningBalance =
        existing.runningBalance + mutation.debitAmount - mutation.creditAmount;

      this.upsertBalance({
        ...existing,
        periodDebit,
        periodCredit,
        closingDebit: existing.openingDebit + periodDebit,
        closingCredit: existing.openingCredit + periodCredit,
        runningBalance,
        updatedAt: mutation.postedAt,
      });
    }

    const totalDebit = mutations.reduce((sum, mutation) => sum + mutation.debitAmount, 0);
    const totalCredit = mutations.reduce((sum, mutation) => sum + mutation.creditAmount, 0);
    const first = mutations[0];

    this.createPosting({
      id: `posting-${first.journalId}`,
      organizationId,
      periodId,
      currency: first.currency,
      lines: mutations.map((mutation) => ({
        accountId: mutation.accountId,
        debitAmount: mutation.debitAmount,
        creditAmount: mutation.creditAmount,
      })),
      totalDebit,
      totalCredit,
      correlationId: first.correlationId,
      idempotencyKey: first.idempotencyKey,
      auditReference: first.journalId,
      sourceEventId: first.metadata?.eventId,
      postedBy: first.metadata?.postedBy ?? "system",
      postedAt: first.postedAt,
    });

    return entries;
  }

  getEntries(
    organizationId: string,
    query: LedgerEntryQuery = {},
  ): readonly LedgerEntryRecord[] {
    const bucket = this.backing.ledgerEntries.get(organizationId) ?? [];
    return bucket.filter((entry) => {
      if (query.periodId && entry.periodId !== query.periodId) return false;
      if (query.accountId && entry.accountId !== query.accountId) return false;
      if (query.journalId && entry.journalId !== query.journalId) return false;
      return true;
    });
  }

  createPosting(posting: LedgerPostingRecord): LedgerPostingRecord {
    const bucket = this.backing.ledgerPostings.get(posting.organizationId) ?? [];
    bucket.push(posting);
    this.backing.ledgerPostings.set(posting.organizationId, bucket);
    return posting;
  }

  findPostingByIdempotencyKey(
    organizationId: string,
    idempotencyKey: string,
  ): LedgerPostingRecord | null {
    const bucket = this.backing.ledgerPostings.get(organizationId) ?? [];
    return bucket.find((posting) => posting.idempotencyKey === idempotencyKey) ?? null;
  }

  listPostings(organizationId: string, periodId?: string): readonly LedgerPostingRecord[] {
    const bucket = this.backing.ledgerPostings.get(organizationId) ?? [];
    if (!periodId) return [...bucket];
    return bucket.filter((posting) => posting.periodId === periodId);
  }

  recordConsumedEvent(event: ConsumedFinancialEventRecord): ConsumedFinancialEventRecord {
    const bucket = this.backing.consumedEvents.get(event.organizationId) ?? [];
    bucket.push(event);
    this.backing.consumedEvents.set(event.organizationId, bucket);
    return event;
  }

  listConsumedEvents(organizationId: string): readonly ConsumedFinancialEventRecord[] {
    return this.backing.consumedEvents.get(organizationId) ?? [];
  }

  isPeriodReconciled(organizationId: string, periodId: string): boolean {
    return this.backing.reconciledPeriods.has(this.reconciledKey(organizationId, periodId));
  }

  markPeriodReconciled(organizationId: string, periodId: string): void {
    this.backing.reconciledPeriods.add(this.reconciledKey(organizationId, periodId));
  }

  private createEmptyBalance(mutation: GeneralLedgerMutation): LedgerBalanceRecord {
    return {
      id: `balance-${mutation.accountId}-${mutation.periodId}`,
      organizationId: mutation.organizationId,
      accountId: mutation.accountId,
      periodId: mutation.periodId,
      currency: mutation.currency,
      openingDebit: 0,
      openingCredit: 0,
      periodDebit: 0,
      periodCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
      runningBalance: 0,
      updatedAt: mutation.postedAt,
    };
  }
}

export const defaultGeneralLedgerRepository = new InMemoryGeneralLedgerRepository(
  getDefaultFinanceBacking(),
);
