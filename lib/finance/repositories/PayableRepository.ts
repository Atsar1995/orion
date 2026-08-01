import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Accounts Payable contract — implementation P-009.4+. */
export type PayableRepository = FinanceRepository & {
  countOpenBills(organizationId: string): number;
};
