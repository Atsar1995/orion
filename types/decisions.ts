/**
 * ORION Executive Decision Intelligence — platform types (Mission S1B+).
 */

import type { ExecutiveEvidence } from "@/types/executive/evidence";

/** Lifecycle status for an executive decision (Mission P-003 Canon lifecycle). */
export type DecisionStatus =
  | "draft"
  | "recommended"
  | "pending_review"
  | "accepted"
  | "rejected"
  | "delegated"
  | "deferred"
  | "in_progress"
  | "completed"
  | "reopened"
  | "archived"
  /** @deprecated Use `recommended` */
  | "new"
  /** @deprecated Use `deferred` */
  | "snoozed"
  /** @deprecated Use `rejected` */
  | "dismissed";

export type DecisionUrgency = "low" | "medium" | "high" | "critical";

/** Recorded executive action on a decision. */
export type ExecutiveActionType =
  | "recommended"
  | "pending_review"
  | "accepted"
  | "rejected"
  | "delegated"
  | "deferred"
  | "in_progress"
  | "completed"
  | "reopened"
  | "archived"
  /** @deprecated Use `deferred` */
  | "snoozed";

export type RecommendationType =
  | "executive"
  | "follow-up"
  | "growth"
  | "risk"
  | "priority"
  | "operational";

export type RiskLevel = "low" | "medium" | "high" | "critical";

/** Permanent recommendation intelligence preserved with every decision. */
export type RecommendationIntelligence = {
  readonly recommendationId: string;
  readonly title: string;
  readonly text: string;
  readonly evidence: readonly ExecutiveEvidence[];
  readonly confidenceScore: number;
  readonly confidenceLabel: string;
  readonly businessImpact: string;
  readonly trigger: string;
  readonly sourceServices: readonly string[];
  readonly priority: number;
  readonly riskLevel: RiskLevel;
  readonly estimatedValue?: number;
  readonly recommendationType: RecommendationType;
};

/** Reference to a related business entity (customer, opportunity, etc.). */
export type EntityReference = {
  readonly entityType: string;
  readonly entityId: string;
  readonly entityLabel?: string;
};

/** Executive action record with audit metadata. */
export type ExecutiveActionRecord = {
  readonly id: string;
  readonly action: ExecutiveActionType;
  readonly executiveId: string;
  readonly executiveName: string;
  readonly notes?: string;
  readonly timestamp: string;
  readonly delegateId?: string;
  readonly delegateName?: string;
  readonly dueDate?: string;
};

/** Measurable business outcome linked to a decision. */
export type OutcomeMetric = {
  readonly id: string;
  readonly workspace: string;
  readonly metricType: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly recordedAt: string;
};

