import { normalizeDecisionStatus } from "@/lib/decisions/lifecycle/DecisionLifecycle";
import type {
  DecisionIntelligenceSnapshot,
  DecisionStatus,
  ExecutiveDecision,
  RiskLevel,
} from "@/types/decisions";

const RISK_SCORES: Record<RiskLevel, number> = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 95,
};

const OPEN_STATUSES = new Set<DecisionStatus>([
  "recommended",
  "pending_review",
  "accepted",
  "delegated",
  "deferred",
  "in_progress",
  "reopened",
  "new",
  "snoozed",
]);

function hoursSince(iso: string): number {
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
}

function priorityScore(decision: ExecutiveDecision): number {
  const urgencyWeight =
    decision.urgency === "critical"
      ? 40
      : decision.urgency === "high"
        ? 30
        : decision.urgency === "medium"
          ? 20
          : 10;
  const priorityWeight = Math.min(30, (6 - decision.recommendation.priority) * 6);
  const valueWeight = Math.min(
    30,
    Math.round((decision.recommendation.estimatedValue ?? 0) / 5000),
  );

  return Math.min(100, urgencyWeight + priorityWeight + valueWeight);
}

function escalationStatus(
  decision: ExecutiveDecision,
): DecisionIntelligenceSnapshot["escalationStatus"] {
  const status = normalizeDecisionStatus(decision.status);

  if (!OPEN_STATUSES.has(status)) {
    return "none";
  }

  const deferDate = decision.deferredUntil ?? decision.snoozedUntil;
  if (deferDate && new Date(deferDate).getTime() < Date.now()) {
    return "overdue";
  }

  const age = hoursSince(decision.createdAt);
  if (status === "deferred" || status === "pending_review") {
    return age > 48 ? "overdue" : age > 24 ? "attention" : "none";
  }

  return age > 72 ? "attention" : "none";
}

function dependencyAnalysis(
  decision: ExecutiveDecision,
  allDecisions: ExecutiveDecision[],
): DecisionIntelligenceSnapshot["dependencyAnalysis"] {
  const related = decision.relatedDecisionIds;
  const relatedDecisions = allDecisions.filter((entry) => related.includes(entry.id));
  const blocked = relatedDecisions.filter(
    (entry) => !["completed", "archived"].includes(normalizeDecisionStatus(entry.status)),
  ).length;

  const summary =
    related.length === 0
      ? "No related decisions."
      : blocked > 0
        ? `${blocked} related decision(s) still open.`
        : `${related.length} related decision(s) tracked.`;

  return {
    relatedCount: related.length,
    blockedByIncomplete: blocked,
    summary,
  };
}

/** Computes per-decision intelligence scores (Mission P-003). */
export class DecisionIntelligenceEngine {
  analyze(decision: ExecutiveDecision, allDecisions: ExecutiveDecision[] = []): DecisionIntelligenceSnapshot {
    return {
      decisionId: decision.id,
      priorityScore: priorityScore(decision),
      riskScore: RISK_SCORES[decision.recommendation.riskLevel],
      businessImpact:
        decision.outcomes.reduce((sum, outcome) => sum + outcome.value, 0) ||
        decision.recommendation.estimatedValue ||
        0,
      confidenceScore: decision.recommendation.confidenceScore,
      decisionAgeHours: Math.round(hoursSince(decision.createdAt) * 10) / 10,
      escalationStatus: escalationStatus(decision),
      dependencyAnalysis: dependencyAnalysis(decision, allDecisions),
    };
  }

  analyzeAll(decisions: ExecutiveDecision[]): DecisionIntelligenceSnapshot[] {
    return decisions.map((decision) => this.analyze(decision, decisions));
  }
}

export const decisionIntelligenceEngine = new DecisionIntelligenceEngine();
