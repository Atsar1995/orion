import type {
  BudgetActualRecord,
  FinancialTrendRecord,
} from "@/types/finance-executive-intelligence";
import type { FinancialIntelligenceRepository } from "@/lib/finance/repositories/FinancialIntelligenceRepository";
import {
  seedBudgetActuals,
  seedFinancialTrends,
} from "@/lib/finance/data/seed-financial-intelligence";

/** In-memory financial intelligence repository (Mission P-009.7). */
export class InMemoryFinancialIntelligenceRepository implements FinancialIntelligenceRepository {
  readonly domain = "finance" as const;

  private readonly trends: FinancialTrendRecord[];
  private readonly budgetActuals: BudgetActualRecord[];

  constructor(seedOrganizationId = "org-orania") {
    this.trends = seedFinancialTrends(seedOrganizationId);
    this.budgetActuals = seedBudgetActuals(seedOrganizationId);
  }

  listTrends(organizationId: string): readonly FinancialTrendRecord[] {
    return this.trends.filter((trend) => trend.organizationId === organizationId);
  }

  listBudgetActuals(organizationId: string, periodId?: string): readonly BudgetActualRecord[] {
    return this.budgetActuals.filter(
      (line) => line.organizationId === organizationId && (!periodId || line.periodId === periodId),
    );
  }

  getLatestTrend(organizationId: string): FinancialTrendRecord | null {
    const trends = this.listTrends(organizationId);
    return trends[trends.length - 1] ?? null;
  }
}

export const defaultFinancialIntelligenceRepository = new InMemoryFinancialIntelligenceRepository();
