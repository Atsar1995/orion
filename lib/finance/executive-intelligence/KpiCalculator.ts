import type { GeneralLedgerService } from "@/lib/finance/general-ledger/GeneralLedgerService";
import type { FinancialKpiRecord, FinancialTrendRecord } from "@/types/finance-executive-intelligence";
import type { ServiceContext } from "@/types/services";

function formatCurrency(amount: number, currency = "ZAR"): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export type DerivedFinancialMetrics = {
  readonly revenue: number;
  readonly expenses: number;
  readonly grossProfit: number;
  readonly netProfit: number;
  readonly operatingMargin: number;
  readonly ebitda: number;
  readonly cashPosition: number;
  readonly receivables: number;
  readonly payables: number;
  readonly workingCapital: number;
  readonly currentRatio: number;
  readonly quickRatio: number;
  readonly debtRatio: number;
  readonly currency: string;
};

/** Derives executive KPIs from read-only GL data (Mission P-009.7). */
export class KpiCalculator {
  constructor(private readonly generalLedger: GeneralLedgerService) {}

  deriveMetrics(periodId: string, context: ServiceContext): DerivedFinancialMetrics {
    const trialBalance = this.generalLedger.getTrialBalance(periodId, context);
    const currency = trialBalance.currency;

    let cashPosition = 0;
    let receivables = 0;
    let payables = 0;
    let revenue = 0;
    let expenses = 0;
    let liabilities = 0;
    let equity = 0;

    for (const line of trialBalance.lines) {
      const balance = line.runningBalance;

      switch (line.accountType) {
        case "asset":
          if (line.accountCode.startsWith("111")) cashPosition += line.debitTotal - line.creditTotal;
          if (line.accountCode.startsWith("112")) receivables += line.debitTotal - line.creditTotal;
          break;
        case "liability":
          payables += line.creditTotal - line.debitTotal;
          liabilities += line.creditTotal - line.debitTotal;
          break;
        case "equity":
          equity += line.creditTotal - line.debitTotal;
          break;
        case "revenue":
          revenue += line.creditTotal - line.debitTotal;
          break;
        case "expense":
          expenses += line.debitTotal - line.creditTotal;
          break;
        default:
          void balance;
      }
    }

    const grossProfit = revenue - expenses * 0.3;
    const netProfit = revenue - expenses;
    const operatingMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const ebitda = netProfit * 1.15;
    const currentAssets = cashPosition + receivables;
    const currentLiabilities = payables;
    const workingCapital = currentAssets - currentLiabilities;
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const quickRatio = currentLiabilities > 0 ? cashPosition / currentLiabilities : 0;
    const totalDebt = liabilities;
    const totalAssets = currentAssets + equity;
    const debtRatio = totalAssets > 0 ? totalDebt / totalAssets : 0;

    return {
      revenue,
      expenses,
      grossProfit,
      netProfit,
      operatingMargin,
      ebitda,
      cashPosition,
      receivables,
      payables,
      workingCapital,
      currentRatio,
      quickRatio,
      debtRatio,
      currency,
    };
  }

  buildKpis(
    metrics: DerivedFinancialMetrics,
    periodId: string,
    organizationId: string,
    previousTrend: FinancialTrendRecord | null,
  ): FinancialKpiRecord[] {
    const now = new Date().toISOString();
    const trend = (current: number, previous: number | undefined): { trend: "up" | "down" | "stable"; percent: number } => {
      if (previous === undefined || previous === 0) return { trend: "stable", percent: 0 };
      const percent = Math.round(((current - previous) / previous) * 100);
      if (percent > 2) return { trend: "up", percent };
      if (percent < -2) return { trend: "down", percent };
      return { trend: "stable", percent };
    };

    const revTrend = trend(metrics.revenue, previousTrend?.revenue);
    const healthScore = this.computeHealthScore(metrics);

    const kpis: Array<Omit<FinancialKpiRecord, "id">> = [
      { key: "revenue", label: "Revenue", value: metrics.revenue, displayValue: formatCurrency(metrics.revenue, metrics.currency), unit: "currency", trend: revTrend.trend, trendPercent: revTrend.percent, organizationId, periodId, updatedAt: now },
      { key: "gross_profit", label: "Gross Profit", value: metrics.grossProfit, displayValue: formatCurrency(metrics.grossProfit, metrics.currency), unit: "currency", trend: revTrend.trend, trendPercent: revTrend.percent, organizationId, periodId, updatedAt: now },
      { key: "net_profit", label: "Net Profit", value: metrics.netProfit, displayValue: formatCurrency(metrics.netProfit, metrics.currency), unit: "currency", trend: revTrend.trend, trendPercent: revTrend.percent, organizationId, periodId, updatedAt: now },
      { key: "operating_margin", label: "Operating Margin", value: metrics.operatingMargin, displayValue: `${metrics.operatingMargin.toFixed(1)}%`, unit: "percent", trend: "stable", trendPercent: 0, organizationId, periodId, updatedAt: now },
      { key: "ebitda", label: "EBITDA", value: metrics.ebitda, displayValue: formatCurrency(metrics.ebitda, metrics.currency), unit: "currency", trend: revTrend.trend, trendPercent: revTrend.percent, organizationId, periodId, updatedAt: now },
      { key: "cash_position", label: "Cash Position", value: metrics.cashPosition, displayValue: formatCurrency(metrics.cashPosition, metrics.currency), unit: "currency", trend: trend(metrics.cashPosition, previousTrend?.cashPosition).trend, trendPercent: trend(metrics.cashPosition, previousTrend?.cashPosition).percent, organizationId, periodId, updatedAt: now },
      { key: "working_capital", label: "Working Capital", value: metrics.workingCapital, displayValue: formatCurrency(metrics.workingCapital, metrics.currency), unit: "currency", trend: "stable", trendPercent: 0, organizationId, periodId, updatedAt: now },
      { key: "current_ratio", label: "Current Ratio", value: metrics.currentRatio, displayValue: metrics.currentRatio.toFixed(2), unit: "ratio", trend: "stable", trendPercent: 0, organizationId, periodId, updatedAt: now },
      { key: "quick_ratio", label: "Quick Ratio", value: metrics.quickRatio, displayValue: metrics.quickRatio.toFixed(2), unit: "ratio", trend: "stable", trendPercent: 0, organizationId, periodId, updatedAt: now },
      { key: "debt_ratio", label: "Debt Ratio", value: metrics.debtRatio, displayValue: metrics.debtRatio.toFixed(2), unit: "ratio", trend: "stable", trendPercent: 0, organizationId, periodId, updatedAt: now },
      { key: "organization_health_score", label: "Organization Health Score", value: healthScore, displayValue: `${healthScore}/100`, unit: "score", trend: trend(healthScore, previousTrend?.healthScore).trend, trendPercent: trend(healthScore, previousTrend?.healthScore).percent, organizationId, periodId, updatedAt: now },
    ];

    return kpis.map((kpi, index) => ({ ...kpi, id: `kpi-${kpi.key}-${periodId}-${index}` }));
  }

  computeHealthScore(metrics: DerivedFinancialMetrics): number {
    let score = 50;
    if (metrics.currentRatio >= 2) score += 15;
    else if (metrics.currentRatio >= 1) score += 8;
    if (metrics.operatingMargin >= 20) score += 15;
    else if (metrics.operatingMargin >= 10) score += 8;
    if (metrics.netProfit > 0) score += 10;
    if (metrics.workingCapital > 0) score += 10;
    return Math.min(100, Math.max(0, score));
  }
}
