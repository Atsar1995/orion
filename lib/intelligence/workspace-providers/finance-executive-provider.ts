import { PROVIDER_VERSION, WORKSPACE_IDS } from "@/lib/intelligence/constants";
import { buildHealthScore } from "@/lib/intelligence/health-engine";
import type { RegisteredExecutiveProvider } from "@/lib/intelligence/provider-registry";
import {
  ADVISOR_FINANCE_SNAPSHOT,
  FINANCE_ALERTS,
  FINANCE_EXECUTIVE_BRIEFING_LINE,
  FINANCE_EXECUTIVE_INSIGHTS,
  FINANCE_HEALTH_SCORE,
} from "@/lib/finance-insights";

/** Finance Executive Provider (ADR-006). */
export const financeExecutiveProvider: RegisteredExecutiveProvider = {
  id: WORKSPACE_IDS.FINANCE,
  workspace: "Finance",
  version: PROVIDER_VERSION,

  getHealth() {
    return buildHealthScore({
      score: FINANCE_HEALTH_SCORE.score,
      trend: FINANCE_HEALTH_SCORE.trend,
      status: FINANCE_HEALTH_SCORE.status,
      summary: FINANCE_HEALTH_SCORE.summary,
      drivers: FINANCE_HEALTH_SCORE.drivers,
    });
  },

  getAlerts() {
    return FINANCE_ALERTS.map((alert) => ({
      severity: alert.severity,
      message: alert.message,
      category: "operational" as const,
    }));
  },

  getRecommendations() {
    return FINANCE_EXECUTIVE_INSIGHTS.map((insight) => ({
      priority: insight.priority,
      title: insight.title,
      description: insight.description,
      category: "executive" as const,
    }));
  },

  getExecutiveSummary() {
    return {
      headline: "Finance",
      body: FINANCE_EXECUTIVE_BRIEFING_LINE,
      status: FINANCE_HEALTH_SCORE.status,
    };
  },

  getMetrics() {
    return [
      { label: "Cash Balance", value: ADVISOR_FINANCE_SNAPSHOT.cashBalance },
      { label: "Monthly Revenue", value: ADVISOR_FINANCE_SNAPSHOT.monthlyRevenue },
      { label: "Net Margin", value: ADVISOR_FINANCE_SNAPSHOT.netMargin },
    ];
  },

  getRisks() {
    return FINANCE_ALERTS.filter((alert) => alert.severity !== "healthy").map(
      (alert) => ({
        severity: alert.severity,
        message: alert.message,
        source: "finance",
      }),
    );
  },

  getPriorities() {
    return [
      {
        rank: 1,
        title: ADVISOR_FINANCE_SNAPSHOT.topReceivable.name,
        description: ADVISOR_FINANCE_SNAPSHOT.topReceivable.action,
        impact: "high" as const,
        status: ADVISOR_FINANCE_SNAPSHOT.topReceivable.status,
      },
      {
        rank: 2,
        title: ADVISOR_FINANCE_SNAPSHOT.topPayable.name,
        description: ADVISOR_FINANCE_SNAPSHOT.topPayable.action,
        impact: "medium" as const,
        status: ADVISOR_FINANCE_SNAPSHOT.topPayable.status,
      },
    ];
  },

  getBriefingLine() {
    return FINANCE_EXECUTIVE_BRIEFING_LINE;
  },

  getBriefCardSnapshot() {
    return ADVISOR_FINANCE_SNAPSHOT;
  },
};
