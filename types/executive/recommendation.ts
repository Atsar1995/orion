import type { ConfidenceScore } from "@/types/executive/confidence";
import type { ExecutiveEvidence } from "@/types/executive/evidence";

export type ExecutiveRecommendationCategory =
  | "executive"
  | "follow-up"
  | "growth"
  | "risk"
  | "priority";

export type ExecutiveRecommendationAction = "act" | "delegate" | "snooze" | "explain";

/** Ranked executive recommendation with evidence and confidence (EC-003). */
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
};
