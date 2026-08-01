import type { CrmIntelligenceResult } from "@/lib/crm/crm-intelligence-types";
import type { CrmInsightsView } from "@/lib/crm/models/insights";
import type { CrmRepository } from "@/lib/crm/repositories/CrmRepository";
import { mapCrmBusinessHealthContribution } from "@/lib/crm/mappers/business-health-contribution";
import { mapCrmExplainableRecommendations } from "@/lib/crm/mappers/explainable-recommendations";

function buildIntelligenceAlerts(
  repository: CrmRepository,
  intelligence: CrmIntelligenceResult,
) {
  const baseAlerts = repository.getCustomerAlerts();
  const { signals } = intelligence;

  const dealRiskAlerts = signals.dealRisk.deals
    .filter((deal) => deal.riskLevel === "high")
    .slice(0, 2)
    .map((deal) => ({
      severity: deal.status,
      message: `High-value deal at risk — ${deal.dealName}: ${deal.reason}`,
    }));

  const followUpAlerts =
    signals.followUpPriority.dueCount > 0
      ? [
          {
            severity: "attention" as const,
            message: `Customer overdue for follow-up — ${signals.followUpPriority.dueCount} action${signals.followUpPriority.dueCount === 1 ? "" : "s"} due this week`,
          },
        ]
      : [];

  const pipelineAlerts =
    signals.pipelineHealth.score < 65
      ? [
          {
            severity: "attention" as const,
            message: "Pipeline below monthly target — stage balance requires replenishment",
          },
        ]
      : [];

  const activityAlerts =
    signals.activityEffectiveness.overdueRate > 0
      ? [
          {
            severity: "critical" as const,
            message: `Multiple overdue activities — ${signals.activityEffectiveness.overdueRate}% of touchpoints past due`,
          },
        ]
      : [];

  const lostAlerts = signals.lostOpportunities.opportunities.slice(0, 1).map((item) => ({
    severity: item.status,
    message: `Stall signal — ${item.dealName} (${item.probability}% win probability)`,
  }));

  return [
    ...baseAlerts,
    ...dealRiskAlerts,
    ...followUpAlerts,
    ...pipelineAlerts,
    ...activityAlerts,
    ...lostAlerts,
  ];
}

function buildBriefHighlights(intelligence: CrmIntelligenceResult) {
  const { signals, recommendations } = intelligence;

  return {
    overnightChanges: [
      `Customer health moved to ${signals.customerHealthScore.score}/100 (${signals.customerHealthScore.trend}).`,
      `Win rate trend ${signals.winRateTrend.trend} — now ${signals.winRateTrend.currentWinRate}%.`,
      `${signals.dealRisk.highRiskCount} deal${signals.dealRisk.highRiskCount === 1 ? "" : "s"} flagged at elevated risk.`,
    ],
    upcomingPriorities: recommendations.executivePriorities
      .slice(0, 3)
      .map((priority) => priority.title),
  };
}

/** Maps CRM intelligence pipeline into Insights dashboard view model. */
export function mapCrmInsightsView(
  repository: CrmRepository,
  intelligence: CrmIntelligenceResult,
): CrmInsightsView {
  const { signals } = intelligence;

  return {
    executiveSummary: signals.executiveSummary,
    dashboard: {
      pipelineHealth: signals.pipelineHealth,
      customerHealthDistribution: repository.getRelationshipHealth(),
      revenueForecast: signals.revenueForecast,
      winRateTrend: signals.winRateTrend,
      activityEffectiveness: signals.activityEffectiveness,
      opportunityRiskSummary: signals.dealRisk,
      salesMomentum: signals.salesMomentum,
    },
    recommendations: mapCrmExplainableRecommendations(intelligence),
    alerts: buildIntelligenceAlerts(repository, intelligence),
    businessHealth: mapCrmBusinessHealthContribution(intelligence),
    briefHighlights: buildBriefHighlights(intelligence),
  };
}
