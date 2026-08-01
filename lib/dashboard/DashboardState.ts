import type { AlertCenterSnapshot } from "@/lib/alerts/models/Alert";
import type {
  DashboardBusinessHealthData,
  DashboardConfidenceData,
  DashboardExecutiveNarrativeData,
  DashboardKPIData,
  DashboardMorningBriefData,
  DashboardPrioritiesData,
  DashboardRecommendationPreviewData,
} from "@/lib/dashboard/types";

/** Registered dashboard widget identifiers for EP-002 composition. */
export type DashboardWidgetId =
  | "business-health"
  | "confidence"
  | "morning-brief"
  | "alert-center"
  | "priorities"
  | "kpi-highlights"
  | "executive-narrative"
  | "recommendation-preview";

/** Provider-backed dashboard state consumed by widgets (Mission S1C). */
export type DashboardState = {
  readonly businessHealth: DashboardBusinessHealthData;
  readonly confidence: DashboardConfidenceData;
  readonly morningBrief: DashboardMorningBriefData;
  readonly alertCenter: AlertCenterSnapshot;
  readonly priorities: DashboardPrioritiesData;
  readonly kpis: DashboardKPIData;
  readonly narrative: DashboardExecutiveNarrativeData;
  readonly recommendations: DashboardRecommendationPreviewData;
  readonly generatedAt: string;
  readonly lastUpdatedAt: string;
  readonly sourceProviders: readonly string[];
};
