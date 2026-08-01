/**
 * ORION Executive Memory Platform — types (Mission P-004).
 */

import type { ExecutiveEvidence } from "@/types/executive/evidence";

export type MemoryCategory =
  | "executive_decision"
  | "business_outcome"
  | "lesson_learned"
  | "policy"
  | "project"
  | "meeting"
  | "customer"
  | "supplier"
  | "reservation"
  | "financial_event"
  | "operational_event"
  | "recommendation"
  | "historical_context";

export type MemoryEntityReference = {
  readonly entityType: string;
  readonly entityId: string;
  readonly entityLabel?: string;
};

export type MemoryAttachment = {
  readonly id: string;
  readonly label: string;
  readonly url?: string;
  readonly mimeType?: string;
};

export type MemoryAuditEntry = {
  readonly id: string;
  readonly timestamp: string;
  readonly actorId: string;
  readonly actorName: string;
  readonly action: string;
  readonly detail: string;
};

/** First-class organizational memory entry (Mission P-004). */
export type MemoryEntry = {
  readonly id: string;
  readonly organizationId: string;
  readonly workspaceId: string;
  readonly workspace: string;
  readonly category: MemoryCategory;
  readonly title: string;
  readonly summary: string;
  readonly fullContext: string;
  readonly relatedEntities: readonly MemoryEntityReference[];
  readonly relatedDecisionIds: readonly string[];
  readonly evidence: readonly ExecutiveEvidence[];
  readonly authorId: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly confidence: number;
  readonly importance: number;
  readonly tags: readonly string[];
  readonly attachments: readonly MemoryAttachment[];
  readonly auditHistory: readonly MemoryAuditEntry[];
};

export type MemoryRelationshipType =
  | "customer_reservation"
  | "reservation_invoice"
  | "decision_outcome"
  | "project_budget"
  | "employee_task"
  | "campaign_lead"
  | "meeting_decision"
  | "policy_procedure"
  | "entity_related";

export type MemoryRelationship = {
  readonly id: string;
  readonly organizationId: string;
  readonly fromMemoryId: string;
  readonly toMemoryId: string;
  readonly fromEntityType: string;
  readonly fromEntityId: string;
  readonly toEntityType: string;
  readonly toEntityId: string;
  readonly relationshipType: MemoryRelationshipType;
  readonly label: string;
  readonly strength: number;
  readonly createdAt: string;
};

export type MemoryTimelineEntry = {
  readonly id: string;
  readonly memoryId: string;
  readonly timestamp: string;
  readonly category: MemoryCategory;
  readonly title: string;
  readonly summary: string;
  readonly workspace: string;
  readonly importance: number;
};

export type MemoryPattern = {
  readonly id: string;
  readonly patternType:
    | "recurring_issue"
    | "successful_strategy"
    | "repeated_failure"
    | "seasonality"
    | "operational_trend"
    | "executive_behaviour"
    | "business_pattern";
  readonly title: string;
  readonly description: string;
  readonly confidence: number;
  readonly occurrenceCount: number;
  readonly relatedMemoryIds: readonly string[];
};

export type MemorySearchFilter = {
  readonly query?: string;
  readonly keyword?: string;
  readonly category?: MemoryCategory | MemoryCategory[];
  readonly workspace?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly tag?: string;
  readonly fromDate?: string;
  readonly toDate?: string;
  readonly minImportance?: number;
  readonly minConfidence?: number;
  readonly relatedToMemoryId?: string;
  readonly relatedToDecisionId?: string;
};

export type MemorySearchResult = {
  readonly entry: MemoryEntry;
  readonly score: number;
  readonly matchedFields: readonly string[];
};

export type KnowledgeRetrievalContext = {
  readonly memory: MemoryEntry;
  readonly relatedDecisions: readonly MemoryEntry[];
  readonly relatedLessons: readonly MemoryEntry[];
  readonly relatedCustomers: readonly MemoryEntry[];
  readonly relatedProjects: readonly MemoryEntry[];
  readonly historicalComparisons: readonly MemoryEntry[];
  readonly recommendedContext: readonly string[];
  readonly relationships: readonly MemoryRelationship[];
};

export type MemoryAnalyticsSnapshot = {
  readonly generatedAt: string;
  readonly totalMemories: number;
  readonly knowledgeGrowth: readonly { date: string; count: number }[];
  readonly relationshipDensity: number;
  readonly knowledgeReuseRate: number;
  readonly decisionRecallRate: number;
  readonly searchEffectiveness: number;
  readonly learningRate: number;
  readonly byCategory: readonly { category: MemoryCategory; count: number }[];
  readonly topTags: readonly { tag: string; count: number }[];
};

export type CreateMemoryInput = {
  readonly category: MemoryCategory;
  readonly title: string;
  readonly summary: string;
  readonly fullContext?: string;
  readonly workspace: string;
  readonly workspaceId: string;
  readonly relatedEntities?: readonly MemoryEntityReference[];
  readonly relatedDecisionIds?: readonly string[];
  readonly evidence?: readonly ExecutiveEvidence[];
  readonly confidence?: number;
  readonly importance?: number;
  readonly tags?: readonly string[];
};

export type MemoryEventType =
  | "memory.created"
  | "memory.updated"
  | "memory.related"
  | "memory.searched";

export type MemoryEvent = {
  readonly id: string;
  readonly type: MemoryEventType;
  readonly memoryId: string;
  readonly organizationId: string;
  readonly timestamp: string;
  readonly payload: Readonly<Record<string, string>>;
};
