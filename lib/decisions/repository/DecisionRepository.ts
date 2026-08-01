import { randomUUID } from "crypto";
import type {
  CreateDecisionInput,
  DecisionSearchFilter,
  ExecutiveDecision,
  RecordDecisionActionInput,
} from "@/types/decisions";
import type { ServiceContext } from "@/types/services";

/** Repository contract for executive decisions (Mission S1B+). */
export interface DecisionRepository {
  readonly entityName: "ExecutiveDecision";

  create(decision: ExecutiveDecision): ExecutiveDecision;
  update(decision: ExecutiveDecision): ExecutiveDecision;
  findById(id: string, context: ServiceContext): ExecutiveDecision | null;
  findByRecommendationId(
    recommendationId: string,
    context: ServiceContext,
  ): ExecutiveDecision | null;
  search(filter: DecisionSearchFilter, context: ServiceContext): ExecutiveDecision[];
  listAll(context: ServiceContext): ExecutiveDecision[];
}

export function createDecisionId(): string {
  return randomUUID();
}

export function createActionId(): string {
  return randomUUID();
}

export function createTimelineId(): string {
  return randomUUID();
}

export function createOutcomeId(): string {
  return randomUUID();
}

export function createLessonId(): string {
  return randomUUID();
}

export function createAuditId(): string {
  return randomUUID();
}

export function createCommentId(): string {
  return randomUUID();
}

export type { CreateDecisionInput, DecisionSearchFilter, ExecutiveDecision, RecordDecisionActionInput };
