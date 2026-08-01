import type { SalesMomentumResult } from "@/lib/crm/models/intelligence";
import type { HealthStatus } from "@/lib/command-center-data";
import type {
  ActivityEffectivenessResult,
  PipelineHealthResult,
  WinRateTrendResult,
} from "@/lib/crm/models/intelligence";
import { deriveHealthStatus } from "@/lib/intelligence/health-engine";

type SalesMomentumInput = {
  pipelineHealth: PipelineHealthResult;
  winRateTrend: WinRateTrendResult;
  activityEffectiveness: ActivityEffectivenessResult;
  pipelineTrend: string;
};

/** Computes sales momentum from pipeline, win rate, and activity signals. */
export function computeSalesMomentum(input: SalesMomentumInput): SalesMomentumResult {
  const winRateScore = input.winRateTrend.currentWinRate;
  const pipelineScore = input.pipelineHealth.score;
  const activityScore = input.activityEffectiveness.score;

  const score = Math.round((winRateScore * 0.35 + pipelineScore * 0.4 + activityScore * 0.25));
  const status = deriveHealthStatus(score);

  const drivers: Array<{ label: string; status: HealthStatus }> = [
    { label: "Pipeline Velocity", status: input.pipelineHealth.status },
    { label: "Win Rate", status: input.winRateTrend.status },
    { label: "Activity Cadence", status: input.activityEffectiveness.status },
  ];

  const summary =
    score >= 75
      ? "Sales momentum is strong — pipeline velocity and activity cadence support forecast attainment."
      : score >= 60
        ? "Sales momentum is moderate — focus on overdue activities and late-stage deal acceleration."
        : "Sales momentum needs attention — win rate and activity completion require executive intervention.";

  return {
    score,
    status,
    trend: input.pipelineTrend,
    summary,
    drivers,
  };
}
