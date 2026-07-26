import type { AlertCenterSnapshot } from "@/lib/alerts/models/Alert";
import type { MockBusinessHealthData } from "@/lib/dashboard/mock/MockBusinessHealth";
import type { MockConfidenceData } from "@/lib/dashboard/mock/MockBusinessHealth";
import type { MockExecutiveNarrativeData } from "@/lib/dashboard/mock/MockMorningBrief";
import type { MockKPIData } from "@/lib/dashboard/mock/MockKPIs";
import type { MockMorningBriefData } from "@/lib/dashboard/mock/MockMorningBrief";
import type { MockPrioritiesData } from "@/lib/dashboard/mock/MockAlerts";
import type { MockRecommendationPreviewData } from "@/lib/dashboard/mock/MockKPIs";

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

/** Snapshot state consumed by dashboard widgets — mock data in EP-002/EP-003. */
export type DashboardState = {
  readonly businessHealth: MockBusinessHealthData;
  readonly confidence: MockConfidenceData;
  readonly morningBrief: MockMorningBriefData;
  readonly alertCenter: AlertCenterSnapshot;
  readonly priorities: MockPrioritiesData;
  readonly kpis: MockKPIData;
  readonly narrative: MockExecutiveNarrativeData;
  readonly recommendations: MockRecommendationPreviewData;
  readonly generatedAt: string;
};
