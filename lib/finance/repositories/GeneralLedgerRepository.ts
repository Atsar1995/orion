import type {
  ConsumedFinancialEventRecord,
  LedgerBalanceRecord,
  LedgerPostingRecord,
} from "@/types/finance-general-ledger";
import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** General Ledger repository contract (Mission P-009.3). */
export type GeneralLedgerRepository = FinanceRepository & {
  getBalance(
    organizationId: string,
    accountId: string,
    periodId: string,
  ): LedgerBalanceRecord | null;
  listBalances(organizationId: string, periodId: string): readonly LedgerBalanceRecord[];
  upsertBalance(balance: LedgerBalanceRecord): LedgerBalanceRecord;
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
