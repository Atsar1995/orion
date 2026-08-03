import type {
  BudgetActualRecord,
  FinancialTrendRecord,
} from "@/types/finance-executive-intelligence";
import type { FinancialIntelligenceRepository } from "@/lib/finance/repositories/FinancialIntelligenceRepository";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import { getDefaultFinanceBacking } from "@/lib/finance/persistence/createFinanceStore";

/** In-memory financial intelligence repository (Mission P-009.7). */
export class InMemoryFinancialIntelligenceRepository implements FinancialIntelligenceRepository {
  readonly domain = "finance" as const;

  constructor(private readonly backing: FinanceStoreBacking) {}

  listTrends(organizationId: string): readonly FinancialTrendRecord[] {
    return this.backing.financialTrends.filter((trend) => trend.organizationId === organizationId);
  }

  listBudgetActuals(organizationId: string, periodId?: string): readonly BudgetActualRecord[] {
    return this.backing.budgetActuals.filter(
      (line) => line.organizationId === organizationId && (!periodId || line.periodId === periodId),
    );
  }

  getLatestTrend(organizationId: string): FinancialTrendRecord | null {
    const trends = this.listTrends(organizationId);
    return trends[trends.length - 1] ?? null;
  }
}

export const defaultFinancialIntelligenceRepository = new InMemoryFinancialIntelligenceRepository(
  getDefaultFinanceBacking(),
);
