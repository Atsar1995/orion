import type { CrmRepository } from "@/lib/crm/repositories/CrmRepository";
import type { CrmWorkspaceIntelligence } from "@/lib/crm/models/intelligence";
import { computeCustomerHealthScore } from "@/lib/crm/services/intelligence/CustomerHealthScoreService";
import { computeDealRisk } from "@/lib/crm/services/intelligence/DealRiskService";
import { computeFollowUpPriority } from "@/lib/crm/services/intelligence/FollowUpPriorityService";
import { detectLostOpportunities } from "@/lib/crm/services/intelligence/LostOpportunityDetectionService";
import { computePipelineHealth } from "@/lib/crm/services/intelligence/PipelineHealthService";
import { computeRevenueForecast } from "@/lib/crm/services/intelligence/RevenueForecastService";
import { composeExecutiveSummary } from "@/lib/crm/services/intelligence/ExecutiveSummaryService";
import { computeActivityEffectiveness } from "@/lib/crm/services/intelligence/ActivityEffectivenessService";
import { computeSalesMomentum } from "@/lib/crm/services/intelligence/SalesMomentumService";
import { computeWinRateTrend } from "@/lib/crm/services/intelligence/WinRateTrendService";

/** Runs all CRM intelligence services (Mission 16B / 16A.6 — business rules only). */
export function runCrmIntelligenceEngine(repository: CrmRepository): CrmWorkspaceIntelligence {
  const profiles = repository.getCustomerProfiles();
  const opportunities = repository.getManagedOpportunities();
  const opportunityRecords = repository.getOpportunityRecords();
  const activityRecords = repository.getActivityRecords();
  const actions = repository.getRelationshipActions();
  const healthInput = repository.getCustomerHealthInput();
  const pipelineSummary = repository.getPipelineSummary();
  const stages = repository.getPipelineStages();
  const segments = repository.getRelationshipHealth();

  const customerHealthScore = computeCustomerHealthScore({
    profiles,
    segments,
    baselineScore: healthInput.score,
    baselineTrend: healthInput.trend,
  });

  const dealRisk = computeDealRisk(opportunities);
  const pipelineHealth = computePipelineHealth({
    stages,
    trend: pipelineSummary.trend,
    activeOpportunities: pipelineSummary.activeOpportunities,
  });
  const lostOpportunities = detectLostOpportunities(opportunities);
  const followUpPriority = computeFollowUpPriority(profiles, actions);
  const revenueForecast = computeRevenueForecast(opportunities);
  const winRateTrend = computeWinRateTrend(opportunityRecords);
  const activityEffectiveness = computeActivityEffectiveness(activityRecords);
  const salesMomentum = computeSalesMomentum({
    pipelineHealth,
    winRateTrend,
    activityEffectiveness,
    pipelineTrend: pipelineSummary.trend,
  });

  const partial = {
    customerHealthScore,
    dealRisk,
    pipelineHealth,
    lostOpportunities,
    followUpPriority,
    revenueForecast,
    winRateTrend,
    activityEffectiveness,
    salesMomentum,
  };

  const executiveSummary = composeExecutiveSummary({
    intelligence: partial,
    recommendedAction: repository.getRecommendedAction(),
    pipelineValueDisplay: pipelineSummary.totalValue,
  });

  return {
    ...partial,
    executiveSummary,
  };
}
