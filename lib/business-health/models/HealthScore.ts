import type { ScoreBreakdown } from "@/lib/business-health/models/ScoreBreakdown";
import type { KPICategoryId } from "@/lib/business-health/models/KPI";

/** Executive health status label derived from overall score thresholds. */
export type HealthStatusLabel = "excellent" | "healthy" | "fair" | "poor" | "critical";

/** Configurable score thresholds for health status labels. */
export type HealthStatusThresholds = {
  excellent: number;
  healthy: number;
  fair: number;
  poor: number;
  critical: number;
};

export const DEFAULT_HEALTH_STATUS_THRESHOLDS: HealthStatusThresholds = {
  excellent: 90,
  healthy: 75,
  fair: 60,
  poor: 40,
  critical: 0,
};

/** Score produced for a single business category. */
export type CategoryScore = {
  categoryId: KPICategoryId;
  categoryName: string;
  score: number;
  confidence: number;
  weight: number;
  breakdown: ScoreBreakdown[];
};

/** Composite Business Health Score with explainability metadata. */
export type HealthScore = {
  overallScore: number;
  status: HealthStatusLabel;
  categoryScores: CategoryScore[];
  confidence: number;
  timestamp: string;
  summary: string;
  breakdown: ScoreBreakdown[];
};
