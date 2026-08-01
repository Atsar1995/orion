import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Budget contract — implementation P-009.5+. */
export type BudgetRepository = FinanceRepository & {
  countBudgetVersions(organizationId: string): number;
};
