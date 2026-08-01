export type { DashboardComposition, ComposedDashboardSection, ComposedDashboardWidget } from "@/lib/dashboard/DashboardComposer";
export { composeDashboard } from "@/lib/dashboard/DashboardComposer";
export type {
  DashboardSectionConfig,
  DashboardWidgetPlacement,
  DashboardWidgetSpan,
} from "@/lib/dashboard/DashboardLayoutConfig";
export { DEFAULT_DASHBOARD_LAYOUT } from "@/lib/dashboard/DashboardLayoutConfig";
export type { DashboardState, DashboardWidgetId } from "@/lib/dashboard/DashboardState";
export {
  DashboardWidgetRegistry,
  createDefaultDashboardWidgetRegistry,
  defaultDashboardWidgetRegistry,
  type DashboardWidgetRenderer,
} from "@/lib/dashboard/WidgetRegistry";
export {
  MOCK_ALERTS,
  MOCK_BUSINESS_HEALTH,
  MOCK_CONFIDENCE,
  MOCK_DASHBOARD_GENERATED_AT,
  MOCK_EXECUTIVE_NARRATIVE,
  MOCK_KPIS,
  MOCK_MORNING_BRIEF,
  MOCK_PRIORITIES,
  MOCK_RECOMMENDATIONS,
  createMockDashboardState,
} from "@/lib/dashboard/mock";
export type {
  DashboardBusinessHealthData,
  DashboardConfidenceData,
  DashboardExecutiveNarrativeData,
  DashboardKPIData,
  DashboardMorningBriefData,
  DashboardPrioritiesData,
  DashboardRecommendationPreviewData,
} from "@/lib/dashboard/types";
