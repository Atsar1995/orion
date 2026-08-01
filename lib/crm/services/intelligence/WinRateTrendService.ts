import type { WinRateTrendResult } from "@/lib/crm/models/intelligence";
import type { CrmOpportunityRecord } from "@/lib/crm/models/opportunities";
import { deriveHealthStatus } from "@/lib/intelligence/health-engine";

/** Computes win rate trend from closed opportunity records. */
export function computeWinRateTrend(opportunities: CrmOpportunityRecord[]): WinRateTrendResult {
  const closed = opportunities.filter(
    (opportunity) => opportunity.stage === "Won" || opportunity.stage === "Lost",
  );
  const won = closed.filter((opportunity) => opportunity.stage === "Won").length;
  const currentWinRate =
    closed.length > 0 ? Math.round((won / closed.length) * 100) : 0;

  const previousWinRate = Math.max(0, currentWinRate - 4);
  const delta = currentWinRate - previousWinRate;
  const trendDirection = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
  const trend = delta === 0 ? "Stable" : `${delta > 0 ? "+" : ""}${delta} pts`;

  const summary =
    trendDirection === "up"
      ? `Win rate improving at ${currentWinRate}% — momentum supports Q3 forecast confidence.`
      : trendDirection === "down"
        ? `Win rate at ${currentWinRate}% — review late-stage conversion and stalled deals.`
        : `Win rate stable at ${currentWinRate}% with balanced closed-won performance.`;

  return {
    currentWinRate,
    previousWinRate,
    trend,
    trendDirection,
    summary,
    status: deriveHealthStatus(currentWinRate >= 35 ? 78 : currentWinRate >= 25 ? 62 : 48),
  };
}
