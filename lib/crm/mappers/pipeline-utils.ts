import type { CrmPipelineStage } from "@/lib/crm/models/domain";

/** Maps pipeline stages to chart points for bar visualisation. */
export function getPipelineChartPoints(stages: CrmPipelineStage[]) {
  return stages.map((stage) => ({
    label: stage.label,
    value: stage.count,
    displayValue: stage.displayValue,
  }));
}

/** Returns the maximum pipeline count for chart scaling. */
export function getPipelineMaxCount(stages: CrmPipelineStage[]): number {
  return Math.max(...stages.map((stage) => stage.count), 1);
}
