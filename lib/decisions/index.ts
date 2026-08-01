/**
 * ORION Executive Decision Intelligence — public API (Mission S1B+ / P-003).
 * All workspaces must consume decisions through this module.
 */

export { DecisionService, decisionService } from "@/lib/decisions/DecisionService";
export type { DecisionRepository } from "@/lib/decisions/repository/DecisionRepository";
export {
  InMemoryDecisionRepository,
  defaultDecisionRepository,
} from "@/lib/decisions/repository/InMemoryDecisionRepository";
export { seededDecisionRepository } from "@/lib/decisions/data/seed-decisions";
export { decisionAnalytics, DecisionAnalytics } from "@/lib/decisions/analytics/DecisionAnalytics";
export {
  decisionLearningEngine,
  DecisionLearningEngine,
} from "@/lib/decisions/learning/DecisionLearningEngine";
export {
  executiveLearningEngine,
  ExecutiveLearningEngine,
} from "@/lib/decisions/learning/ExecutiveLearningEngine";
export {
  decisionIntelligenceEngine,
  DecisionIntelligenceEngine,
} from "@/lib/decisions/intelligence/DecisionIntelligenceEngine";
export {
  DecisionSearchService,
  createDecisionSearchService,
} from "@/lib/decisions/search/DecisionSearchService";
export {
  canTransition,
  normalizeDecisionStatus,
  statusFromAction,
  CANON_DECISION_STATUSES,
} from "@/lib/decisions/lifecycle/DecisionLifecycle";
export { getDecisionTimeline } from "@/lib/decisions/timeline/DecisionTimeline";
export { emitDecisionEvent, decisionEventStore } from "@/lib/decisions/events/DecisionEvents";
export { mapRecommendationToDecisionInput } from "@/lib/decisions/mappers/recommendation-to-decision";

export type {
  CreateDecisionInput,
  DecisionAnalyticsSnapshot,
  DecisionBriefIntelligence,
  DecisionEvent,
  DecisionIntelligenceSnapshot,
  DecisionLearningMetrics,
  DecisionSearchFilter,
  DecisionSearchResult,
  DecisionStatus,
  ExecutiveActionRecord,
  ExecutiveActionType,
  ExecutiveBehaviorAnalytics,
  ExecutiveDecision,
  ExecutiveInsight,
  ExecutiveLearningSnapshot,
  ExecutiveScorecard,
  OutcomeCorrelation,
  OutcomeMetric,
  PlatformLearningTrends,
  RecommendationQualityMetrics,
  RecommendationIntelligence,
  RecordDecisionActionInput,
  RecordDecisionCommentInput,
  RecordDecisionLessonInput,
  TimelineEntry,
  TransitionDecisionInput,
} from "@/types/decisions";
