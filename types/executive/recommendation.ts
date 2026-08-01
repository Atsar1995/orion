import type { ConfidenceScore } from "@/types/executive/confidence";
import type { ExecutiveEvidence } from "@/types/executive/evidence";

export type ExecutiveRecommendationCategory =
  | "executive"
  | "follow-up"
  | "growth"
  | "risk"
  | "priority";

export type ExecutiveRecommendationAction =
  | "act"
  | "delegate"
  | "defer"
  | "reject"
  | "complete"
  /** @deprecated Use `defer` */
  | "snooze"
  | "explain";

export type ExecutiveRecommendationRiskLevel = "low" | "medium" | "high" | "critical";

/** Ranked executive recommendation with evidence and confidence (EC-003 / P-002). */
export type ExecutiveRecommendation = {
  id: string;
  priority: number;
  priorityLabel: string;
  title: string;
  description: string;
  impact: string;
  category: ExecutiveRecommendationCategory;
  evidence: ExecutiveEvidence[];
  confidence: ConfidenceScore;
  actions: ExecutiveRecommendationAction[];
  href?: string;
  businessValue?: string;
  riskLevel?: ExecutiveRecommendationRiskLevel;
  recommendedAction?: string;
  alternativeActions?: readonly string[];
  expectedOutcome?: string;
};
