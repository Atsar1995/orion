import type { HealthStatus } from "@/lib/command-center-data";
import type {
  ExecutiveRecommendation,
  HealthScore,
} from "@/lib/intelligence/models";
import type {
  PortfolioHealth,
  RecommendationOutput,
  RelationshipHealthSummary,
  WorkspaceBriefContribution,
} from "@/lib/intelligence/engine-models";

/** Presentation snapshot for Customer Intelligence Executive Brief card. */
export type CrmAdvisorSnapshot = {
  healthScore: number;
  trend: string;
  status: HealthStatus;
  highestValueCustomer: {
    name: string;
    value: string;
    status: HealthStatus;
    detail: string;
  };
  highestRiskCustomer: {
    name: string;
    value: string;
    status: HealthStatus;
    detail: string;
  };
  largestOpportunity: {
    name: string;
    value: string;
    status: HealthStatus;
    detail: string;
  };
  recommendedAction: {
    title: string;
    description: string;
  };
  topInsight: ExecutiveRecommendation;
  highestPriorityRelationship: {
    name: string;
    industry: string;
    lifetimeValue: string;
    status: HealthStatus;
    reason: string;
    action: string;
  };
  highestPriorityOpportunity: {
    name: string;
    customer: string;
    value: string;
    stage: string;
    probability: number;
    expectedClose: string;
    action: string;
    status: HealthStatus;
  };
  weeklyRelationshipHealth: {
    trend: string;
    engagementChange: string;
    atRiskChange: string;
    summary: string;
    status: HealthStatus;
  };
  portfolioSummary: {
    categories: Array<{
      label: string;
      customerCount: number;
      revenueContribution: string;
      healthDistribution: string;
      status: HealthStatus;
    }>;
    executiveSummary: string;
  };
  weeklyExecutiveSummary: string;
  executiveRecommendations: ExecutiveRecommendation[];
  intelligenceSummary: string;
  revenueForecastDisplay: string;
  followUpDueCount: number;
  highRiskDealCount: number;
  lostOpportunityCount: number;
};

/** CRM workspace brief with advisor card snapshot. */
export type CrmWorkspaceBrief = WorkspaceBriefContribution & {
  snapshot: CrmAdvisorSnapshot;
};

import type { CrmWorkspaceIntelligence } from "@/lib/crm/models/intelligence";

/** Full CRM intelligence pipeline result. */
export type CrmIntelligenceResult = {
  signals: CrmWorkspaceIntelligence;
  health: {
    customer: HealthScore;
    relationship: RelationshipHealthSummary;
    opportunity: HealthScore;
    portfolio: PortfolioHealth;
  };
  recommendations: RecommendationOutput;
  brief: CrmWorkspaceBrief;
};
