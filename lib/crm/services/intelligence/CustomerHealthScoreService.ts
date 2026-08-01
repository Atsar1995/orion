import type { HealthStatus } from "@/lib/command-center-data";
import type { CustomerProfileDetail } from "@/lib/crm-relationships-opportunities";
import type { CrmRelationshipSegment } from "@/lib/crm/models/domain";
import type { CustomerHealthScoreResult } from "@/lib/crm/models/intelligence";
import { deriveHealthStatus } from "@/lib/intelligence/health-engine";

type CustomerHealthInput = {
  profiles: CustomerProfileDetail[];
  segments: CrmRelationshipSegment[];
  baselineScore: number;
  baselineTrend: string;
};

function averageProfileScore(profiles: CustomerProfileDetail[]): number {
  if (profiles.length === 0) {
    return 0;
  }

  return Math.round(
    profiles.reduce((sum, profile) => sum + profile.healthScore, 0) / profiles.length,
  );
}

function atRiskShare(segments: CrmRelationshipSegment[]): number {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const atRisk = segments
    .filter((segment) => segment.status !== "healthy")
    .reduce((sum, segment) => sum + segment.count, 0);

  return total === 0 ? 0 : atRisk / total;
}

/** Computes customer health score from portfolio profiles and segment rules. */
export function computeCustomerHealthScore(input: CustomerHealthInput): CustomerHealthScoreResult {
  const portfolioAverage = averageProfileScore(input.profiles);
  const riskPenalty = Math.round(atRiskShare(input.segments) * 20);
  const score = Math.max(0, Math.min(100, portfolioAverage - riskPenalty));
  const status = deriveHealthStatus(score);

  const engagementStatus: HealthStatus =
    portfolioAverage >= 80 ? "healthy" : portfolioAverage >= 65 ? "attention" : "critical";
  const retentionStatus: HealthStatus =
    input.segments.find((segment) => segment.label === "At Risk")?.status ?? "healthy";
  const pipelineStatus: HealthStatus =
    input.profiles.filter((profile) => profile.openOpportunities > 0).length >= 2
      ? "healthy"
      : "attention";

  const trend =
    score >= input.baselineScore ? input.baselineTrend : `${score - input.baselineScore} pts`;

  return {
    score,
    trend,
    status,
    summary:
      score >= 80
        ? "Customer portfolio health is strong with manageable at-risk exposure."
        : score >= 65
          ? "Customer health is stable but at-risk accounts require proactive follow-up."
          : "Customer health is under pressure — VIP retention actions are required today.",
    drivers: [
      {
        label: "Engagement",
        status: engagementStatus,
        detail: `Portfolio average ${portfolioAverage}/100`,
      },
      {
        label: "Retention",
        status: retentionStatus,
        detail: `${Math.round(atRiskShare(input.segments) * 100)}% non-healthy base`,
      },
      {
        label: "Pipeline",
        status: pipelineStatus,
        detail: `${input.profiles.filter((p) => p.openOpportunities > 0).length} active accounts with open deals`,
      },
      {
        label: "At-Risk Accounts",
        status: retentionStatus,
        detail: "Weighted by segment share and VIP inactivity",
      },
    ],
  };
}
