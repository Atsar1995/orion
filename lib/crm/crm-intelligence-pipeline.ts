import { buildWorkspaceBriefContribution } from "@/lib/intelligence/brief-engine";
import type { CrmIntelligenceResult } from "@/lib/crm/crm-intelligence-types";
import { computeCrmHealthScores } from "@/lib/crm/crm-health-compute";
import type { CrmHealthInput } from "@/lib/intelligence/engine-models";
import type { ExecutivePriority, ExecutiveRecommendation } from "@/lib/intelligence/models";
import {
  buildFollowUpRecommendations,
  generateRecommendations,
} from "@/lib/intelligence/recommendation-engine";
import {
  CRM_CUSTOMER_ALERTS,
  CRM_CUSTOMER_HEALTH_INPUT,
  CRM_EXECUTIVE_INSIGHTS,
  CRM_EXECUTIVE_NOTES,
  CRM_RECOMMENDED_ACTION,
  HIGHEST_RISK_CUSTOMER,
  HIGHEST_VALUE_CUSTOMER,
  LARGEST_OPPORTUNITY,
  PIPELINE_SUMMARY,
  RELATIONSHIP_HEALTH,
} from "@/lib/crm-business-data";
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

const CRM_WORKSPACE_ID = "crm";
const CRM_WORKSPACE_LABEL = "Customer Intelligence";

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

function buildExecutivePriorities(): ExecutivePriority[] {
  return [
    {
      rank: 1,
      title: HIGHEST_PRIORITY_RELATIONSHIP.name,
      description: HIGHEST_PRIORITY_RELATIONSHIP.action,
      impact: "high",
      status: HIGHEST_PRIORITY_RELATIONSHIP.status,
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
      title: "Advance high-value pipeline",
      description: WEEKLY_EXECUTIVE_SUMMARY,
      impact: "medium",
      status: "healthy",
    },
  ];
}

function buildCrmHealthInput(): CrmHealthInput {
  return {
    customerScore: CRM_CUSTOMER_HEALTH_INPUT.score,
    customerTrend: CRM_CUSTOMER_HEALTH_INPUT.trend,
    customerStatus: CRM_CUSTOMER_HEALTH_INPUT.status,
    customerSummary: CRM_CUSTOMER_HEALTH_INPUT.summary,
    customerDrivers: CRM_CUSTOMER_HEALTH_INPUT.drivers,
    relationshipSegments: RELATIONSHIP_HEALTH.map((segment) => ({
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
    opportunityPipelineValue: PIPELINE_SUMMARY.totalValue,
    opportunityTrend: PIPELINE_SUMMARY.trend,
    opportunitySummary: PIPELINE_SUMMARY.summary,
  };
}

/**
 * CRM Intelligence Pipeline (workspace-specific)
 *
 * Business Data → Business Intelligence → Health Engine →
 * Recommendation Engine → Executive Brief Engine → Executive Shell
 */
export function runCrmIntelligencePipeline(): CrmIntelligenceResult {
  const healthInput = buildCrmHealthInput();
  const health = computeCrmHealthScores(healthInput);

  const recommendations = generateRecommendations({
    insights: [
      ...mapToExecutiveRecommendations(CRM_EXECUTIVE_INSIGHTS, "executive"),
      ...EXECUTIVE_RECOMMENDATIONS.map((item) => ({ ...item, category: "executive" as const })),
    ],
    followUps: buildFollowUpRecommendations(RELATIONSHIP_ACTIONS),
    riskAlerts: CRM_CUSTOMER_ALERTS.map((alert) => ({
      severity: alert.severity,
      message: alert.message,
      source: "crm",
    })),
    growthOpportunities: mapToExecutiveRecommendations(
      CRM_EXECUTIVE_INSIGHTS.filter((insight) => insight.priority >= 4),
      "growth",
    ),
    executivePriorities: buildExecutivePriorities(),
  });

  const briefingLine =
    "Customer health is 84/100 with ₹1.8Cr pipeline; contact Retail Channel Co today (highest-risk VIP) and close OranIA Group ₹18L renewal this week.";

  const briefContribution = buildWorkspaceBriefContribution({
    workspaceId: CRM_WORKSPACE_ID,
    workspaceLabel: CRM_WORKSPACE_LABEL,
    healthScore: health.customer,
    briefingLine,
    topPriorities: recommendations.executivePriorities,
    criticalAlerts: recommendations.riskAlerts,
    weeklySummary: WEEKLY_EXECUTIVE_SUMMARY,
    executiveNotes: CRM_EXECUTIVE_NOTES,
    recommendedAction: {
      title: CRM_RECOMMENDED_ACTION.title,
      description: CRM_RECOMMENDED_ACTION.description,
    },
  });

  return {
    health,
    recommendations,
    brief: {
      ...briefContribution,
      snapshot: {
        healthScore: health.customer.score,
        trend: health.customer.trend,
        status: health.customer.status,
        highestValueCustomer: HIGHEST_VALUE_CUSTOMER,
        highestRiskCustomer: HIGHEST_RISK_CUSTOMER,
        largestOpportunity: LARGEST_OPPORTUNITY,
        recommendedAction: CRM_RECOMMENDED_ACTION,
        topInsight: mapToExecutiveRecommendations([CRM_EXECUTIVE_INSIGHTS[0]])[0],
        highestPriorityRelationship: HIGHEST_PRIORITY_RELATIONSHIP,
        highestPriorityOpportunity: HIGHEST_PRIORITY_OPPORTUNITY,
        weeklyRelationshipHealth: WEEKLY_RELATIONSHIP_HEALTH,
        portfolioSummary: {
          categories: CUSTOMER_PORTFOLIO,
          executiveSummary: PORTFOLIO_EXECUTIVE_SUMMARY,
        },
        weeklyExecutiveSummary: WEEKLY_EXECUTIVE_SUMMARY,
        executiveRecommendations: EXECUTIVE_RECOMMENDATIONS,
      },
    },
  };
}

/** Returns CRM executive recommendations from the intelligence pipeline. */
export function getCrmExecutiveRecommendations(): ExecutiveRecommendation[] {
  return EXECUTIVE_RECOMMENDATIONS;
}

/** Returns the CRM workspace brief for the Executive Brief card. */
export function getCrmBriefContribution() {
  return runCrmIntelligencePipeline().brief;
}

/** Cached pipeline result — single evaluation per module load. */
export const CRM_INTELLIGENCE = runCrmIntelligencePipeline();
