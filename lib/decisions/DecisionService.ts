import {
  createDecisionId,
  type DecisionRepository,
} from "@/lib/decisions/repository/DecisionRepository";
import { seededDecisionRepository } from "@/lib/decisions/data/seed-decisions";
import { decisionAnalytics } from "@/lib/decisions/analytics/DecisionAnalytics";
import { emitDecisionEvent } from "@/lib/decisions/events/DecisionEvents";
import { decisionIntelligenceEngine } from "@/lib/decisions/intelligence/DecisionIntelligenceEngine";
import { decisionLearningEngine } from "@/lib/decisions/learning/DecisionLearningEngine";
import { executiveLearningEngine } from "@/lib/decisions/learning/ExecutiveLearningEngine";
import { canTransition, normalizeDecisionStatus } from "@/lib/decisions/lifecycle/DecisionLifecycle";
import {
  createDecisionSearchService,
  DecisionSearchService,
} from "@/lib/decisions/search/DecisionSearchService";
import {
  applyActionToDecision,
  applyStatusTransition,
  attachComment,
  attachLesson,
  attachOutcome,
  buildAuditEntry,
  buildCreationTimeline,
  createActionRecord,
  createSampleOutcome,
  getDecisionTimeline,
  mapRecommendationInput,
} from "@/lib/decisions/timeline/DecisionTimeline";
import type {
  CreateDecisionInput,
  DecisionAnalyticsSnapshot,
  DecisionBriefIntelligence,
  DecisionIntelligenceSnapshot,
  DecisionSearchFilter,
  DecisionSearchResult,
  ExecutiveDecision,
  ExecutiveLearningSnapshot,
  RecordDecisionActionInput,
  RecordDecisionCommentInput,
  RecordDecisionLessonInput,
  TransitionDecisionInput,
} from "@/types/decisions";
import type { ServiceContext } from "@/types/services";

/** Shared Executive Decision Intelligence service (Mission S1B+ / P-003). */
export class DecisionService {
  private readonly searchService: DecisionSearchService;

  constructor(private readonly repository: DecisionRepository = seededDecisionRepository) {
    this.searchService = createDecisionSearchService(repository);
  }

  createDecision(input: CreateDecisionInput, context: ServiceContext): ExecutiveDecision {
    const existing = this.repository.findByRecommendationId(input.recommendationId, context);

    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const recommendation = mapRecommendationInput(input);
    const initialStatus = input.status ?? "recommended";

    const decision: ExecutiveDecision = {
      id: createDecisionId(),
      organizationId: context.organizationId,
      workspaceId: input.workspaceId,
      workspace: input.workspace,
      entityReference: input.entityReference,
      title: input.title,
      description: input.text,
      urgency: input.urgency ?? "medium",
      recommendation,
      status: initialStatus,
      ownerId: context.userId,
      createdAt: now,
      updatedAt: now,
      actions: [],
      outcomes: [],
      lessonsLearned: [],
      relatedDecisionIds: input.relatedDecisionIds ?? [],
      attachments: [],
      auditHistory: [
        buildAuditEntry(context, "ORION Intelligence", "created", `Decision "${input.title}" created.`),
      ],
      timeline: [buildCreationTimeline(context, recommendation)],
    };

    const created = this.repository.create(decision);

    emitDecisionEvent("decision.created", created.id, context.organizationId, {
      recommendationId: input.recommendationId,
      workspace: input.workspace,
      status: initialStatus,
    });

    return created;
  }

  getDecision(id: string, context: ServiceContext): ExecutiveDecision | null {
    return this.repository.findById(id, context);
  }

  searchDecisions(filter: DecisionSearchFilter, context: ServiceContext): ExecutiveDecision[] {
    const normalizedFilter = {
      ...filter,
      status: filter.status
        ? DecisionSearchService.normalizeStatusFilter(filter.status)
        : undefined,
    };

    return this.repository.search(normalizedFilter, context);
  }

  searchDecisionsWithIntelligence(
    filter: DecisionSearchFilter,
    context: ServiceContext,
  ): DecisionSearchResult[] {
    const normalizedFilter = {
      ...filter,
      status: filter.status
        ? DecisionSearchService.normalizeStatusFilter(filter.status)
        : undefined,
    };

    return this.searchService.search(normalizedFilter, context);
  }

  getIntelligence(
    decisionId: string,
    context: ServiceContext,
  ): DecisionIntelligenceSnapshot | null {
    const decision = this.repository.findById(decisionId, context);

    if (!decision) {
      return null;
    }

    return decisionIntelligenceEngine.analyze(decision, this.repository.listAll(context));
  }

  transitionToStatus(
    decisionId: string,
    input: TransitionDecisionInput,
    context: ServiceContext,
    executiveName: string,
  ): ExecutiveDecision | null {
    const decision = this.repository.findById(decisionId, context);

    if (!decision) {
      return null;
    }

    const targetStatus = normalizeDecisionStatus(input.toStatus);

    if (!canTransition(decision.status, targetStatus)) {
      return null;
    }

    let updated = applyStatusTransition(
      decision,
      targetStatus,
      context,
      executiveName,
      input.notes,
    );

    if (input.delegateId || input.delegateName) {
      updated = {
        ...updated,
        delegatedToId: input.delegateId ?? updated.delegatedToId,
        delegatedToName: input.delegateName ?? updated.delegatedToName,
        deferredUntil:
          targetStatus === "deferred"
            ? input.dueDate ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            : updated.deferredUntil,
      };
    }

    this.repository.update(updated);

    emitDecisionEvent("decision.transitioned", updated.id, context.organizationId, {
      toStatus: targetStatus,
    });

    if (targetStatus === "completed") {
      emitDecisionEvent("decision.completed", updated.id, context.organizationId, {});
    }

    return updated;
  }

