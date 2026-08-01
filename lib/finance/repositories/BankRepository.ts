import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Banking contract — implementation P-009.4+. */
export type BankRepository = FinanceRepository & {
  countBankAccounts(organizationId: string): number;
};
