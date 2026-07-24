import type { HealthStatus } from "@/lib/command-center-data";

/** Platform-standard health score with trend and driver breakdown. */
export type HealthScore = {
  score: number;
  maxScore: number;
  trend: string;
  status: HealthStatus;
  summary: string;
  drivers: HealthDriver[];
};

/** Individual health driver contributing to an aggregate score. */
export type HealthDriver = {
  label: string;
  status: HealthStatus;
};

/** Business alert for executive attention. */
export type BusinessAlert = {
  severity: HealthStatus;
  message: string;
  category?: "risk" | "follow-up" | "opportunity" | "operational";
};

/** Platform-standard executive recommendation. */
export type ExecutiveRecommendation = {
  priority: number;
  title: string;
  description: string;
  category?: RecommendationCategory;
};

export type RecommendationCategory =
  | "executive"
  | "follow-up"
  | "growth"
  | "risk"
  | "priority";

/** Ranked executive priority item. */
export type ExecutivePriority = {
  rank: number;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  status: HealthStatus;
};

/** Platform-standard executive metric for provider output. */
export type ExecutiveMetric = {
  label: string;
  value: string;
  change?: string;
};

/** Executive summary block for workspace or platform brief. */
export type ExecutiveSummary = {
  headline: string;
  body: string;
  status: HealthStatus;
};

/** Risk signal derived from business intelligence. */
export type RiskIndicator = {
  severity: HealthStatus;
  message: string;
  source?: string;
};

/** Generic portfolio summary across strategic segments. */
export type PortfolioSummary = {
  categories: PortfolioSummarySegment[];
  executiveSummary: string;
  overallStatus: HealthStatus;
};

export type PortfolioSummarySegment = {
  label: string;
  count: number;
  revenueContribution: string;
  healthDistribution: string;
  status: HealthStatus;
};

/** Workspace-level intelligence snapshot for Executive Brief cards. */
export type WorkspaceSnapshot = {
  workspaceId: string;
  workspaceLabel: string;
  healthScore: number;
  trend: string;
  status: HealthStatus;
  briefingLine: string;
  cardData: unknown;
};

/** Aggregated platform intelligence snapshot from all providers. */
export type PlatformSnapshot = {
  providerCount: number;
  healthScores: HealthScore[];
  alerts: BusinessAlert[];
  recommendations: ExecutiveRecommendation[];
  priorities: ExecutivePriority[];
  risks: RiskIndicator[];
  briefingLine: string;
  workspaceSnapshots: WorkspaceSnapshot[];
};

/** Provider registration record in the registry. */
export type ProviderRegistration = {
  providerId: string;
  workspace: string;
  version: string;
  registeredAt: string;
};
