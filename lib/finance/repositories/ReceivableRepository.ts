import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Accounts Receivable contract — implementation P-009.3+. */
export type ReceivableRepository = FinanceRepository & {
  countOpenInvoices(organizationId: string): number;
};
