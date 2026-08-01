export {
  MOCK_ALERTS,
  MOCK_PRIORITIES,
  type MockAlertItem,
  type MockAlertSeverity,
  type MockAlertsData,
  type MockPrioritiesData,
  type MockPriorityItem,
} from "@/lib/dashboard/mock/MockAlerts";
export {
  MOCK_BUSINESS_HEALTH,
  MOCK_CONFIDENCE,
  type MockBusinessHealthData,
  type MockConfidenceData,
  type MockHealthDriver,
  type MockHealthStatus,
} from "@/lib/dashboard/mock/MockBusinessHealth";
export {
  MOCK_EXECUTIVE_NARRATIVE,
  MOCK_MORNING_BRIEF,
  type MockExecutiveNarrativeData,
  type MockMorningBriefData,
} from "@/lib/dashboard/mock/MockMorningBrief";
export {
  MOCK_KPIS,
  MOCK_RECOMMENDATIONS,
  type MockKPIData,
  type MockKPIItem,
  type MockKPITrend,
  type MockRecommendationItem,
  type MockRecommendationPreviewData,
} from "@/lib/dashboard/mock/MockKPIs";

import type { DashboardState } from "@/lib/dashboard/DashboardState";
import { createMockAlertCenterSnapshot } from "@/lib/alerts/mock";
import { MOCK_PRIORITIES } from "@/lib/dashboard/mock/MockAlerts";
import { MOCK_BUSINESS_HEALTH, MOCK_CONFIDENCE } from "@/lib/dashboard/mock/MockBusinessHealth";
import { MOCK_EXECUTIVE_NARRATIVE, MOCK_MORNING_BRIEF } from "@/lib/dashboard/mock/MockMorningBrief";
import { MOCK_KPIS, MOCK_RECOMMENDATIONS } from "@/lib/dashboard/mock/MockKPIs";

/** Fixed timestamp for deterministic dashboard snapshots in EP-002. */
export const MOCK_DASHBOARD_GENERATED_AT = "2026-07-26T06:00:00.000Z";

/** Builds a deterministic dashboard state from EP-002/EP-003 mock fixtures. */
export function createMockDashboardState(): DashboardState {
  return {
    businessHealth: MOCK_BUSINESS_HEALTH,
    confidence: MOCK_CONFIDENCE,
    morningBrief: MOCK_MORNING_BRIEF,
    alertCenter: createMockAlertCenterSnapshot(),
    priorities: MOCK_PRIORITIES,
    kpis: MOCK_KPIS,
    narrative: MOCK_EXECUTIVE_NARRATIVE,
    recommendations: MOCK_RECOMMENDATIONS,
    generatedAt: MOCK_DASHBOARD_GENERATED_AT,
    lastUpdatedAt: MOCK_DASHBOARD_GENERATED_AT,
    sourceProviders: ["Finance", "CRM", "Hospitality"],
  };
}
