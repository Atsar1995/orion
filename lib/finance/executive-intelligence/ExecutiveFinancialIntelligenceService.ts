import { randomUUID } from "crypto";
import { AlertEngine } from "@/lib/finance/executive-intelligence/AlertEngine";
import { KpiCalculator } from "@/lib/finance/executive-intelligence/KpiCalculator";
import { publishFinancialIntelligenceEvent } from "@/lib/finance/executive-intelligence/intelligence-events";
import { RecommendationEngine } from "@/lib/finance/executive-intelligence/RecommendationEngine";
import type {
  DailyExecutiveSummaryView,
  FinancialExecutiveDashboardView,
  TrendAnalysisView,
  VarianceAnalysisView,
} from "@/lib/finance/models/executive-intelligence";
import type { FiscalPeriodService } from "@/lib/finance/fiscal-period/FiscalPeriodService";
import type { GeneralLedgerService } from "@/lib/finance/general-ledger/GeneralLedgerService";
import type { FinancialIntelligenceRepository } from "@/lib/finance/repositories/FinancialIntelligenceRepository";
import type {
  FinancialKpiRecord,
  ForecastInterfaceRecord,
} from "@/types/finance-executive-intelligence";
import type { ServiceContext } from "@/types/services";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(amount);
}

/** Executive Financial Intelligence service — read-only analytics (Mission P-009.7). */
export class ExecutiveFinancialIntelligenceService {
  readonly kpis: KpiCalculator;
  readonly alerts: AlertEngine;
  readonly recommendations: RecommendationEngine;

  constructor(
    private readonly repository: FinancialIntelligenceRepository,
    generalLedger: GeneralLedgerService,
    private readonly fiscalPeriod: FiscalPeriodService,
  ) {
    this.kpis = new KpiCalculator(generalLedger);
    this.alerts = new AlertEngine(fiscalPeriod);
    this.recommendations = new RecommendationEngine();
  }

  getDashboard(context: ServiceContext, periodId?: string): FinancialExecutiveDashboardView {
    const resolvedPeriodId = periodId ?? this.resolveCurrentPeriodId(context);
    const metrics = this.kpis.deriveMetrics(resolvedPeriodId, context);
    const trends = this.repository.listTrends(context.organizationId);
    const previousTrend = trends.length >= 2 ? trends[trends.length - 2]! : null;
    const kpiRecords = this.kpis.buildKpis(metrics, resolvedPeriodId, context.organizationId, previousTrend);
    const budgetLines = this.repository.listBudgetActuals(context.organizationId, resolvedPeriodId);
    const trendAnalysis = this.getTrendAnalysis(context);
    const alertList = this.alerts.generate(
      metrics,
      budgetLines,
      context,
      resolvedPeriodId,
      trendAnalysis.revenueTrendPercent,
    );
    const healthScore = this.kpis.computeHealthScore(metrics);
    const recommendationList = this.recommendations.generate(metrics, alertList, context.organizationId, healthScore);
    const insightList = this.recommendations.generateInsights(metrics, context.organizationId, healthScore);
    const forecasts = this.buildForecasts(metrics, context.organizationId);

    this.publishDashboardEvents(context, kpiRecords, alertList, healthScore, insightList);

    const criticalAlerts = alertList.filter((alert) => alert.severity === "critical").length;
    const healthTrend = trendAnalysis.revenueTrend;

    return {
      summary: {
        healthScore,
        healthTrend,
        cashPosition: formatCurrency(metrics.cashPosition),
        revenue: formatCurrency(metrics.revenue),
        netProfit: formatCurrency(metrics.netProfit),
        operatingMargin: `${metrics.operatingMargin.toFixed(1)}%`,
        alertCount: alertList.length,
        criticalAlerts,
        briefingLine: this.buildBriefingLine(metrics, alertList, healthScore),
      },
      kpis: kpiRecords,
      alerts: alertList,
      recommendations: recommendationList,
      trends,
      variance: budgetLines,
      forecasts,
      insights: insightList,
      liquidityIndicators: {
        currentRatio: metrics.currentRatio,
        quickRatio: metrics.quickRatio,
        workingCapital: metrics.workingCapital,
        cashPosition: metrics.cashPosition,
      },
      profitability: {
        revenue: metrics.revenue,
        grossProfit: metrics.grossProfit,
        netProfit: metrics.netProfit,
        operatingMargin: metrics.operatingMargin,
        ebitda: metrics.ebitda,
      },
      periodId: resolvedPeriodId,
      generatedAt: new Date().toISOString(),
    };
  }

  getFinancialKpis(context: ServiceContext, periodId?: string): readonly FinancialKpiRecord[] {
    return this.getDashboard(context, periodId).kpis;
  }

  getDailySummary(context: ServiceContext): DailyExecutiveSummaryView {
    const dashboard = this.getDashboard(context);
    return {
      date: new Date().toISOString().slice(0, 10),
      summary: dashboard.summary,
      topAlerts: dashboard.alerts.slice(0, 5),
      topRecommendations: dashboard.recommendations.slice(0, 5),
    };
  }

