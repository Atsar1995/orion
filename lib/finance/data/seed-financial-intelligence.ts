import type {
  BudgetActualRecord,
  FinancialTrendRecord,
} from "@/types/finance-executive-intelligence";

/** Seed financial intelligence historical data (Mission P-009.7). */
export function seedFinancialTrends(organizationId: string): FinancialTrendRecord[] {
  return [
    {
      id: "fin-trend-2026-04",
      organizationId,
      period: "Apr 2026",
      periodId: "period-2026-04",
      revenue: 180_000,
      expenses: 72_000,
      netProfit: 108_000,
      cashPosition: 210_000,
      healthScore: 74,
    },
    {
      id: "fin-trend-2026-05",
      organizationId,
      period: "May 2026",
      periodId: "period-2026-05",
      revenue: 195_000,
      expenses: 78_000,
      netProfit: 117_000,
      cashPosition: 225_000,
      healthScore: 76,
    },
    {
      id: "fin-trend-2026-06",
      organizationId,
      period: "Jun 2026",
      periodId: "period-2026-06",
      revenue: 205_000,
      expenses: 82_000,
      netProfit: 123_000,
      cashPosition: 240_000,
      healthScore: 78,
    },
    {
      id: "fin-trend-2026-07",
      organizationId,
      period: "Jul 2026",
      periodId: "period-2026-07",
      revenue: 220_000,
      expenses: 85_000,
      netProfit: 135_000,
      cashPosition: 250_000,
      healthScore: 82,
    },
  ];
}

export function seedBudgetActuals(organizationId: string, periodId = "period-2026-07"): BudgetActualRecord[] {
  const line = (
    id: string,
    category: string,
    budget: number,
    actual: number,
  ): BudgetActualRecord => ({
    id,
    organizationId,
    category,
    budgetAmount: budget,
    actualAmount: actual,
    variance: actual - budget,
    variancePercent: budget === 0 ? 0 : Math.round(((actual - budget) / budget) * 100),
    periodId,
  });

  return [
    line("bva-revenue", "Revenue", 200_000, 220_000),
    line("bva-cogs", "Cost of Sales", 60_000, 55_000),
    line("bva-opex", "Operating Expenses", 90_000, 85_000),
    line("bva-payroll", "Payroll", 45_000, 42_000),
    line("bva-marketing", "Marketing", 15_000, 18_000),
  ];
}
