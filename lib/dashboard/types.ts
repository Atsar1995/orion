/** Provider-backed dashboard widget types (Mission S1C — replaces mock-only shapes). */

export type DashboardHealthStatus = "healthy" | "attention" | "critical";

export type DashboardHealthDriver = {
  readonly label: string;
  readonly status: DashboardHealthStatus;
};

export type DashboardBusinessHealthData = {
  readonly score: number;
  readonly maxScore: number;
  readonly trend: string;
  readonly status: DashboardHealthStatus;
  readonly summary: string;
  readonly drivers: readonly DashboardHealthDriver[];
};

export type DashboardConfidenceData = {
  readonly score: number;
  readonly band: "high" | "medium" | "low";
  readonly summary: string;
  readonly factors: readonly string[];
};

export type DashboardMorningBriefData = {
  readonly headline: string;
  readonly summary: string;
  readonly keyPoints: readonly string[];
  readonly generatedAt: string;
  readonly lifecycle: "fresh" | "updated" | "stale";
};

export type DashboardExecutiveNarrativeData = {
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly focusArea: string;
};

export type DashboardAlertItemData = {
  readonly id: string;
  readonly severity: "critical" | "high" | "medium" | "low";
  readonly message: string;
  readonly category: string;
};

export type DashboardPriorityItem = {
  readonly id: string;
  readonly rank: number;
  readonly title: string;
  readonly workspace: string;
};

export type DashboardPrioritiesData = {
  readonly items: readonly DashboardPriorityItem[];
};

export type DashboardKPITrend = "up" | "down" | "flat";

export type DashboardKPIItem = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly change: string;
  readonly trend: DashboardKPITrend;
  readonly workspace: string;
};

export type DashboardKPIData = {
  readonly items: readonly DashboardKPIItem[];
};

export type DashboardRecommendationItem = {
  readonly id: string;
  readonly priority: number;
  readonly title: string;
  readonly description: string;
  readonly workspace: string;
};

export type DashboardRecommendationPreviewData = {
  readonly items: readonly DashboardRecommendationItem[];
};
