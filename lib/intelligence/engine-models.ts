import type { HealthStatus } from "@/lib/command-center-data";
import type {
  BusinessAlert,
  ExecutivePriority,
  ExecutiveRecommendation,
  HealthDriver,
  HealthScore,
  RiskIndicator,
} from "@/lib/intelligence/models";

/** Workspace-level health within a platform snapshot. */
export type WorkspaceHealthSnapshot = {
  workspaceId: string;
  workspaceLabel: string;
  health: HealthScore;
};

/** Platform-wide health aggregation from providers. */
export type PlatformHealthSnapshot = {
  platformScore: number;
  platformStatus: HealthStatus;
  trend: string;
  summary: string;
  workspaceHealth: WorkspaceHealthSnapshot[];
  healthyProviderCount: number;
  totalProviderCount: number;
};

/** Workspace executive summary for brief aggregation. */
export type WorkspaceSummary = {
  workspaceId: string;
  workspaceLabel: string;
  headline: string;
  body: string;
  status: HealthStatus;
  briefingLine: string;
};

/** Bundled recommendation output from the recommendation engine. */
export type RecommendationBundle = {
  recommendations: ExecutiveRecommendation[];
  priorities: ExecutivePriority[];
  opportunities: ExecutiveRecommendation[];
  executiveActions: ExecutiveRecommendation[];
  criticalAlerts: BusinessAlert[];
};

/** Full executive brief snapshot produced by the brief engine. */
export type ExecutiveBriefSnapshot = {
  platformHealth: PlatformHealthSnapshot;
  topPriorities: ExecutivePriority[];
  criticalAlerts: BusinessAlert[];
  executiveRecommendations: ExecutiveRecommendation[];
  workspaceSummaries: WorkspaceSummary[];
  briefingLine: string;
  recommendedAction: {
    title: string;
    description: string;
  };
  weeklySummary: string;
  executiveNotes: string;
};

/** Engine execution statistics for platform metrics. */
export type EngineStatistics = {
  healthEngineMs: number;
  recommendationEngineMs: number;
  briefEngineMs: number;
  summaryEngineMs: number;
  totalMs: number;
  providerCount: number;
};

/** Full aggregation result from the intelligence pipeline. */
export type AggregationResult = {
  health: PlatformHealthSnapshot;
  recommendations: RecommendationBundle;
  summaries: WorkspaceSummary[];
  brief: ExecutiveBriefSnapshot;
  statistics: EngineStatistics;
};

/** Workspace contribution to the platform Executive Brief (legacy compat). */
export type WorkspaceBriefContribution = {
  workspaceId: string;
  workspaceLabel: string;
  briefingLine: string;
  healthScore: HealthScore;
  topPriorities: ExecutivePriority[];
  criticalAlerts: BusinessAlert[];
  weeklySummary: string;
  executiveNotes: string;
  recommendedAction: {
    title: string;
    description: string;
  };
};

/** Aggregated platform Executive Brief output (legacy compat). */
export type ExecutiveBriefOutput = {
  briefingLine: string;
  topPriorities: ExecutivePriority[];
  criticalAlerts: BusinessAlert[];
  weeklySummary: string;
  executiveNotes: string;
  recommendedAction: {
    title: string;
    description: string;
  };
};

/** Recommendation builder input for workspace-specific pipelines. */
export type RecommendationInput = {
  insights: ExecutiveRecommendation[];
  followUps: ExecutiveRecommendation[];
  riskAlerts: RiskIndicator[];
  growthOpportunities: ExecutiveRecommendation[];
  executivePriorities: ExecutivePriority[];
};

/** Recommendation builder output for workspace-specific pipelines. */
export type RecommendationOutput = {
  executiveRecommendations: ExecutiveRecommendation[];
  followUpRecommendations: ExecutiveRecommendation[];
  riskAlerts: BusinessAlert[];
  growthOpportunities: ExecutiveRecommendation[];
  executivePriorities: ExecutivePriority[];
};

/** Portfolio health across strategic segments (workspace pipeline layer). */
export type PortfolioHealth = {
  categories: PortfolioHealthSegment[];
  executiveSummary: string;
  overallStatus: HealthStatus;
};

export type PortfolioHealthSegment = {
  label: string;
  count: number;
  revenueContribution: string;
  healthDistribution: string;
  status: HealthStatus;
};

/** Relationship health across customer base segments (workspace pipeline layer). */
export type RelationshipHealthSummary = {
  segments: RelationshipHealthSegment[];
  weeklyTrend: string;
  engagementChange: string;
  atRiskChange: string;
  summary: string;
  status: HealthStatus;
};

export type RelationshipHealthSegment = {
  label: string;
  count: number;
  displayValue: string;
  share: string;
  status: HealthStatus;
};

/** CRM health input (workspace-specific — lives in engine-models for CRM pipeline import). */
export type CrmHealthInput = {
  customerScore: number;
  customerTrend: string;
  customerStatus: HealthStatus;
  customerSummary: string;
  customerDrivers: HealthDriver[];
  relationshipSegments: RelationshipHealthSegment[];
  weeklyRelationship: Omit<RelationshipHealthSummary, "segments">;
  portfolioCategories: PortfolioHealthSegment[];
  portfolioSummary: string;
  opportunityPipelineValue: string;
  opportunityTrend: string;
  opportunitySummary: string;
};
