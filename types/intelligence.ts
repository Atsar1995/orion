import type { HealthStatus } from "@/lib/command-center-data";

/** Trend direction for executive metrics and KPIs. */
export type IntelligenceTrendDirection = "up" | "down" | "neutral";

/** Health status aligned with platform models and ES-065. */
export type IntelligenceHealthStatus = HealthStatus;

/** Workspace-level executive KPI for the dashboard. */
export type ExecutiveMetric = {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: IntelligenceTrendDirection;
  workspace: string;
};

/** Daily executive narrative brief. */
export type ExecutiveBrief = {
  headline: string;
  body: string;
  generatedAt: string;
};

/** Executive recommendation from the Recommendation Engine (ES-029). */
export type Recommendation = {
  id: string;
  priority: number;
  title: string;
  description: string;
  category?: "executive" | "follow-up" | "growth" | "risk" | "priority";
};

/** Business alert from the Alert Engine (ES-030). */
export type Alert = {
  id: string;
  severity: IntelligenceHealthStatus;
  message: string;
  category?: "risk" | "follow-up" | "opportunity" | "operational";
};

/** Time-series trend from the Trend Engine (ES-031). */
export type Trend = {
  id: string;
  label: string;
  currentValue: string;
  previousValue: string;
  direction: IntelligenceTrendDirection;
  period: string;
  workspace: string;
};

/** Health driver contributing to platform score. */
export type BusinessHealthDriver = {
  label: string;
  status: IntelligenceHealthStatus;
};

/** Platform business health from the Health Engine (ES-032). */
export type BusinessHealth = {
  score: number;
  maxScore: number;
  trend: string;
  status: IntelligenceHealthStatus;
  summary: string;
  drivers: BusinessHealthDriver[];
};

/** Executive priority task for daily operations. */
export type ExecutiveTask = {
  id: string;
  title: string;
  completed?: boolean;
};

/** Aggregated dashboard payload from the Intelligence Service Layer. */
export type DashboardSnapshot = {
  businessHealth: BusinessHealth;
  metrics: {
    revenue: ExecutiveMetric;
    occupancy: ExecutiveMetric;
    customer: ExecutiveMetric;
    marketing: ExecutiveMetric;
  };
  brief: ExecutiveBrief;
  recommendations: Recommendation[];
  alerts: Alert[];
  alertPanel: import("@/types/alerts").AlertPanelSnapshot;
  tasks: ExecutiveTask[];
  trends: Trend[];
};

/** Key workspace metrics exposed on the executive dashboard. */
export type ExecutiveMetricsBundle = DashboardSnapshot["metrics"];
