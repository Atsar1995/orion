import { FOUNDER_NAME } from "@/lib/command-center-data";
import { CRM_WORKSPACE_ID, CRM_WORKSPACE_LABEL } from "@/lib/crm/constants";
import type { CrmIntelligenceResult } from "@/lib/crm/crm-intelligence-types";
import { computeCrmHealthScores } from "@/lib/crm/crm-health-compute";
import type { CrmOverviewView } from "@/lib/crm/models/overview";
import type { CrmRepository } from "@/lib/crm/repositories/CrmRepository";
import { runCrmIntelligenceEngine } from "@/lib/crm/services/intelligence/CrmIntelligenceEngine";
import {
  CUSTOMER_PORTFOLIO,
  EXECUTIVE_RECOMMENDATIONS,
  HIGHEST_PRIORITY_OPPORTUNITY,
  HIGHEST_PRIORITY_RELATIONSHIP,
  PORTFOLIO_EXECUTIVE_SUMMARY,
  RELATIONSHIP_ACTIONS,
  WEEKLY_EXECUTIVE_SUMMARY,
  WEEKLY_RELATIONSHIP_HEALTH,
} from "@/lib/crm-relationships-opportunities";
import { buildHealthScore } from "@/lib/intelligence/health-engine";
import { buildWorkspaceBriefContribution } from "@/lib/intelligence/brief-engine";
import type { CrmHealthInput } from "@/lib/intelligence/engine-models";
import type { ExecutivePriority, ExecutiveRecommendation } from "@/lib/intelligence/models";
import {
  buildFollowUpRecommendations,
  generateRecommendations,
} from "@/lib/intelligence/recommendation-engine";

