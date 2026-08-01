import type { ExecutiveRecommendation } from "@/types/executive";
import type { CreateDecisionInput, RiskLevel } from "@/types/decisions";

function inferWorkspace(recommendation: ExecutiveRecommendation): string {
  const source = recommendation.evidence[0]?.source ?? "executive";
  if (source.toLowerCase().includes("crm")) return "crm";
  if (source.toLowerCase().includes("finance")) return "finance";
  if (source.toLowerCase().includes("hospitality")) return "hospitality";
  if (source.toLowerCase().includes("marketing")) return "marketing";
  return "executive";
}

function inferEstimatedValue(recommendation: ExecutiveRecommendation): number | undefined {
  if (recommendation.category === "risk") return 12000;
  if (recommendation.category === "growth") return 42000;
  if (recommendation.priority === 1) return 28000;
  return 8500;
}

function inferRiskLevel(recommendation: ExecutiveRecommendation): RiskLevel {
  if (recommendation.category === "risk") return "high";
  if (recommendation.priority === 1) return "medium";
  return "low";
}

/** Maps Brief recommendation → decision creation input. */
export function mapRecommendationToDecisionInput(
  recommendation: ExecutiveRecommendation,
  workspaceId: string,
): CreateDecisionInput {
  const workspace = inferWorkspace(recommendation);

  return {
    recommendationId: recommendation.id,
    title: recommendation.title,
    text: recommendation.description,
    evidence: recommendation.evidence,
    confidenceScore: recommendation.confidence.value,
    confidenceLabel: recommendation.confidence.label,
    businessImpact: recommendation.impact,
    trigger: `Priority ${recommendation.priority} ${recommendation.category} signal`,
    sourceServices: recommendation.evidence.map((item) => item.source),
    priority: recommendation.priority,
    riskLevel: inferRiskLevel(recommendation),
    estimatedValue: inferEstimatedValue(recommendation),
    recommendationType: recommendation.category,
    workspace,
    workspaceId,
  };
}
