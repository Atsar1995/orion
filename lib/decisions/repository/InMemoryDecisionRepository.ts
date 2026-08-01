import { normalizeDecisionStatus } from "@/lib/decisions/lifecycle/DecisionLifecycle";
import type { DecisionRepository } from "@/lib/decisions/repository/DecisionRepository";
import type { DecisionSearchFilter, ExecutiveDecision } from "@/types/decisions";
import type { ServiceContext } from "@/types/services";

function matchesFilter(decision: ExecutiveDecision, filter: DecisionSearchFilter): boolean {
  if (filter.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    const normalizedStatuses = statuses.map((status) => normalizeDecisionStatus(status));

    if (!normalizedStatuses.includes(normalizeDecisionStatus(decision.status))) {
      return false;
    }
  }

  if (filter.executiveId) {
    const acted = decision.actions.some((action) => action.executiveId === filter.executiveId);
    const isOwner = decision.ownerId === filter.executiveId;

    if (!acted && !isOwner && normalizeDecisionStatus(decision.status) === "recommended") {
      return false;
    }
  }

  if (filter.ownerId && decision.ownerId !== filter.ownerId) {
    const acted = decision.actions.some((action) => action.executiveId === filter.ownerId);
    if (!acted) {
      return false;
    }
  }

  if (filter.workspace && decision.workspace !== filter.workspace) {
    return false;
  }

  if (filter.priority !== undefined && decision.recommendation.priority !== filter.priority) {
    return false;
  }

  if (filter.minPriority !== undefined && decision.recommendation.priority > filter.minPriority) {
    return false;
  }

  if (filter.riskLevel && decision.recommendation.riskLevel !== filter.riskLevel) {
    return false;
  }

  if (filter.entityType && decision.entityReference?.entityType !== filter.entityType) {
    return false;
  }

  if (filter.entityId && decision.entityReference?.entityId !== filter.entityId) {
    return false;
  }

  if (filter.fromDate && decision.createdAt < filter.fromDate) {
    return false;
  }

  if (filter.toDate && decision.createdAt > filter.toDate) {
    return false;
  }

  if (filter.hasOutcome !== undefined) {
    const hasOutcome = decision.outcomes.length > 0;
    if (filter.hasOutcome !== hasOutcome) {
      return false;
    }
  }

  const keyword = filter.keyword ?? filter.query;

  if (keyword) {
    const normalized = keyword.toLowerCase();
    const haystack = [
      decision.title,
      decision.description,
      decision.recommendation.title,
      decision.recommendation.text,
      decision.recommendation.businessImpact,
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(normalized)) {
      return false;
    }
  }

  return true;
}

/** In-memory decision repository (Mission S1B+ / P-003). */
export class InMemoryDecisionRepository implements DecisionRepository {
  readonly entityName = "ExecutiveDecision" as const;

  private readonly decisions = new Map<string, ExecutiveDecision>();

  constructor(initial: ExecutiveDecision[] = []) {
    for (const decision of initial) {
      this.decisions.set(decision.id, decision);
    }
  }

  create(decision: ExecutiveDecision): ExecutiveDecision {
    this.decisions.set(decision.id, decision);
    return decision;
  }

  update(decision: ExecutiveDecision): ExecutiveDecision {
    this.decisions.set(decision.id, decision);
    return decision;
  }

  findById(id: string, context: ServiceContext): ExecutiveDecision | null {
    const decision = this.decisions.get(id);
    if (!decision || decision.organizationId !== context.organizationId) {
      return null;
    }

    return decision;
  }

  findByRecommendationId(
    recommendationId: string,
    context: ServiceContext,
  ): ExecutiveDecision | null {
    for (const decision of this.decisions.values()) {
      if (
        decision.organizationId === context.organizationId &&
        decision.recommendation.recommendationId === recommendationId
      ) {
        return decision;
      }
    }

    return null;
  }

  search(filter: DecisionSearchFilter, context: ServiceContext): ExecutiveDecision[] {
    return this.listAll(context)
      .filter((decision) => matchesFilter(decision, filter))
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  listAll(context: ServiceContext): ExecutiveDecision[] {
    return [...this.decisions.values()].filter(
      (decision) => decision.organizationId === context.organizationId,
    );
  }

  /** Test helper — clears all decisions. */
  clear(): void {
    this.decisions.clear();
  }
}

export const defaultDecisionRepository = new InMemoryDecisionRepository();
