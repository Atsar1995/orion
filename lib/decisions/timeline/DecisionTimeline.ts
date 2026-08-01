import {
  createActionId,
  createAuditId,
  createCommentId,
  createLessonId,
  createOutcomeId,
  createTimelineId,
} from "@/lib/decisions/repository/DecisionRepository";
import { normalizeDecisionStatus, statusFromAction } from "@/lib/decisions/lifecycle/DecisionLifecycle";
import type {
  AuditHistoryEntry,
  CreateDecisionInput,
  DecisionLesson,
  DecisionStatus,
  ExecutiveActionRecord,
  ExecutiveDecision,
  OutcomeMetric,
  RecordDecisionActionInput,
  RecordDecisionCommentInput,
  RecordDecisionLessonInput,
  RecommendationIntelligence,
  TimelineEntry,
} from "@/types/decisions";
import type { ServiceContext } from "@/types/services";

export function mapRecommendationInput(
  input: CreateDecisionInput,
): RecommendationIntelligence {
  return {
    recommendationId: input.recommendationId,
    title: input.title,
    text: input.text,
    evidence: input.evidence,
    confidenceScore: input.confidenceScore,
    confidenceLabel: input.confidenceLabel,
    businessImpact: input.businessImpact,
    trigger: input.trigger ?? "Executive intelligence recommendation",
    sourceServices: input.sourceServices ?? [input.workspace],
    priority: input.priority,
    riskLevel: input.riskLevel ?? "medium",
    estimatedValue: input.estimatedValue,
    recommendationType: input.recommendationType ?? "executive",
  };
}

export function buildCreationTimeline(
  context: ServiceContext,
  recommendation: RecommendationIntelligence,
): TimelineEntry {
  return {
    id: createTimelineId(),
    timestamp: new Date().toISOString(),
    type: "created",
    title: "Decision generated",
    description: `Recommendation "${recommendation.title}" captured from ${recommendation.sourceServices.join(", ")}.`,
    actorId: context.userId,
    actorName: "ORION Intelligence",
    metadata: {
      trigger: recommendation.trigger,
      confidence: String(recommendation.confidenceScore),
    },
  };
}

export function buildActionTimeline(
  context: ServiceContext,
  action: ExecutiveActionRecord,
): TimelineEntry {
  return {
    id: createTimelineId(),
    timestamp: action.timestamp,
    type: "action",
    title: `Action: ${action.action}`,
    description: action.notes ?? `Executive ${action.action} the decision.`,
    actorId: action.executiveId,
    actorName: action.executiveName,
    metadata: action.delegateName ? { delegate: action.delegateName } : undefined,
  };
}

export function buildStatusTimeline(
  context: ServiceContext,
  from: DecisionStatus,
  to: DecisionStatus,
  notes?: string,
): TimelineEntry {
  return {
    id: createTimelineId(),
    timestamp: new Date().toISOString(),
    type: "status_change",
    title: "Status updated",
    description: notes ?? `Decision moved from ${normalizeDecisionStatus(from)} to ${normalizeDecisionStatus(to)}.`,
    actorId: context.userId,
    actorName: context.userId,
    metadata: { from, to },
  };
}

export function buildCommentTimeline(
  context: ServiceContext,
  executiveName: string,
  input: RecordDecisionCommentInput,
): TimelineEntry {
  return {
    id: createCommentId(),
    timestamp: new Date().toISOString(),
    type: "comment",
    title: "Comment added",
    description: input.text,
    actorId: context.userId,
    actorName: executiveName,
  };
}

export function buildLessonTimeline(
  lesson: DecisionLesson,
): TimelineEntry {
  return {
    id: createTimelineId(),
    timestamp: lesson.recordedAt,
    type: "lesson",
    title: "Lesson learned",
    description: lesson.text,
    actorId: lesson.recordedBy,
    actorName: lesson.recordedByName,
  };
}

export function buildAuditEntry(
  context: ServiceContext,
  executiveName: string,
  action: string,
  detail: string,
): AuditHistoryEntry {
  return {
    id: createAuditId(),
    timestamp: new Date().toISOString(),
    actorId: context.userId,
    actorName: executiveName,
    action,
    detail,
  };
}

export function buildOutcomeTimeline(outcome: OutcomeMetric): TimelineEntry {
  return {
    id: createTimelineId(),
    timestamp: outcome.recordedAt,
    type: "outcome",
    title: "Outcome recorded",
    description: `${outcome.label}: ${outcome.value}${outcome.unit}`,
    metadata: {
      workspace: outcome.workspace,
      metricType: outcome.metricType,
    },
  };
}

export function createActionRecord(
  context: ServiceContext,
  input: RecordDecisionActionInput,
  executiveName: string,
): ExecutiveActionRecord {
  return {
    id: createActionId(),
    action: input.action,
    executiveId: context.userId,
    executiveName,
    notes: input.notes,
    timestamp: new Date().toISOString(),
    delegateId: input.delegateId,
    delegateName: input.delegateName,
    dueDate: input.dueDate,
  };
}

export function createLessonRecord(
  context: ServiceContext,
  executiveName: string,
  input: RecordDecisionLessonInput,
): DecisionLesson {
  return {
    id: createLessonId(),
    text: input.text,
    recordedAt: new Date().toISOString(),
    recordedBy: context.userId,
    recordedByName: executiveName,
  };
}

