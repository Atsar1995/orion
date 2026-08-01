import type { HealthStatus } from "@/lib/command-center-data";
import type { ManagedOpportunity } from "@/lib/crm-relationships-opportunities";
import type { DealRiskItem, DealRiskResult } from "@/lib/crm/models/intelligence";

const STALL_STAGES = new Set(["Prospect", "Discovery"]);

function classifyRiskLevel(riskScore: number): DealRiskItem["riskLevel"] {
  if (riskScore >= 65) {
    return "high";
  }

  if (riskScore >= 40) {
    return "medium";
  }

  return "low";
}

function toHealthStatus(level: DealRiskItem["riskLevel"]): HealthStatus {
  if (level === "high") {
    return "critical";
  }

  if (level === "medium") {
    return "attention";
  }

  return "healthy";
}

function buildDealReason(opportunity: ManagedOpportunity, riskScore: number): string {
  if (opportunity.relationshipStatus === "critical") {
    return "Critical relationship status elevates churn risk on this deal.";
  }

  if (opportunity.probability < 40 && !STALL_STAGES.has(opportunity.stage)) {
    return "Low win probability in late stage — deal may stall or be lost.";
  }

  if (opportunity.probability < 35) {
    return "Early-stage deal with low probability — needs qualification or deprioritisation.";
  }

  if (riskScore >= 65) {
    return "Combined value, probability, and relationship signals indicate high deal risk.";
  }

  return "Monitor deal progression and maintain scheduled follow-up.";
}

/** Calculates per-deal risk scores from value, probability, and relationship rules. */
export function computeDealRisk(opportunities: ManagedOpportunity[]): DealRiskResult {
  const deals: DealRiskItem[] = opportunities
    .map((opportunity) => {
      const probabilityRisk = (100 - opportunity.probability) * 0.45;
      const healthRisk = (100 - opportunity.customerHealth) * 0.25;
      const relationshipRisk =
        opportunity.relationshipStatus === "critical"
          ? 25
          : opportunity.relationshipStatus === "attention"
            ? 12
            : 0;
      const stageRisk = STALL_STAGES.has(opportunity.stage) ? 5 : 15;
      const riskScore = Math.round(probabilityRisk + healthRisk + relationshipRisk + stageRisk);
      const riskLevel = classifyRiskLevel(riskScore);

      return {
        dealName: opportunity.name,
        customer: opportunity.customer,
        value: opportunity.value,
        riskScore,
        riskLevel,
        status: toHealthStatus(riskLevel),
        reason: buildDealReason(opportunity, riskScore),
      };
    })
    .sort((left, right) => right.riskScore - left.riskScore);

  const highRiskCount = deals.filter((deal) => deal.riskLevel === "high").length;
  const overallStatus: HealthStatus =
    highRiskCount >= 2 ? "critical" : highRiskCount === 1 ? "attention" : "healthy";

  return {
    overallStatus,
    summary:
      highRiskCount > 0
        ? `${highRiskCount} deal${highRiskCount === 1 ? "" : "s"} flagged as high risk — founder review recommended.`
        : "Pipeline deal risk is within acceptable bounds.",
    highRiskCount,
    deals,
  };
}
