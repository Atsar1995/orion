import type {
  ConsumedFinancialEventRecord,
  LedgerBalanceRecord,
  LedgerPostingRecord,
} from "@/types/finance-general-ledger";
import type { GeneralLedgerRepository } from "@/lib/finance/repositories/GeneralLedgerRepository";
import { seedLedgerBalances } from "@/lib/finance/data/seed-ledger-balances";

/** In-memory General Ledger repository (Mission P-009.3). */
export class InMemoryGeneralLedgerRepository implements GeneralLedgerRepository {
  readonly domain = "finance" as const;

  private readonly balances = new Map<string, LedgerBalanceRecord>();
  private readonly postings = new Map<string, LedgerPostingRecord[]>();
  private readonly consumedEvents = new Map<string, ConsumedFinancialEventRecord[]>();
  private readonly reconciledPeriods = new Set<string>();

  constructor(seedOrganizationId = "org-orania") {
    for (const balance of seedLedgerBalances(seedOrganizationId)) {
      this.balances.set(this.balanceKey(balance.organizationId, balance.periodId, balance.accountId), balance);
    }
  }

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
    return this.balances.get(this.balanceKey(organizationId, periodId, accountId)) ?? null;
  }

  listBalances(organizationId: string, periodId: string): readonly LedgerBalanceRecord[] {
    return [...this.balances.values()]
      .filter((balance) => balance.organizationId === organizationId && balance.periodId === periodId)
      .sort((a, b) => a.accountId.localeCompare(b.accountId));
  }

  upsertBalance(balance: LedgerBalanceRecord): LedgerBalanceRecord {
    this.balances.set(this.balanceKey(balance.organizationId, balance.periodId, balance.accountId), balance);
    return balance;
  }

  createPosting(posting: LedgerPostingRecord): LedgerPostingRecord {
    const bucket = this.postings.get(posting.organizationId) ?? [];
    bucket.push(posting);
    this.postings.set(posting.organizationId, bucket);
    return posting;
  }

  findPostingByIdempotencyKey(
    organizationId: string,
    idempotencyKey: string,
  ): LedgerPostingRecord | null {
    const bucket = this.postings.get(organizationId) ?? [];
    return bucket.find((posting) => posting.idempotencyKey === idempotencyKey) ?? null;
  }

  listPostings(organizationId: string, periodId?: string): readonly LedgerPostingRecord[] {
    const bucket = this.postings.get(organizationId) ?? [];
    if (!periodId) return [...bucket];
    return bucket.filter((posting) => posting.periodId === periodId);
  }

  recordConsumedEvent(event: ConsumedFinancialEventRecord): ConsumedFinancialEventRecord {
    const bucket = this.consumedEvents.get(event.organizationId) ?? [];
    bucket.push(event);
    this.consumedEvents.set(event.organizationId, bucket);
    return event;
  }

  listConsumedEvents(organizationId: string): readonly ConsumedFinancialEventRecord[] {
    return this.consumedEvents.get(organizationId) ?? [];
  }

  isPeriodReconciled(organizationId: string, periodId: string): boolean {
    return this.reconciledPeriods.has(this.reconciledKey(organizationId, periodId));
  }

  markPeriodReconciled(organizationId: string, periodId: string): void {
    this.reconciledPeriods.add(this.reconciledKey(organizationId, periodId));
  }
}

export const defaultGeneralLedgerRepository = new InMemoryGeneralLedgerRepository();