/** Timeline entry for executive memory. */
export type TimelineEntry = {
  readonly id: string;
  readonly timestamp: string;
  readonly type:
    | "created"
    | "action"
    | "outcome"
    | "note"
    | "comment"
    | "status_change"
    | "evidence_update"
    | "lesson"
    | "audit";
  readonly title: string;
  readonly description: string;
  readonly actorId?: string;
  readonly actorName?: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type DecisionAttachment = {
  readonly id: string;
  readonly label: string;
  readonly url?: string;
  readonly mimeType?: string;
  readonly uploadedAt: string;
  readonly uploadedBy: string;
};

export type DecisionLesson = {
  readonly id: string;
  readonly text: string;
  readonly recordedAt: string;
  readonly recordedBy: string;
  readonly recordedByName: string;
};

export type AuditHistoryEntry = {
  readonly id: string;
  readonly timestamp: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly action: string;
  readonly detail: string;
};

/** Computed intelligence for a single decision (Mission P-003). */
export type DecisionIntelligenceSnapshot = {
  readonly decisionId: string;
  readonly priorityScore: number;
  readonly riskScore: number;
  readonly businessImpact: number;
  readonly confidenceScore: number;
  readonly decisionAgeHours: number;
  readonly escalationStatus: "none" | "attention" | "overdue";
  readonly dependencyAnalysis: {
    readonly relatedCount: number;
    readonly blockedByIncomplete: number;
    readonly summary: string;
  };
};

/** First-class executive decision entity. */
export type ExecutiveDecision = {
  readonly id: string;
  readonly organizationId: string;
  readonly workspaceId: string;
  readonly workspace: string;
  readonly entityReference?: EntityReference;
  readonly title: string;
  readonly description: string;
  readonly urgency: DecisionUrgency;
  readonly recommendation: RecommendationIntelligence;
  readonly status: DecisionStatus;
  readonly ownerId?: string;
  readonly ownerName?: string;
  readonly delegatedToId?: string;
  readonly delegatedToName?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly decisionDate?: string;
  readonly completionDate?: string;
  readonly actions: readonly ExecutiveActionRecord[];
  readonly outcomes: readonly OutcomeMetric[];
  readonly lessonsLearned: readonly DecisionLesson[];
  readonly relatedDecisionIds: readonly string[];
  readonly attachments: readonly DecisionAttachment[];
  readonly auditHistory: readonly AuditHistoryEntry[];
  readonly timeline: readonly TimelineEntry[];
  readonly deferredUntil?: string;
  /** @deprecated Use `deferredUntil` */
  readonly snoozedUntil?: string;
};

export type DecisionSearchFilter = {
  readonly status?: DecisionStatus | DecisionStatus[];
  readonly executiveId?: string;
  readonly ownerId?: string;
  readonly workspace?: string;
  readonly priority?: number;
  readonly minPriority?: number;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly riskLevel?: RiskLevel;
  readonly minConfidence?: number;
  readonly maxConfidence?: number;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly query?: string;
  readonly keyword?: string;
  readonly hasOutcome?: boolean;
  readonly escalationStatus?: DecisionIntelligenceSnapshot["escalationStatus"];
};

export type RecordDecisionActionInput = {
  readonly action: ExecutiveActionType;
  readonly notes?: string;
  readonly delegateId?: string;
  readonly delegateName?: string;
  readonly dueDate?: string;
};

export type TransitionDecisionInput = {
  readonly toStatus: DecisionStatus;
  readonly notes?: string;
  readonly delegateId?: string;
  readonly delegateName?: string;
  readonly dueDate?: string;
};

export type RecordDecisionCommentInput = {
  readonly text: string;
};

export type RecordDecisionLessonInput = {
  readonly text: string;
};

export type DecisionSearchResult = {
  readonly decision: ExecutiveDecision;
  readonly intelligence: DecisionIntelligenceSnapshot;
};

export type CreateDecisionInput = {
  readonly recommendationId: string;
  readonly title: string;
  readonly text: string;
  readonly evidence: readonly ExecutiveEvidence[];
  readonly confidenceScore: number;
  readonly confidenceLabel: string;
  readonly businessImpact: string;
  readonly trigger?: string;
  readonly sourceServices?: readonly string[];
  readonly priority: number;
  readonly urgency?: DecisionUrgency;
  readonly riskLevel?: RiskLevel;
  readonly estimatedValue?: number;
  readonly recommendationType?: RecommendationType;
  readonly workspace: string;
  readonly workspaceId: string;
  readonly entityReference?: EntityReference;
  readonly relatedDecisionIds?: readonly string[];
  readonly status?: DecisionStatus;
};

/** Learning metrics calculated by the Decision Learning Engine. */
export type DecisionLearningMetrics = {
  readonly acceptanceRate: number;
  readonly completionRate: number;
  readonly delegationRate: number;
  readonly dismissalRate: number;
  readonly averageResolutionTimeHours: number;
  readonly averageDecisionAgeHours: number;
  readonly mostSuccessfulTypes: readonly { type: RecommendationType; count: number }[];
  readonly mostIgnoredTypes: readonly { type: RecommendationType; count: number }[];
  readonly businessValueDelivered: number;
  readonly confidenceAccuracy: number;
};

/** Recommendation quality metrics by type (Mission S1F). */
export type RecommendationQualityByType = {
  readonly type: RecommendationType;
  readonly acceptanceRate: number;
  readonly completionRate: number;
  readonly averageTimeToActionHours: number;
  readonly businessImpactRealized: number;
  readonly confidenceCalibration: number;
};

/** Platform recommendation quality metrics (Mission S1F). */
export type RecommendationQualityMetrics = {
  readonly byType: readonly RecommendationQualityByType[];
  readonly overallCompletionRate: number;
  readonly overallAverageTimeToActionHours: number;
  readonly totalBusinessImpactRealized: number;
  readonly overallConfidenceCalibration: number;
};

/** Executive behavior analytics (Mission S1F). */
export type ExecutiveBehaviorAnalytics = {
  readonly decisionsPerDay: readonly { date: string; count: number }[];
  readonly delegationPatterns: readonly { delegateName: string; count: number }[];
  readonly snoozeFrequency: number;
  readonly reopenedDecisions: number;
  readonly followThroughRate: number;
};

/** Outcome correlation chain: Recommendation → Action → Result (Mission S1F). */
export type OutcomeCorrelation = {
  readonly decisionId: string;
  readonly recommendationTitle: string;
  readonly recommendationType: RecommendationType;
  readonly action: ExecutiveActionType;
  readonly outcomeValue: number;
  readonly outcomeLabel: string;
  readonly confidenceScore: number;
  readonly cycleHours: number;
};

/** Personalized executive scorecard (Mission S1F). */
export type ExecutiveScorecard = {
  readonly executiveId: string;
  readonly executiveName: string;
  readonly mostEffectiveCategories: readonly {
    readonly type: RecommendationType;
    readonly successRate: number;
  }[];
  readonly averageDecisionCycleHours: number;
  readonly highImpactActions: readonly { readonly title: string; readonly value: number }[];
  readonly missedOpportunities: readonly {
    readonly title: string;
    readonly estimatedValue: number;
    readonly reason: string;
  }[];
};

/** Platform-wide learning trends (Mission S1F). */
export type PlatformLearningTrends = {
  readonly highestSuccessTypes: readonly { readonly type: RecommendationType; readonly successRate: number }[];
  readonly lowConfidenceSuccesses: readonly {
    readonly title: string;
    readonly confidenceScore: number;
    readonly outcomeValue: number;
  }[];
  readonly highConfidenceRejections: readonly {
    readonly title: string;
    readonly confidenceScore: number;
    readonly reason: string;
  }[];
};

/** Actionable executive insight for brief and dashboards (Mission S1F). */
export type ExecutiveInsight = {
  readonly id: string;
  readonly category: "quality" | "behavior" | "outcome" | "scorecard" | "platform";
  readonly headline: string;
  readonly detail: string;
  readonly metric?: string;
};

/** Full executive learning snapshot (Mission S1F). */
export type ExecutiveLearningSnapshot = {
  readonly generatedAt: string;
  readonly quality: RecommendationQualityMetrics;
  readonly behavior: ExecutiveBehaviorAnalytics;
  readonly correlations: readonly OutcomeCorrelation[];
  readonly scorecard: ExecutiveScorecard;
  readonly platformTrends: PlatformLearningTrends;
  readonly insights: readonly ExecutiveInsight[];
};

export type DecisionAnalyticsSnapshot = {
  readonly generatedAt: string;
  readonly totalDecisions: number;
  readonly learning: DecisionLearningMetrics;
  readonly executiveLearning?: ExecutiveLearningSnapshot;
  readonly decisionTrend: readonly { date: string; count: number }[];
  readonly acceptanceTrend: readonly { date: string; rate: number }[];
  readonly outcomeTrend: readonly { date: string; value: number }[];
  readonly businessValueTrend: readonly { date: string; value: number }[];
  readonly averageConfidence: number;
  readonly topExecutives: readonly { executiveId: string; name: string; count: number }[];
  readonly topRecommendationTypes: readonly { type: RecommendationType; count: number }[];
};

/** Executive Brief decision intelligence block. */
export type DecisionBriefIntelligence = {
  readonly periodLabel: string;
  readonly recommendationsGenerated: number;
  readonly accepted: number;
  readonly delegated: number;
  readonly dismissed: number;
  readonly revenueImpact: number;
  readonly confidenceAccuracy: number;
  readonly topRecommendation?: {
    readonly title: string;
    readonly estimatedSavings: number;
    readonly decisionId?: string;
  };
  readonly insights?: readonly ExecutiveInsight[];
};

export type DecisionEventType =
  | "decision.created"
  | "decision.action_recorded"
  | "decision.transitioned"
  | "decision.completed"
  | "decision.outcome_recorded"
  | "decision.lesson_recorded"
  | "decision.comment_recorded";

export type DecisionEvent = {
  readonly id: string;
  readonly type: DecisionEventType;
  readonly decisionId: string;
  readonly organizationId: string;
  readonly timestamp: string;
  readonly payload: Readonly<Record<string, string>>;
};
