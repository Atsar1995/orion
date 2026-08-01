import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Cash management contract — implementation P-009.4+. */
export type CashRepository = FinanceRepository & {
  getCashPosition(organizationId: string): number;
};
