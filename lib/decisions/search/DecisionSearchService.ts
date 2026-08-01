import { decisionIntelligenceEngine } from "@/lib/decisions/intelligence/DecisionIntelligenceEngine";
import { normalizeDecisionStatus } from "@/lib/decisions/lifecycle/DecisionLifecycle";
import type { DecisionRepository } from "@/lib/decisions/repository/DecisionRepository";
import type { DecisionSearchFilter, DecisionSearchResult } from "@/types/decisions";
import type { ServiceContext } from "@/types/services";

/** Platform decision search with intelligence enrichment (Mission P-003). */
export class DecisionSearchService {
  constructor(private readonly repository: DecisionRepository) {}

  search(filter: DecisionSearchFilter, context: ServiceContext): DecisionSearchResult[] {
    const keyword = filter.keyword ?? filter.query;
    const normalizedFilter = { ...filter, query: keyword };

    const decisions = this.repository.search(normalizedFilter, context);
    const all = this.repository.listAll(context);

    const results = decisions.map((decision) => ({
      decision,
      intelligence: decisionIntelligenceEngine.analyze(decision, all),
    }));

    let filtered = results;

    if (filter.minConfidence !== undefined) {
      filtered = filtered.filter(
        (entry) => entry.intelligence.confidenceScore >= filter.minConfidence!,
      );
    }

    if (filter.maxConfidence !== undefined) {
      filtered = filtered.filter(
        (entry) => entry.intelligence.confidenceScore <= filter.maxConfidence!,
      );
    }

    if (filter.riskLevel) {
      filtered = filtered.filter(
        (entry) => entry.decision.recommendation.riskLevel === filter.riskLevel,
      );
    }

    if (filter.ownerId) {
      filtered = filtered.filter(
        (entry) =>
          entry.decision.ownerId === filter.ownerId ||
          entry.decision.actions.some((action) => action.executiveId === filter.ownerId),
      );
    }

    if (filter.minPriority !== undefined) {
      filtered = filtered.filter(
        (entry) => entry.decision.recommendation.priority <= filter.minPriority!,
      );
    }

    if (filter.escalationStatus) {
      filtered = filtered.filter(
        (entry) => entry.intelligence.escalationStatus === filter.escalationStatus,
      );
    }

    return filtered.sort(
      (left, right) => right.intelligence.priorityScore - left.intelligence.priorityScore,
    );
  }

  /** Resolves status filter including legacy aliases. */
  static normalizeStatusFilter(
    status: DecisionSearchFilter["status"],
  ): DecisionSearchFilter["status"] {
    if (!status) {
      return status;
    }

    const statuses = Array.isArray(status) ? status : [status];
    return statuses.map((entry) => normalizeDecisionStatus(entry));
  }
}

export const createDecisionSearchService = (repository: DecisionRepository) =>
  new DecisionSearchService(repository);
