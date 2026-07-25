/** Priority tier for executive recommendations. */
export type RecommendationPriority = "critical" | "high" | "medium" | "low";

/** Business domain category for a recommendation. */
export type RecommendationCategory =
  | "revenue"
  | "sales"
  | "marketing"
  | "finance"
  | "operations"
  | "customer-experience"
  | "hospitality"
  | "commerce"
  | "productivity"
  | "risk"
  | "compliance"
  | "growth";

/** Origin of a recommendation signal. */
export type RecommendationSource =
  | "provider"
  | "alert"
  | "trend"
  | "health"
  | "brief"
  | "rule"
  | "platform";

/** Supporting evidence attached to a recommendation. */
export type RecommendationEvidence = {
  id: string;
  label: string;
  value: string;
  source: RecommendationSource;
  capturedAt: string;
};

/** Estimated business impact of acting on a recommendation. */
export type RecommendationImpact = {
  magnitude: "high" | "medium" | "low";
  metric?: string;
  estimatedChange?: string;
  timeframe?: string;
};

/** Suggested action derived from a recommendation. */
export type RecommendationAction = {
  id: string;
  label: string;
  description: string;
  priority: RecommendationPriority;
};

/** Composite score used for ranking recommendations. */
export type RecommendationScore = {
  businessValue: number;
  confidence: number;
  urgency: number;
  total: number;
};

/** Expected outcome if the recommendation is executed. */
export type RecommendationOutcome = {
  summary: string;
  expectedBenefit: string;
  impact: RecommendationImpact;
};

/** Structured recommendation output from the Recommendation Engine (ES-029). */
export type Recommendation = {
  id: string;
  title: string;
  summary: string;
  businessReason: string;
  evidence: RecommendationEvidence[];
  expectedBenefit: string;
  estimatedImpact: RecommendationImpact;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  confidenceScore: number;
  suggestedActions: RecommendationAction[];
  source: RecommendationSource;
  score: RecommendationScore;
  generatedAt: string;
};

/** Bundle of ranked recommendations returned by the engine. */
export type RecommendationBundle = {
  generatedAt: string;
  recommendations: Recommendation[];
};

/** Rule definition for the configuration-driven rule engine. */
export type RecommendationRuleDefinition = {
  id: string;
  name: string;
  enabled: boolean;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  templateId: string;
  sources: RecommendationSource[];
  match: RecommendationRuleMatch;
};

/** Match criteria evaluated against recommendation context signals. */
export type RecommendationRuleMatch = {
  alertSeverity?: string;
  alertCategory?: string;
  trendDirection?: string;
  healthStatus?: string;
  workspace?: string;
  providerId?: string;
  briefCategory?: string;
  messageContains?: string;
};

/** Input context assembled from intelligence services and providers. */
export type RecommendationContext = {
  contributions: import("@/types/providers").ProviderDashboardContribution[];
  businessHealth: import("@/types/intelligence").BusinessHealth;
  alerts: import("@/types/intelligence").Alert[];
  trends: import("@/types/intelligence").Trend[];
  metrics: import("@/types/intelligence").ExecutiveMetricsBundle;
  dailyBrief: import("@/types/brief").DailyExecutiveBrief;
};
