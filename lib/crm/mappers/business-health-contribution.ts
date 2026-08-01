import type { CrmIntelligenceResult } from "@/lib/crm/crm-intelligence-types";
import type { CrmBusinessHealthContribution } from "@/lib/crm/models/insights";

/** Maps CRM intelligence into Business Health Engine placeholder inputs. */
export function mapCrmBusinessHealthContribution(
  intelligence: CrmIntelligenceResult,
): CrmBusinessHealthContribution {
  const { signals } = intelligence;

  const customerHealth = {
    label: "Customer Health",
    value: `${signals.customerHealthScore.score}/100`,
    score: signals.customerHealthScore.score,
  };

  const pipelineHealth = {
    label: "Pipeline Health",
    value: `${signals.pipelineHealth.score}/100`,
    score: signals.pipelineHealth.score,
  };

  const salesPerformance = {
    label: "Sales Performance",
    value: `${signals.salesMomentum.score}/100`,
    score: signals.salesMomentum.score,
  };

  const activityCompletion = {
    label: "Activity Completion",
    value: `${signals.activityEffectiveness.completionRate}%`,
    score: signals.activityEffectiveness.score,
  };

  const overallScore = Math.round(
    customerHealth.score * 0.3 +
      pipelineHealth.score * 0.3 +
      salesPerformance.score * 0.25 +
      activityCompletion.score * 0.15,
  );

  return {
    customerHealth,
    pipelineHealth,
    salesPerformance,
    activityCompletion,
    overallScore,
  };
}
