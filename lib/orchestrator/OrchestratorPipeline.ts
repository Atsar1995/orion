import type { PipelineStage } from "@/types/orchestrator";

/** Ordered dashboard intelligence pipeline stages (ES-065 · Sprint 4). */
export const DASHBOARD_PIPELINE_STAGES: PipelineStage[] = [
  { id: "refresh-providers", name: "Refresh Providers", order: 1, required: true },
  { id: "collect-provider-data", name: "Collect Provider Data", order: 2, required: true },
  { id: "normalize-data", name: "Normalize Data", order: 3, required: true },
  { id: "update-business-metrics", name: "Update Business Metrics", order: 4, required: true },
  { id: "generate-executive-brief", name: "Generate Executive Brief", order: 5, required: true },
  {
    id: "generate-recommendations",
    name: "Generate Recommendations",
    order: 6,
    required: true,
  },
  { id: "evaluate-alerts", name: "Evaluate Alerts", order: 7, required: true },
  {
    id: "calculate-business-health",
    name: "Calculate Business Health",
    order: 8,
    required: true,
    parallelGroup: "insights",
  },
  {
    id: "generate-trends",
    name: "Generate Trends",
    order: 9,
    required: false,
    parallelGroup: "insights",
  },
  {
    id: "produce-dashboard-snapshot",
    name: "Produce Dashboard Snapshot",
    order: 10,
    required: true,
  },
];

export function getPipelineStage(stageId: string): PipelineStage | undefined {
  return DASHBOARD_PIPELINE_STAGES.find((stage) => stage.id === stageId);
}

export function getOrderedStages(): PipelineStage[] {
  return [...DASHBOARD_PIPELINE_STAGES].sort((left, right) => left.order - right.order);
}
