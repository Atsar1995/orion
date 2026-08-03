import type {
  ConsumedFinancialEventRecord,
  LedgerBalanceRecord,
  LedgerEntryQuery,
  LedgerEntryRecord,
  LedgerPostingRecord,
} from "@/types/finance-general-ledger";
import type { GeneralLedgerMutation } from "@/lib/finance/services/GeneralLedgerMutation";
import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** General Ledger repository contract (Mission P-009.3 · P-009.7D). */
export type GeneralLedgerRepository = FinanceRepository & {
  getBalance(
    organizationId: string,
    accountId: string,
    periodId: string,
  ): LedgerBalanceRecord | null;
  getAccountBalance(
    organizationId: string,
    accountId: string,
    periodId: string,
  ): LedgerBalanceRecord | null;
  listBalances(organizationId: string, periodId: string): readonly LedgerBalanceRecord[];
  upsertBalance(balance: LedgerBalanceRecord): LedgerBalanceRecord;
  applyMutations(mutations: readonly GeneralLedgerMutation[]): readonly LedgerEntryRecord[];
  getEntries(
    organizationId: string,
    query?: LedgerEntryQuery,
  ): readonly LedgerEntryRecord[];
  createPosting(posting: LedgerPostingRecord): LedgerPostingRecord;
  findPostingByIdempotencyKey(
    organizationId: string,
    idempotencyKey: string,
  ): LedgerPostingRecord | null;
  listPostings(organizationId: string, periodId?: string): readonly LedgerPostingRecord[];
  recordConsumedEvent(event: ConsumedFinancialEventRecord): ConsumedFinancialEventRecord;
  listConsumedEvents(organizationId: string): readonly ConsumedFinancialEventRecord[];
  isPeriodReconciled(organizationId: string, periodId: string): boolean;
  markPeriodReconciled(organizationId: string, periodId: string): void;
};
