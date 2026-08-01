import type { FiscalPeriodService } from "@/lib/finance/fiscal-period/FiscalPeriodService";
import type {
  BudgetActualRecord,
  FinancialAlertRecord,
  FinancialAlertSeverity,
} from "@/types/finance-executive-intelligence";
import type { DerivedFinancialMetrics } from "@/lib/finance/executive-intelligence/KpiCalculator";
import type { ServiceContext } from "@/types/services";

const SEVERITY_RANK: Record<FinancialAlertSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/** Financial alert framework — exception-first executive signals (Mission P-009.7). */
export class AlertEngine {
  constructor(private readonly fiscalPeriod: FiscalPeriodService) {}

  generate(
    metrics: DerivedFinancialMetrics,
    budgetLines: readonly BudgetActualRecord[],
    context: ServiceContext,
    periodId: string,
    revenueTrendPercent: number,
  ): FinancialAlertRecord[] {
    const alerts: FinancialAlertRecord[] = [];
    const now = new Date().toISOString();
    const orgId = context.organizationId;

    if (revenueTrendPercent < -5) {
      alerts.push({
        id: `alert-declining-revenue-${periodId}`,
        organizationId: orgId,
        severity: revenueTrendPercent < -15 ? "critical" : "high",
        category: "declining_revenue",
        title: "Declining Revenue Trend",
        message: `Revenue declined ${Math.abs(revenueTrendPercent)}% compared to prior period.`,
        recommendedAction: "Review sales pipeline, pricing, and customer retention.",
        periodId,
        createdAt: now,
      });
    }

    for (const line of budgetLines) {
      if (line.variancePercent > 20 && line.category !== "Revenue") {
        alerts.push({
          id: `alert-expense-spike-${line.id}`,
          organizationId: orgId,
          severity: line.variancePercent > 40 ? "high" : "medium",
          category: "expense_spike",
          title: `Expense Spike — ${line.category}`,
          message: `${line.category} exceeded budget by ${line.variancePercent}%.`,
          recommendedAction: "Investigate expense drivers and enforce spending controls.",
          periodId,
          createdAt: now,
        });
      }

      if (line.category === "Revenue" && line.variancePercent < -10) {
        alerts.push({
          id: `alert-budget-variance-${line.id}`,
          organizationId: orgId,
          severity: "high",
          category: "budget_variance",
          title: "Revenue Below Budget",
          message: `Revenue is ${Math.abs(line.variancePercent)}% below budget target.`,
          recommendedAction: "Accelerate revenue initiatives and review forecast assumptions.",
          periodId,
          createdAt: now,
        });
      }
    }

    if (metrics.operatingMargin < 10) {
      alerts.push({
        id: `alert-margin-${periodId}`,
        organizationId: orgId,
        severity: metrics.operatingMargin < 5 ? "critical" : "high",
        category: "margin_deterioration",
        title: "Margin Deterioration",
        message: `Operating margin at ${metrics.operatingMargin.toFixed(1)}% — below target threshold.`,
        recommendedAction: "Review cost structure and pricing strategy.",
        periodId,
        createdAt: now,
      });
    }

    if (metrics.quickRatio < 1) {
      alerts.push({
        id: `alert-liquidity-${periodId}`,
        organizationId: orgId,
        severity: metrics.quickRatio < 0.5 ? "critical" : "high",
        category: "liquidity_warning",
        title: "Liquidity Warning",
        message: `Quick ratio at ${metrics.quickRatio.toFixed(2)} — insufficient liquid assets.`,
        recommendedAction: "Review cash flow forecast and collection priorities.",
        periodId,
        createdAt: now,
      });
    }

    if (metrics.cashPosition < metrics.payables) {
      alerts.push({
        id: `alert-cash-trend-${periodId}`,
        organizationId: orgId,
        severity: "high",
        category: "negative_cash_trend",
        title: "Cash Position Below Payables",
        message: "Cash position may not cover near-term obligations.",
        recommendedAction: "Prioritize collections and defer non-essential disbursements.",
        periodId,
        createdAt: now,
      });
    }

    const openPeriods = this.fiscalPeriod.inquiry({ state: "open" }, context);
    if (openPeriods.openPeriodCount > 2) {
      alerts.push({
        id: `alert-period-close-${periodId}`,
        organizationId: orgId,
        severity: "medium",
        category: "period_close_risk",
        title: "Period Close Risk",
        message: `${openPeriods.openPeriodCount} accounting periods remain open.`,
        recommendedAction: "Complete period-end close procedures for prior periods.",
        periodId,
        createdAt: now,
      });
    }

    return alerts.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);
  }
}