function getGreetingPeriod(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function mapToExecutiveRecommendations(
  items: Array<{ priority: number; title: string; description: string }>,
  category?: ExecutiveRecommendation["category"],
): ExecutiveRecommendation[] {
  return items.map((item) => ({
    priority: item.priority,
    title: item.title,
    description: item.description,
    category,
  }));
}

function buildExecutivePriorities(signals: ReturnType<typeof runCrmIntelligenceEngine>): ExecutivePriority[] {
  const topFollowUp = signals.followUpPriority.items[0];

  return [
    {
      rank: 1,
      title: topFollowUp?.customer ?? HIGHEST_PRIORITY_RELATIONSHIP.name,
      description: topFollowUp?.description ?? HIGHEST_PRIORITY_RELATIONSHIP.action,
      impact: "high",
      status: topFollowUp?.status ?? HIGHEST_PRIORITY_RELATIONSHIP.status,
    },
    {
      rank: 2,
      title: HIGHEST_PRIORITY_OPPORTUNITY.name,
      description: HIGHEST_PRIORITY_OPPORTUNITY.action,
      impact: "high",
      status: HIGHEST_PRIORITY_OPPORTUNITY.status,
    },
    {
      rank: 3,
      title: "Protect pipeline forecast",
      description: signals.revenueForecast.summary,
      impact: "medium",
      status: signals.pipelineHealth.status,
    },
  ];
}

export function buildCrmHealthInput(repository: CrmRepository): CrmHealthInput {
  const healthInput = repository.getCustomerHealthInput();
  const pipelineSummary = repository.getPipelineSummary();

  return {
    customerScore: healthInput.score,
    customerTrend: healthInput.trend,
    customerStatus: healthInput.status,
    customerSummary: healthInput.summary,
    customerDrivers: healthInput.drivers,
    relationshipSegments: repository.getRelationshipHealth().map((segment) => ({
      label: segment.label,
      count: segment.count,
      displayValue: segment.displayValue,
      share: segment.share,
      status: segment.status,
    })),
    weeklyRelationship: {
      weeklyTrend: WEEKLY_RELATIONSHIP_HEALTH.trend,
      engagementChange: WEEKLY_RELATIONSHIP_HEALTH.engagementChange,
      atRiskChange: WEEKLY_RELATIONSHIP_HEALTH.atRiskChange,
      summary: WEEKLY_RELATIONSHIP_HEALTH.summary,
      status: WEEKLY_RELATIONSHIP_HEALTH.status,
    },
    portfolioCategories: CUSTOMER_PORTFOLIO.map((category) => ({
      label: category.label,
      count: category.customerCount,
      revenueContribution: category.revenueContribution,
      healthDistribution: category.healthDistribution,
      status: category.status,
    })),
    portfolioSummary: PORTFOLIO_EXECUTIVE_SUMMARY,
    opportunityPipelineValue: pipelineSummary.totalValue,
    opportunityTrend: pipelineSummary.trend,
    opportunitySummary: pipelineSummary.summary,
  };
}

function buildIntelligenceAlerts(
  repository: CrmRepository,
  signals: ReturnType<typeof runCrmIntelligenceEngine>,
) {
  const baseAlerts = repository.getCustomerAlerts();
  const dealRiskAlerts = signals.dealRisk.deals
    .filter((deal) => deal.riskLevel === "high")
    .slice(0, 2)
    .map((deal) => ({
      severity: deal.status,
      message: `High deal risk — ${deal.dealName}: ${deal.reason}`,
    }));

  const lostAlerts = signals.lostOpportunities.opportunities.slice(0, 2).map((item) => ({
    severity: item.status,
    message: `Loss signal — ${item.dealName} (${item.probability}% win probability)`,
  }));

  return [...baseAlerts, ...dealRiskAlerts, ...lostAlerts];
}

/** Maps repository + intelligence engine into pipeline result. */
export function mapCrmIntelligenceResult(repository: CrmRepository): CrmIntelligenceResult {
  const signals = runCrmIntelligenceEngine(repository);
  const healthInput = buildCrmHealthInput(repository);
  const health = computeCrmHealthScores(healthInput);
  const executiveInsights = repository.getExecutiveInsights();
  const recommendedAction = repository.getRecommendedAction();
  const intelligenceAlerts = buildIntelligenceAlerts(repository, signals);

  health.customer = buildHealthScore({
    score: signals.customerHealthScore.score,
    trend: signals.customerHealthScore.trend,
    status: signals.customerHealthScore.status,
    summary: signals.customerHealthScore.summary,
    drivers: signals.customerHealthScore.drivers.map((driver) => ({
      label: driver.label,
      status: driver.status,
    })),
  });

  health.opportunity = buildHealthScore({
    score: signals.pipelineHealth.score,
    trend: signals.pipelineHealth.trend,
    status: signals.pipelineHealth.status,
    summary: signals.pipelineHealth.summary,
    drivers: [
      { label: "Stage Balance", status: signals.pipelineHealth.stageBalance === "healthy" ? "healthy" : "attention" },
      { label: "Conversion", status: signals.pipelineHealth.conversionRate >= 8 ? "healthy" : "attention" },
    ],
  });

  const recommendations = generateRecommendations({
    insights: [
      ...mapToExecutiveRecommendations(executiveInsights, "executive"),
      ...EXECUTIVE_RECOMMENDATIONS.map((item) => ({ ...item, category: "executive" as const })),
    ],
    followUps: buildFollowUpRecommendations(RELATIONSHIP_ACTIONS),
    riskAlerts: intelligenceAlerts.map((alert) => ({
      severity: alert.severity,
      message: alert.message,
      source: "crm",
    })),
    growthOpportunities: mapToExecutiveRecommendations(
      executiveInsights.filter((insight) => insight.priority >= 4),
      "growth",
    ),
    executivePriorities: buildExecutivePriorities(signals),
  });

  const briefContribution = buildWorkspaceBriefContribution({
    workspaceId: CRM_WORKSPACE_ID,
    workspaceLabel: CRM_WORKSPACE_LABEL,
    healthScore: health.customer,
    briefingLine: signals.executiveSummary.briefingLine,
    topPriorities: recommendations.executivePriorities,
    criticalAlerts: recommendations.riskAlerts,
    weeklySummary: signals.executiveSummary.narrative,
    executiveNotes: repository.getExecutiveNotes(),
    recommendedAction: {
      title: recommendedAction.title,
      description: recommendedAction.description,
    },
  });

  return {
    signals,
    health,
    recommendations,
    brief: {
      ...briefContribution,
      snapshot: {
        healthScore: signals.customerHealthScore.score,
        trend: signals.customerHealthScore.trend,
        status: signals.customerHealthScore.status,
        highestValueCustomer: repository.getHighestValueCustomer(),
        highestRiskCustomer: repository.getHighestRiskCustomer(),
        largestOpportunity: repository.getLargestOpportunity(),
        recommendedAction,
        topInsight: mapToExecutiveRecommendations([executiveInsights[0]])[0],
        highestPriorityRelationship: HIGHEST_PRIORITY_RELATIONSHIP,
        highestPriorityOpportunity: HIGHEST_PRIORITY_OPPORTUNITY,
        weeklyRelationshipHealth: WEEKLY_RELATIONSHIP_HEALTH,
        portfolioSummary: {
          categories: CUSTOMER_PORTFOLIO,
          executiveSummary: PORTFOLIO_EXECUTIVE_SUMMARY,
        },
        weeklyExecutiveSummary: WEEKLY_EXECUTIVE_SUMMARY,
        executiveRecommendations: EXECUTIVE_RECOMMENDATIONS,
        intelligenceSummary: signals.executiveSummary.narrative,
        revenueForecastDisplay: signals.revenueForecast.weightedForecastDisplay,
        followUpDueCount: signals.followUpPriority.dueCount,
        highRiskDealCount: signals.dealRisk.highRiskCount,
        lostOpportunityCount: signals.lostOpportunities.count,
      },
    },
  };
}

function toCustomerHealthView(signals: CrmIntelligenceResult["signals"]) {
  return {
    score: signals.customerHealthScore.score,
    trend: signals.customerHealthScore.trend,
    status: signals.customerHealthScore.status,
    summary: signals.customerHealthScore.summary,
    drivers: signals.customerHealthScore.drivers.map((driver) => ({
      label: driver.label,
      status: driver.status,
    })),
  };
}

/** Maps CRM overview data for the workspace dashboard page. */
export function mapCrmOverviewView(
  repository: CrmRepository,
  intelligence: CrmIntelligenceResult,
): CrmOverviewView {
  const pipelineSummary = repository.getPipelineSummary();
  const customerHealth = toCustomerHealthView(intelligence.signals);

  return {
    header: {
      greetingPeriod: getGreetingPeriod(),
      executiveName: FOUNDER_NAME,
      title: CRM_WORKSPACE_LABEL,
      dateLabel: formatTodayDate(),
    },
    dashboard: {
      customerHealth,
      activeOpportunities: pipelineSummary.activeOpportunities,
      pipelineValue: pipelineSummary.totalValue,
      pipelineTrend: pipelineSummary.trend,
    },
    executiveSummary: intelligence.signals.executiveSummary.narrative,
    customerHealth,
    kpis: repository.getEnhancedKpis(),
    pipeline: {
      totalValue: pipelineSummary.totalValue,
      trend: pipelineSummary.trend,
      summary: intelligence.signals.pipelineHealth.summary,
      activeOpportunities: pipelineSummary.activeOpportunities,
      stages: repository.getPipelineStages(),
    },
    relationshipHealth: repository.getRelationshipHealth(),
    executiveInsights: repository.getExecutiveInsights(),
    alerts: buildIntelligenceAlerts(repository, intelligence.signals),
    recommendedAction: repository.getRecommendedAction(),
    recentActivity: repository.getRecentActivity(),
    executiveNotes: repository.getExecutiveNotes(),
    profiles: {
      highestValueCustomer: repository.getHighestValueCustomer(),
      highestRiskCustomer: repository.getHighestRiskCustomer(),
      largestOpportunity: repository.getLargestOpportunity(),
    },
    intelligence: intelligence.signals,
  };
}

/** Executive Brief contribution from intelligence result. */
export function mapCrmBriefContribution(intelligence: CrmIntelligenceResult) {
  return intelligence.brief;
}

/** ADR-006 executive provider metrics slice. */
export function mapCrmProviderMetrics(intelligence: CrmIntelligenceResult) {
  const pipelineSummary = intelligence.signals.revenueForecast.weightedForecastDisplay;

  return [
    { label: "Customer Health", value: `${intelligence.signals.customerHealthScore.score}/100` },
    { label: "Pipeline Forecast", value: pipelineSummary },
    {
      label: "Follow-ups Due",
      value: String(intelligence.signals.followUpPriority.dueCount),
    },
  ];
}
