import type {
  ExecutiveRecommendationRecord,
  FinancialAlertRecord,
  FinancialInsightRecord,
} from "@/types/finance-executive-intelligence";
import type { DerivedFinancialMetrics } from "@/lib/finance/executive-intelligence/KpiCalculator";

/** Executive recommendation framework (Mission P-009.7). */
export class RecommendationEngine {
  generate(
    metrics: DerivedFinancialMetrics,
    alerts: readonly FinancialAlertRecord[],
    organizationId: string,
    healthScore: number,
  ): ExecutiveRecommendationRecord[] {
    const now = new Date().toISOString();
    const recommendations: ExecutiveRecommendationRecord[] = [];

    if (metrics.cashPosition < metrics.receivables * 0.5) {
      recommendations.push({
        id: "rec-collections",
        organizationId,
        priority: 90,
        title: "Accelerate Collections",
        summary: "Cash position is low relative to outstanding receivables.",
        rationale: "Improving collection performance will strengthen liquidity without altering accounting records.",
        category: "cash",
        createdAt: now,
      });
    }

    if (metrics.operatingMargin >= 20) {
      recommendations.push({
        id: "rec-margin-invest",
        organizationId,
        priority: 60,
        title: "Invest Surplus Margin",
        summary: `Strong operating margin of ${metrics.operatingMargin.toFixed(1)}% supports strategic investment.`,
        rationale: "Favourable profitability creates capacity for growth initiatives.",
        category: "revenue",
        createdAt: now,
      });
    }

    for (const alert of alerts.filter((entry) => entry.severity === "critical" || entry.severity === "high").slice(0, 3)) {
      recommendations.push({
        id: `rec-alert-${alert.id}`,
        organizationId,
        priority: alert.severity === "critical" ? 95 : 80,
        title: `Address: ${alert.title}`,
        summary: alert.message,
        rationale: alert.recommendedAction,
        category: alert.category.includes("cash") || alert.category.includes("liquidity") ? "cash" : "risk",
        createdAt: now,
      });
    }

    if (healthScore < 70) {
      recommendations.push({
        id: "rec-health-review",
        organizationId,
        priority: 85,
        title: "Schedule Financial Health Review",
        summary: `Organization health score at ${healthScore}/100 — below executive threshold.`,
        rationale: "Comprehensive review of liquidity, profitability, and period controls recommended.",
        category: "risk",
        createdAt: now,
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  generateInsights(
    metrics: DerivedFinancialMetrics,
    organizationId: string,
    healthScore: number,
  ): FinancialInsightRecord[] {
    const now = new Date().toISOString();
    const insights: FinancialInsightRecord[] = [];

    insights.push({
      id: "insight-profitability",
      organizationId,
      title: "Profitability Snapshot",
      summary: `Net profit ${metrics.netProfit >= 0 ? "positive" : "negative"} at operating margin ${metrics.operatingMargin.toFixed(1)}%.`,
      impact: metrics.operatingMargin >= 15 ? "low" : metrics.operatingMargin >= 5 ? "medium" : "high",
      category: "profitability",
      generatedAt: now,
    });

    insights.push({
      id: "insight-liquidity",
      organizationId,
      title: "Liquidity Position",
      summary: `Current ratio ${metrics.currentRatio.toFixed(2)} · Working capital healthy at current levels.`,
      impact: metrics.currentRatio >= 1.5 ? "low" : "medium",
      category: "liquidity",
      generatedAt: now,
    });

    insights.push({
      id: "insight-health",
      organizationId,
      title: "Organization Health",
      summary: `Composite health score ${healthScore}/100 based on liquidity, profitability, and capital structure.`,
      impact: healthScore >= 80 ? "low" : healthScore >= 60 ? "medium" : "high",
      category: "health",
      generatedAt: now,
    });

    return insights;
  }
}
