import type { AccountType } from "@/types/finance-chart-of-accounts";
import type { LedgerBalanceRecord, LedgerPostingRecord } from "@/types/finance-general-ledger";

export type LedgerAccountBalanceView = LedgerBalanceRecord & {
  readonly accountCode: string;
  readonly accountName: string;
  readonly accountType: AccountType;
};

export type TrialBalanceLineView = {
  readonly accountId: string;
  readonly accountCode: string;
  readonly accountName: string;
  readonly accountType: AccountType;
  readonly debitTotal: number;
  readonly creditTotal: number;
  readonly runningBalance: number;
};

export type TrialBalanceView = {
  readonly periodId: string;
  readonly currency: string;
  readonly lines: readonly TrialBalanceLineView[];
  readonly totalDebit: number;
  readonly totalCredit: number;
  readonly balanced: boolean;
};

export type LedgerInquiryView = {
  readonly balances: readonly LedgerAccountBalanceView[];
  readonly recentPostings: readonly LedgerPostingRecord[];
  readonly totalAccounts: number;
};

export type LedgerConsistencyResult = {
  readonly passed: boolean;
  readonly issues: readonly { code: string; message: string }[];
};
