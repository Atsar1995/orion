import type { HealthStatus } from "@/lib/command-center-data";
import {
  buildHealthScore,
  calculateCompositeHealthScore,
  deriveHealthStatus,
} from "@/lib/intelligence/health-engine";
import type {
  CrmHealthInput,
  PortfolioHealth,
  RelationshipHealthSummary,
  RelationshipHealthSegment,
} from "@/lib/intelligence/engine-models";

/** Computes customer health score from CRM business data (workspace-specific). */
export function computeCustomerHealthScore(input: CrmHealthInput) {
  return buildHealthScore({
    score: input.customerScore,
    trend: input.customerTrend,
    status: input.customerStatus,
    summary: input.customerSummary,
    drivers: input.customerDrivers,
  });
}

/** Computes relationship health summary from segment data (workspace-specific). */
export function computeRelationshipHealthScore(
  segments: RelationshipHealthSegment[],
  weekly: Omit<RelationshipHealthSummary, "segments">,
): RelationshipHealthSummary {
  return {
    segments,
    ...weekly,
  };
}

/** Computes opportunity health from pipeline metrics (workspace-specific). */
export function computeOpportunityHealthScore(input: CrmHealthInput) {
  const pipelineScore = calculateCompositeHealthScore([input.customerScore, 78, 82]);

  return buildHealthScore({
    score: pipelineScore,
    trend: input.opportunityTrend,
    status: deriveHealthStatus(pipelineScore),
    summary: input.opportunitySummary,
    drivers: [
      { label: "Pipeline Value", status: "healthy" as HealthStatus },
      { label: "Conversion", status: "healthy" as HealthStatus },
      { label: "Stage Velocity", status: "attention" as HealthStatus },
    ],
  });
}

/** Computes portfolio health from segment classifications (workspace-specific). */
export function computePortfolioHealthScore(input: CrmHealthInput): PortfolioHealth {
  const hasCritical = input.portfolioCategories.some(
    (category) => category.status === "critical",
  );
  const hasAttention = input.portfolioCategories.some(
    (category) => category.status === "attention",
  );

  return {
    categories: input.portfolioCategories,
    executiveSummary: input.portfolioSummary,
    overallStatus: hasCritical ? "critical" : hasAttention ? "attention" : "healthy",
  };
}

/** Runs all CRM health computations (workspace-specific). */
export function computeCrmHealthScores(input: CrmHealthInput) {
  return {
    customer: computeCustomerHealthScore(input),
    relationship: computeRelationshipHealthScore(
      input.relationshipSegments,
      input.weeklyRelationship,
    ),
    opportunity: computeOpportunityHealthScore(input),
    portfolio: computePortfolioHealthScore(input),
  };
}