export function applyActionToDecision(
  decision: ExecutiveDecision,
  action: ExecutiveActionRecord,
  context: ServiceContext,
): ExecutiveDecision {
  const nextStatus = statusFromAction(action.action);
  const timeline = [
    ...decision.timeline,
    buildActionTimeline(context, action),
    buildStatusTimeline(context, decision.status, nextStatus, action.notes),
  ];

  const deferredUntil =
    action.action === "deferred" || action.action === "snoozed"
      ? action.dueDate ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      : decision.deferredUntil;

  return {
    ...decision,
    status: nextStatus,
    updatedAt: action.timestamp,
    decisionDate:
      ["accepted", "rejected", "delegated", "deferred"].includes(action.action) &&
      !decision.decisionDate
        ? action.timestamp
        : decision.decisionDate,
    completionDate: action.action === "completed" ? action.timestamp : decision.completionDate,
    ownerId: decision.ownerId ?? context.userId,
    delegatedToId:
      action.action === "delegated" ? action.delegateId ?? action.executiveId : decision.delegatedToId,
    delegatedToName:
      action.action === "delegated" ? action.delegateName : decision.delegatedToName,
    actions: [...decision.actions, action],
    timeline,
    deferredUntil,
    snoozedUntil: deferredUntil,
    auditHistory: [
      ...decision.auditHistory,
      buildAuditEntry(
        context,
        action.executiveName,
        action.action,
        `Status changed to ${nextStatus}.`,
      ),
    ],
  };
}

export function applyStatusTransition(
  decision: ExecutiveDecision,
  toStatus: DecisionStatus,
  context: ServiceContext,
  executiveName: string,
  notes?: string,
): ExecutiveDecision {
  const timestamp = new Date().toISOString();
  const timeline = [
    ...decision.timeline,
    buildStatusTimeline(context, decision.status, toStatus, notes),
  ];

  return {
    ...decision,
    status: normalizeDecisionStatus(toStatus),
    updatedAt: timestamp,
    decisionDate:
      ["accepted", "rejected", "delegated", "deferred"].includes(normalizeDecisionStatus(toStatus)) &&
      !decision.decisionDate
        ? timestamp
        : decision.decisionDate,
    completionDate: normalizeDecisionStatus(toStatus) === "completed" ? timestamp : decision.completionDate,
    timeline,
    auditHistory: [
      ...decision.auditHistory,
      buildAuditEntry(context, executiveName, "transition", `Transitioned to ${toStatus}.`),
    ],
  };
}

export function attachOutcome(
  decision: ExecutiveDecision,
  outcome: OutcomeMetric,
): ExecutiveDecision {
  return {
    ...decision,
    outcomes: [...decision.outcomes, outcome],
    timeline: [...decision.timeline, buildOutcomeTimeline(outcome)],
    updatedAt: outcome.recordedAt,
  };
}

export function attachComment(
  decision: ExecutiveDecision,
  context: ServiceContext,
  executiveName: string,
  input: RecordDecisionCommentInput,
): ExecutiveDecision {
  const timelineEntry = buildCommentTimeline(context, executiveName, input);

  return {
    ...decision,
    updatedAt: timelineEntry.timestamp,
    timeline: [...decision.timeline, timelineEntry],
    auditHistory: [
      ...decision.auditHistory,
      buildAuditEntry(context, executiveName, "comment", input.text),
    ],
  };
}

export function attachLesson(
  decision: ExecutiveDecision,
  context: ServiceContext,
  executiveName: string,
  input: RecordDecisionLessonInput,
): ExecutiveDecision {
  const lesson = createLessonRecord(context, executiveName, input);

  return {
    ...decision,
    updatedAt: lesson.recordedAt,
    lessonsLearned: [...decision.lessonsLearned, lesson],
    timeline: [...decision.timeline, buildLessonTimeline(lesson)],
    auditHistory: [
      ...decision.auditHistory,
      buildAuditEntry(context, executiveName, "lesson", input.text),
    ],
  };
}

export function createSampleOutcome(
  decision: ExecutiveDecision,
  value: number,
): OutcomeMetric {
  const workspace = decision.workspace.toLowerCase();

  const metricByWorkspace: Record<string, { type: string; label: string; unit: string }> = {
    crm: { type: "opportunity_won", label: "Opportunity value", unit: " USD" },
    finance: { type: "cash_flow", label: "Cash flow impact", unit: " USD" },
    hospitality: { type: "revenue", label: "Revenue impact", unit: " USD" },
    marketing: { type: "roas", label: "ROAS improvement", unit: "x" },
    executive: { type: "business_value", label: "Business value", unit: " USD" },
  };

  const metric = metricByWorkspace[workspace] ?? metricByWorkspace.executive!;

  return {
    id: createOutcomeId(),
    workspace: decision.workspace,
    metricType: metric.type,
    label: metric.label,
    value,
    unit: metric.unit,
    recordedAt: new Date().toISOString(),
  };
}

/** Returns ordered timeline entries for executive memory display. */
export function getDecisionTimeline(decision: ExecutiveDecision): TimelineEntry[] {
  return [...decision.timeline].sort((left, right) =>
    right.timestamp.localeCompare(left.timestamp),
  );
}