  getVarianceAnalysis(context: ServiceContext, periodId?: string): VarianceAnalysisView {
    const resolvedPeriodId = periodId ?? this.resolveCurrentPeriodId(context);
    const lines = this.repository.listBudgetActuals(context.organizationId, resolvedPeriodId);
    const totalBudget = lines.reduce((sum, line) => sum + line.budgetAmount, 0);
    const totalActual = lines.reduce((sum, line) => sum + line.actualAmount, 0);

    return {
      periodId: resolvedPeriodId,
      lines,
      totalBudget,
      totalActual,
      totalVariance: totalActual - totalBudget,
    };
  }

  getTrendAnalysis(context: ServiceContext): TrendAnalysisView {
    const periods = this.repository.listTrends(context.organizationId);
    if (periods.length < 2) {
      return {
        periods,
        revenueTrend: "stable",
        expenseTrend: "stable",
        revenueTrendPercent: 0,
        expenseTrendPercent: 0,
      };
    }

    const latest = periods[periods.length - 1]!;
    const previous = periods[periods.length - 2]!;
    const revenueTrendPercent = previous.revenue > 0
      ? Math.round(((latest.revenue - previous.revenue) / previous.revenue) * 100)
      : 0;
    const expenseTrendPercent = previous.expenses > 0
      ? Math.round(((latest.expenses - previous.expenses) / previous.expenses) * 100)
      : 0;

    return {
      periods,
      revenueTrend: revenueTrendPercent > 2 ? "up" : revenueTrendPercent < -2 ? "down" : "stable",
      expenseTrend: expenseTrendPercent > 2 ? "up" : expenseTrendPercent < -2 ? "down" : "stable",
      revenueTrendPercent,
      expenseTrendPercent,
    };
  }

  /** Consumes finance domain events for intelligence refresh (read-only). */
  consumeDomainEvent(
    event: {
      readonly eventType: "LedgerUpdated" | "JournalPosted" | "FinancialEventProcessed" | "PeriodClosed";
      readonly entityId: string;
    },
    context: ServiceContext,
  ): { refreshed: boolean } {
    void event;
    void context;
    return { refreshed: true };
  }

  private resolveCurrentPeriodId(context: ServiceContext): string {
    return this.fiscalPeriod.getCurrentPeriod(context)?.id ?? "period-2026-07";
  }

  private buildForecasts(
    metrics: ReturnType<KpiCalculator["deriveMetrics"]>,
    organizationId: string,
  ): ForecastInterfaceRecord[] {
    const now = new Date().toISOString();
    const horizons: ForecastInterfaceRecord["horizon"][] = ["30d", "60d", "90d"];

    return horizons.map((horizon, index) => ({
      id: `forecast-${horizon}-${organizationId}`,
      organizationId,
      horizon,
      projectedRevenue: metrics.revenue * (1 + 0.03 * (index + 1)),
      projectedExpenses: metrics.expenses * (1 + 0.02 * (index + 1)),
      projectedCash: metrics.cashPosition * (1 + 0.01 * (index + 1)),
      confidence: index === 0 ? "high" : index === 1 ? "medium" : "low",
      generatedAt: now,
    }));
  }

  private buildBriefingLine(
    metrics: ReturnType<KpiCalculator["deriveMetrics"]>,
    alerts: readonly { severity: string }[],
    healthScore: number,
  ): string {
    const critical = alerts.filter((alert) => alert.severity === "critical").length;
    return `${formatCurrency(metrics.revenue)} revenue · ${formatCurrency(metrics.netProfit)} net profit · ${metrics.operatingMargin.toFixed(1)}% margin · ${alerts.length} alert(s) (${critical} critical) · health ${healthScore}/100.`;
  }

  private publishDashboardEvents(
    context: ServiceContext,
    kpis: readonly FinancialKpiRecord[],
    alerts: readonly { id: string; severity: string }[],
    healthScore: number,
    insights: readonly { id: string }[],
  ): void {
    publishFinancialIntelligenceEvent(
      { eventType: "KPIUpdated", entityType: "kpi_set", entityId: randomUUID(), payload: { count: String(kpis.length) } },
      context,
    );

    publishFinancialIntelligenceEvent(
      { eventType: "HealthScoreUpdated", entityType: "health_score", entityId: randomUUID(), payload: { score: String(healthScore) } },
      context,
    );

    for (const alert of alerts.slice(0, 3)) {
      publishFinancialIntelligenceEvent(
        { eventType: "ExecutiveAlertCreated", entityType: "alert", entityId: alert.id, payload: { severity: alert.severity } },
        context,
      );
    }

    for (const insight of insights) {
      publishFinancialIntelligenceEvent(
        { eventType: "FinancialInsightGenerated", entityType: "insight", entityId: insight.id },
        context,
      );
    }

    publishFinancialIntelligenceEvent(
      { eventType: "ForecastGenerated", entityType: "forecast", entityId: randomUUID(), payload: { horizons: "3" } },
      context,
    );
  }
}
