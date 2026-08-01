import type { ActivityEffectivenessResult } from "@/lib/crm/models/intelligence";
import type { CrmActivityRecord } from "@/lib/crm/models/activities";
import { deriveHealthStatus } from "@/lib/intelligence/health-engine";

/** Evaluates CRM activity completion and overdue rates. */
export function computeActivityEffectiveness(
  activities: CrmActivityRecord[],
): ActivityEffectivenessResult {
  const actionable = activities.filter((activity) => activity.type === "Task");
  const completed = actionable.filter((activity) => activity.status === "Completed").length;
  const overdue = activities.filter((activity) => activity.status === "Overdue").length;

  const completionRate =
    actionable.length > 0 ? Math.round((completed / actionable.length) * 100) : 72;
  const overdueRate =
    activities.length > 0 ? Math.round((overdue / activities.length) * 100) : 0;

  let score = 70 + Math.round(completionRate * 0.2) - overdueRate * 3;
  score = Math.max(0, Math.min(100, score));

  const summary =
    overdueRate > 0
      ? `${overdueRate}% of activities overdue — reassign critical follow-ups to protect pipeline velocity.`
      : `Activity completion at ${completionRate}% — touchpoint cadence supports relationship health.`;

  return {
    score,
    completionRate,
    overdueRate,
    summary,
    status: deriveHealthStatus(score),
  };
}
