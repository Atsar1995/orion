import type { HealthStatus } from "@/lib/command-center-data";

/** Domain types for CRM workspace (repository layer). */

export type CrmTrendDirection = "up" | "down" | "neutral";

export type CrmActivity = {
  time: string;
  description: string;
  type?: "Call" | "Meeting" | "Email" | "Note";
};

export type CrmKpiMetric = {
  label: string;
  value: string;
  change: string;
  direction: CrmTrendDirection;
};

export type CrmInsight = {
  priority: number;
  title: string;
  description: string;
};

export type CrmAlert = {
  severity: HealthStatus;
  message: string;
};

export type CrmPipelineStage = {
  label: string;
  count: number;
  displayValue: string;
};

export type CrmRelationshipSegment = {
  label: string;
  count: number;
  displayValue: string;
  share: string;
  status: HealthStatus;
};

export type CrmRecommendedAction = {
  title: string;
  description: string;
};

export type CrmCustomerProfile = {
  name: string;
  value: string;
  status: HealthStatus;
  detail: string;
};

export type CrmPipelineSummary = {
  totalValue: string;
  trend: string;
  summary: string;
  activeOpportunities: number;
};

export type CrmCustomerHealthInput = {
  score: number;
  trend: string;
  status: HealthStatus;
  summary: string;
  drivers: Array<{ label: string; status: HealthStatus }>;
};
