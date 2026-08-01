import type { HealthStatus } from "@/lib/command-center-data";
import type { CrmRecommendedAction } from "@/lib/crm/models/domain";
import type {
  CrmExecutiveSummaryResult,
  CrmWorkspaceIntelligence,
} from "@/lib/crm/models/intelligence";

type ExecutiveSummaryInput = {
  intelligence: Omit<CrmWorkspaceIntelligence, "executiveSummary">;
  recommendedAction: CrmRecommendedAction;
  pipelineValueDisplay: string;
};

function deriveOverallStatus(intelligence: Omit<CrmWorkspaceIntelligence, "executiveSummary">): HealthStatus {
  const statuses = [
    intelligence.customerHealthScore.status,
    intelligence.dealRisk.overallStatus,
    intelligence.pipelineHealth.status,
  ];

  if (statuses.includes("critical")) {
    return "critical";
  }

  if (statuses.includes("attention")) {
    return "attention";
  }

  return "healthy";
}

/** Composes CRM executive summary and briefing line from intelligence signals. */
export function composeExecutiveSummary(input: ExecutiveSummaryInput): CrmExecutiveSummaryResult {
  const { intelligence, recommendedAction, pipelineValueDisplay } = input;
  const status = deriveOverallStatus(intelligence);

  const keyPoints = [
    `Customer health ${intelligence.customerHealthScore.score}/100 (${intelligence.customerHealthScore.trend}).`,
    `${intelligence.dealRisk.highRiskCount} high-risk deal${intelligence.dealRisk.highRiskCount === 1 ? "" : "s"} in pipeline.`,
    `${intelligence.lostOpportunities.count} stall/loss signal${intelligence.lostOpportunities.count === 1 ? "" : "s"} detected.`,
    `${intelligence.followUpPriority.dueCount} follow-up${intelligence.followUpPriority.dueCount === 1 ? "" : "s"} due this week.`,
    `Weighted forecast ${intelligence.revenueForecast.weightedForecastDisplay} (${pipelineValueDisplay} pipeline).`,
  ];

  const topFollowUp = intelligence.followUpPriority.items[0];
  const briefingLine = [
    `Customer health is ${intelligence.customerHealthScore.score}/100 with ${pipelineValueDisplay} pipeline.`,
    topFollowUp
      ? `${topFollowUp.action} — ${topFollowUp.customer} (${topFollowUp.urgency.replace("-", " ")}).`
      : recommendedAction.title,
    intelligence.dealRisk.highRiskCount > 0
      ? `${intelligence.dealRisk.highRiskCount} deal${intelligence.dealRisk.highRiskCount === 1 ? "" : "s"} at elevated risk.`
      : "Pipeline risk within normal bounds.",
  ].join(" ");

  const narrative = [
    `Customer Intelligence: health score ${intelligence.customerHealthScore.score}/100.`,
    intelligence.pipelineHealth.summary,
    intelligence.dealRisk.summary,
    intelligence.revenueForecast.summary,
    `Priority action: ${recommendedAction.title}.`,
  ].join(" ");

  return {
    narrative,
    briefingLine,
    headline: "Customer Intelligence",
    status,
    keyPoints,
  };
}
