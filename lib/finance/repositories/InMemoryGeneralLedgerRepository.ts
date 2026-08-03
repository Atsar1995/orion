import type {
  ConsumedFinancialEventRecord,
  LedgerBalanceRecord,
  LedgerPostingRecord,
} from "@/types/finance-general-ledger";
import type { GeneralLedgerRepository } from "@/lib/finance/repositories/GeneralLedgerRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import { getDefaultFinanceBacking } from "@/lib/finance/persistence/createFinanceStore";

/** In-memory General Ledger repository (Mission P-009.3). */
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
}

export const defaultGeneralLedgerRepository = new InMemoryGeneralLedgerRepository(
  getDefaultFinanceBacking(),
);
