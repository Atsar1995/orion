import type { CrmPipelineStage } from "@/lib/crm/models/domain";
import type { PipelineHealthResult } from "@/lib/crm/models/intelligence";
import { deriveHealthStatus } from "@/lib/intelligence/health-engine";

type PipelineHealthInput = {
  stages: CrmPipelineStage[];
  trend: string;
  activeOpportunities: number;
};

/** Evaluates pipeline health from stage distribution and deal count rules. */
export function computePipelineHealth(input: PipelineHealthInput): PipelineHealthResult {
  const total = input.stages.reduce((sum, stage) => sum + stage.count, 0);
  const early = input.stages
    .filter((stage) => stage.label === "Prospect" || stage.label === "Qualified")
    .reduce((sum, stage) => sum + stage.count, 0);
  const late = input.stages
    .filter((stage) => stage.label === "Negotiation" || stage.label === "Proposal")
    .reduce((sum, stage) => sum + stage.count, 0);
  const won = input.stages.find((stage) => stage.label === "Won")?.count ?? 0;

  const earlyShare = total === 0 ? 0 : early / total;
  const lateShare = total === 0 ? 0 : late / total;
  const conversionRate = total === 0 ? 0 : Math.round((won / total) * 100);

  let stageBalance: PipelineHealthResult["stageBalance"] = "healthy";
  if (earlyShare > 0.55) {
    stageBalance = "bottom-heavy";
  } else if (lateShare > 0.45) {
    stageBalance = "top-heavy";
  }

  let score = 70;
  if (stageBalance === "healthy") {
    score += 10;
  } else {
    score -= 8;
  }

  if (input.activeOpportunities >= 20) {
    score += 6;
  }

  if (conversionRate >= 8) {
    score += 4;
  }

  score = Math.max(0, Math.min(100, score));
  const status = deriveHealthStatus(score);

  const summary =
    stageBalance === "top-heavy"
      ? "Pipeline is top-heavy — strong late-stage concentration but needs early-stage replenishment."
      : stageBalance === "bottom-heavy"
        ? "Pipeline is bottom-heavy — qualification velocity must improve to sustain forecast."
        : "Pipeline stage balance is healthy with sustainable conversion flow.";

  return {
    score,
    status,
    trend: input.trend,
    summary,
    stageBalance,
    conversionRate,
  };
}
