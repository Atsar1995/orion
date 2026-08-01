import type { HealthStatus } from "@/lib/command-center-data";
import type { ManagedOpportunity } from "@/lib/crm-relationships-opportunities";
import type { LostOpportunityItem, LostOpportunityResult } from "@/lib/crm/models/intelligence";

const EARLY_STAGES = new Set(["Prospect", "Discovery", "Qualified"]);

function isLostCandidate(opportunity: ManagedOpportunity): LostOpportunityItem | null {
  const lowProbability = opportunity.probability <= 35;
  const lateStageLowProbability =
    !EARLY_STAGES.has(opportunity.stage) && opportunity.probability <= 45;
  const criticalRelationship =
    opportunity.relationshipStatus === "critical" && opportunity.probability <= 50;

  if (!lowProbability && !lateStageLowProbability && !criticalRelationship) {
    return null;
  }

  let reason = "Deal shows stall or loss signals based on probability and stage rules.";
  let status: HealthStatus = "attention";

  if (criticalRelationship) {
    reason =
      "Critical customer relationship with declining win probability — retention deal at risk of loss.";
    status = "critical";
  } else if (lateStageLowProbability) {
    reason = "Late-stage deal with win probability below threshold — likely lost without intervention.";
    status = "critical";
  } else if (lowProbability) {
    reason = "Low win probability — qualify further or archive to protect forecast accuracy.";
  }

  return {
    dealName: opportunity.name,
    customer: opportunity.customer,
    value: opportunity.value,
    stage: opportunity.stage,
    probability: opportunity.probability,
    reason,
    status,
  };
}

/** Detects stalled or at-risk opportunities using deterministic business rules. */
export function detectLostOpportunities(
  opportunities: ManagedOpportunity[],
): LostOpportunityResult {
  const opportunitiesAtRisk = opportunities
    .map(isLostCandidate)
    .filter((item): item is LostOpportunityItem => item !== null);

  return {
    count: opportunitiesAtRisk.length,
    summary:
      opportunitiesAtRisk.length > 0
        ? `${opportunitiesAtRisk.length} opportunit${opportunitiesAtRisk.length === 1 ? "y" : "ies"} flagged as stall or loss risk.`
        : "No lost-opportunity signals detected in the current pipeline.",
    opportunities: opportunitiesAtRisk,
  };
}
