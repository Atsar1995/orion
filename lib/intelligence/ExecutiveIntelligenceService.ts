import { getDashboardSnapshot as getOrchestratorDashboardSnapshot } from "@/lib/orchestrator/Orchestrator";
import {
  buildDailyExecutiveBrief,
  buildExecutiveBriefForDashboard,
} from "@/lib/intelligence/brief/ExecutiveBriefEngine";
import { buildRecommendationBundle } from "@/lib/intelligence/recommendations/RecommendationEngine";
import {
  buildAlertBundle,
  buildAlertPanelSnapshot,
} from "@/lib/intelligence/alerts/AlertEngine";
import {
  buildAlertsFromProviders,
  buildBusinessHealthFromProviders,
  buildExecutiveMetricsFromProviders,
  buildExecutiveTasksFromProviders,
  buildRecommendationsFromProviders,
  buildTrendsFromProviders,
} from "@/lib/providers/dashboard-aggregator";
import type { DailyExecutiveBrief } from "@/types/brief";
import type { AlertPanelSnapshot, AlertBundle } from "@/types/alerts";
import type { RecommendationBundle } from "@/types/recommendations";
import type {
  Alert,
  BusinessHealth,
  DashboardSnapshot,
  ExecutiveBrief,
  ExecutiveMetricsBundle,
  ExecutiveTask,
  Recommendation,
  Trend,
} from "@/types/intelligence";

/**
 * Executive Intelligence Service Layer (ES-065).
 *
 * Dashboard data is coordinated by the Intelligence Orchestrator.
 * Individual engine accessors remain available for non-dashboard consumers.
 */
export const executiveIntelligenceService = {
  async getDashboardSnapshot(): Promise<DashboardSnapshot> {
    return getOrchestratorDashboardSnapshot();
  },

  async getExecutiveBrief(): Promise<ExecutiveBrief> {
    return buildExecutiveBriefForDashboard();
  },

  async getDailyExecutiveBrief(templateId?: string): Promise<DailyExecutiveBrief> {
    return buildDailyExecutiveBrief(templateId);
  },

  async getRecommendations(): Promise<Recommendation[]> {
    return buildRecommendationsFromProviders();
  },

  async getRecommendationBundle(): Promise<RecommendationBundle> {
    return buildRecommendationBundle();
  },

  async getAlerts(): Promise<Alert[]> {
    return buildAlertsFromProviders();
  },

  async getAlertBundle(): Promise<AlertBundle> {
    return buildAlertBundle();
  },

  async getAlertPanel(): Promise<AlertPanelSnapshot> {
    return buildAlertPanelSnapshot();
  },

  async getBusinessHealth(): Promise<BusinessHealth> {
    return buildBusinessHealthFromProviders();
  },

  async getTrends(): Promise<Trend[]> {
    return buildTrendsFromProviders();
  },

  async getExecutiveTasks(): Promise<ExecutiveTask[]> {
    return buildExecutiveTasksFromProviders();
  },

  async getExecutiveMetrics(): Promise<ExecutiveMetricsBundle> {
    return buildExecutiveMetricsFromProviders();
  },
};
