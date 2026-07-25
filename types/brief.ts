/** Priority tier for executive brief insights and actions. */
export type ExecutivePriority = "critical" | "high" | "medium" | "low";

/** Section category within a daily executive brief. */
export type BriefCategory =
  | "executive-summary"
  | "key-highlights"
  | "critical-issues"
  | "opportunities"
  | "revenue"
  | "customer"
  | "marketing"
  | "operations"
  | "finance"
  | "priorities"
  | "actions";

/** Severity signal attached to an insight. */
export type BriefSeverity = "critical" | "attention" | "healthy" | "info";

/** Origin of a brief insight or action. */
export type BriefSource =
  | "crm"
  | "finance"
  | "marketing"
  | "hospitality"
  | "commerce"
  | "calendar"
  | "email"
  | "platform";

/** Single insight collected from a provider or platform signal. */
export type ExecutiveInsight = {
  id: string;
  title: string;
  content: string;
  category: BriefCategory;
  priority: ExecutivePriority;
  severity?: BriefSeverity;
  source: BriefSource;
  impactScore: number;
  dedupeKey?: string;
};

/** Recommended executive action derived from insights. */
export type ExecutiveAction = {
  id: string;
  title: string;
  description: string;
  priority: ExecutivePriority;
  source: BriefSource;
  category: BriefCategory;
};

/** Top-level executive summary for the daily brief. */
export type ExecutiveSummary = {
  headline: string;
  narrative: string;
  healthScore?: number;
  healthStatus?: string;
};

/** Structured section within a daily executive brief. */
export type ExecutiveBriefSection = {
  id: BriefCategory;
  title: string;
  insights: ExecutiveInsight[];
  actions?: ExecutiveAction[];
};

/** Full structured daily executive brief output (ES-028 · Sprint 4). */
export type DailyExecutiveBrief = {
  id: string;
  generatedAt: string;
  scheduledFor: string;
  templateId: string;
  summary: ExecutiveSummary;
  sections: ExecutiveBriefSection[];
  topPriorities: ExecutiveInsight[];
  recommendedActions: ExecutiveAction[];
};

/** Template definition for organization-specific brief layouts. */
export type BriefTemplate = {
  id: string;
  name: string;
  organizationId?: string;
  sections: BriefCategory[];
  enabled: boolean;
};
