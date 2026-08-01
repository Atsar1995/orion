import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Tax contract — implementation P-009.6+. */
export type TaxRepository = FinanceRepository & {
  countTaxCodes(organizationId: string): number;
};