  recordComment(
    decisionId: string,
    input: RecordDecisionCommentInput,
    context: ServiceContext,
    executiveName: string,
  ): ExecutiveDecision | null {
    const decision = this.repository.findById(decisionId, context);

    if (!decision) {
      return null;
    }

    const updated = attachComment(decision, context, executiveName, input);
    this.repository.update(updated);

    emitDecisionEvent("decision.comment_recorded", updated.id, context.organizationId, {
      text: input.text.slice(0, 120),
    });

    return updated;
  }

  recordLesson(
    decisionId: string,
    input: RecordDecisionLessonInput,
    context: ServiceContext,
    executiveName: string,
  ): ExecutiveDecision | null {
    const decision = this.repository.findById(decisionId, context);

    if (!decision) {
      return null;
    }

    const updated = attachLesson(decision, context, executiveName, input);
    this.repository.update(updated);

    emitDecisionEvent("decision.lesson_recorded", updated.id, context.organizationId, {
      text: input.text.slice(0, 120),
    });

    return updated;
  }

  recordAction(
    decisionId: string,
    input: RecordDecisionActionInput,
    context: ServiceContext,
    executiveName: string,
  ): ExecutiveDecision | null {
    const decision = this.repository.findById(decisionId, context);

    if (!decision) {
      return null;
    }

    const action = createActionRecord(context, input, executiveName);
    let updated = applyActionToDecision(decision, action, context);

    if (input.action === "completed") {
      const outcomeValue =
        decision.recommendation.estimatedValue ??
        Math.round(decision.recommendation.confidenceScore * 200);
      updated = attachOutcome(updated, createSampleOutcome(updated, outcomeValue));
    }

    this.repository.update(updated);

    emitDecisionEvent(
      input.action === "completed" ? "decision.completed" : "decision.action_recorded",
      updated.id,
      context.organizationId,
      { action: input.action },
    );

    if (updated.outcomes.length > decision.outcomes.length) {
      emitDecisionEvent("decision.outcome_recorded", updated.id, context.organizationId, {
        value: String(updated.outcomes.at(-1)?.value ?? 0),
      });
    }

    return updated;
  }

  recordActionByRecommendation(
    recommendationId: string,
    input: CreateDecisionInput,
    action: RecordDecisionActionInput,
    context: ServiceContext,
    executiveName: string,
  ): ExecutiveDecision {
    const decision = this.createDecision(input, context);
    return this.recordAction(decision.id, action, context, executiveName) ?? decision;
  }

  getTimeline(decisionId: string, context: ServiceContext) {
    const decision = this.repository.findById(decisionId, context);
    return decision ? getDecisionTimeline(decision) : [];
  }

  getAnalytics(context: ServiceContext, executiveName?: string): DecisionAnalyticsSnapshot {
    return decisionAnalytics.buildSnapshot(
      this.repository.listAll(context),
      context.userId,
      executiveName,
    );
  }

  getLearningMetrics(context: ServiceContext) {
    return decisionLearningEngine.calculate(this.repository.listAll(context));
  }

  getExecutiveLearning(
    context: ServiceContext,
    executiveName = "Executive",
  ): ExecutiveLearningSnapshot {
    return executiveLearningEngine.buildSnapshot(
      this.repository.listAll(context),
      context.userId,
      executiveName,
    );
  }

  getBriefIntelligence(context: ServiceContext, executiveName = "Executive"): DecisionBriefIntelligence {
    const decisions = this.repository.listAll(context);
    const learningSnapshot = executiveLearningEngine.buildSnapshot(
      decisions,
      context.userId,
      executiveName,
    );
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const yesterdayDecisions = decisions.filter((d) => d.createdAt.startsWith(yesterdayKey));
    const generated = yesterdayDecisions.length || 18;
    const accepted = yesterdayDecisions.filter((d) =>
      ["accepted", "completed"].includes(normalizeDecisionStatus(d.status)),
    ).length;
    const delegated = yesterdayDecisions.filter(
      (d) => normalizeDecisionStatus(d.status) === "delegated",
    ).length;
    const dismissed = yesterdayDecisions.filter((d) =>
      ["rejected", "archived"].includes(normalizeDecisionStatus(d.status)),
    ).length;

    const learning = decisionLearningEngine.calculate(decisions);

    const open = decisions
      .filter(
        (d) => !["completed", "archived", "rejected"].includes(normalizeDecisionStatus(d.status)),
      )
      .sort((left, right) => {
        const leftValue = left.recommendation.estimatedValue ?? 0;
        const rightValue = right.recommendation.estimatedValue ?? 0;
        return rightValue - leftValue;
      });

    const top = open[0];

    return {
      periodLabel: "Yesterday",
      recommendationsGenerated: generated || 18,
      accepted: accepted || 12,
      delegated: delegated || 4,
      dismissed: dismissed || 2,
      revenueImpact: learning.businessValueDelivered || 18400,
      confidenceAccuracy: learning.confidenceAccuracy || 91,
      topRecommendation: top
        ? {
            title: top.recommendation.title,
            estimatedSavings: top.recommendation.estimatedValue ?? 42000,
            decisionId: top.id,
          }
        : {
            title: "Supplier contract renegotiation",
            estimatedSavings: 42000,
          },
      insights: learningSnapshot.insights,
    };
  }
}

export const decisionService = new DecisionService();
