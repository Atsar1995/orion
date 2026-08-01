import type {
  BudgetActualRecord,
  FinancialTrendRecord,
} from "@/types/finance-executive-intelligence";
import type { FinanceRepository } from "@/lib/finance/repositories/FinanceRepository";

/** Financial intelligence read-only repository contract (Mission P-009.7). */
export type FinancialIntelligenceRepository = FinanceRepository & {
  listTrends(organizationId: string): readonly FinancialTrendRecord[];
  listBudgetActuals(organizationId: string, periodId?: string): readonly BudgetActualRecord[];
  getLatestTrend(organizationId: string): FinancialTrendRecord | null;
};
