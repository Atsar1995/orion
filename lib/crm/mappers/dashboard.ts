import { FOUNDER_NAME } from "@/lib/command-center-data";
import { CRM_KPIS } from "@/lib/crm-data";
import { CRM_WORKSPACE_LABEL } from "@/lib/crm/constants";
import type { CrmDashboardView } from "@/lib/crm/models/dashboard";
import type { CrmKpiMetric } from "@/lib/crm/models/domain";
import type { CrmRepository } from "@/lib/crm/repositories/CrmRepository";
import { EXECUTIVE_RECOMMENDATIONS } from "@/lib/crm-relationships-opportunities";
import type { Recommendation } from "@/types/intelligence";

const DASHBOARD_KPI_LABELS = [
  "Total Customers",
  "Active Customers",
  "Pipeline Value",
  "Win Rate",
  "Open Opportunities",
] as const;

const STAGE_LABEL_MAP: Record<string, string> = {
  Prospect: "Lead",
};

function getGreetingPeriod(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function buildDashboardKpis(repository: CrmRepository): CrmKpiMetric[] {
  const enhanced = repository.getEnhancedKpis();
  const pipeline = repository.getPipelineSummary();
  const kpiLookup = new Map(CRM_KPIS.map((metric) => [metric.label, metric.value]));

  const findEnhanced = (label: string): CrmKpiMetric | undefined =>
    enhanced.find((metric) => metric.label === label);

  const defaults: Record<(typeof DASHBOARD_KPI_LABELS)[number], CrmKpiMetric> = {
    "Total Customers": findEnhanced("Total Customers") ?? {
      label: "Total Customers",
      value: "912",
      change: "+18",
      direction: "up",
    },
    "Active Customers": findEnhanced("Active Customers") ?? {
      label: "Active Customers",
      value: "847",
      change: "+12",
      direction: "up",
    },
    "Pipeline Value": {
      label: "Pipeline Value",
      value: pipeline.totalValue,
      change: pipeline.trend,
      direction: "up",
    },
    "Win Rate": {
      label: "Win Rate",
      value: kpiLookup.get("Win Rate") ?? "32%",
      change: "+2 pts",
      direction: "up",
    },
    "Open Opportunities": findEnhanced("Open Opportunities") ?? {
      label: "Open Opportunities",
      value: String(pipeline.activeOpportunities),
      change: "+3",
      direction: "up",
    },
  };

  return DASHBOARD_KPI_LABELS.map((label) => defaults[label]);
}

function mapDashboardRecommendations(): Recommendation[] {
  return EXECUTIVE_RECOMMENDATIONS.slice(0, 3).map((item) => ({
    id: `crm-rec-${item.priority}`,
    priority: item.priority,
    title: item.title,
    description: item.description,
    category: "executive" as const,
  }));
}

/** Maps repository placeholder data into the CRM dashboard view model. */
export function mapCrmDashboardView(repository: CrmRepository): CrmDashboardView {
  const pipelineSummary = repository.getPipelineSummary();

  return {
    header: {
      greetingPeriod: getGreetingPeriod(),
      executiveName: FOUNDER_NAME,
      title: CRM_WORKSPACE_LABEL,
      dateLabel: formatTodayDate(),
    },
    kpis: buildDashboardKpis(repository),
    customerHealthDistribution: repository.getRelationshipHealth(),
    pipelineStages: repository.getPipelineStages().map((stage) => ({
      ...stage,
      label: STAGE_LABEL_MAP[stage.label] ?? stage.label,
    })),
    pipelineValue: pipelineSummary.totalValue,
    recentActivity: repository.getRecentActivity(),
    recommendations: mapDashboardRecommendations(),
  };
}
