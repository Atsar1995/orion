import {
  createRelationshipId,
  type KnowledgeRepository,
} from "@/lib/executive/memory/repository/KnowledgeRepository";
import type { MemoryEntry, MemoryRelationship, MemoryRelationshipType } from "@/types/executive/memory";
import type { ServiceContext } from "@/types/services";

const RELATIONSHIP_RULES: readonly {
  fromCategory: MemoryEntry["category"];
  toCategory: MemoryEntry["category"];
  type: MemoryRelationshipType;
  label: string;
}[] = [
  {
    fromCategory: "customer",
    toCategory: "reservation",
    type: "customer_reservation",
    label: "Customer booked reservation",
  },
  {
    fromCategory: "reservation",
    toCategory: "financial_event",
    type: "reservation_invoice",
    label: "Reservation generated invoice",
  },
  {
    fromCategory: "executive_decision",
    toCategory: "business_outcome",
    type: "decision_outcome",
    label: "Decision produced outcome",
  },
  {
    fromCategory: "project",
    toCategory: "financial_event",
    type: "project_budget",
    label: "Project linked to budget",
  },
  {
    fromCategory: "meeting",
    toCategory: "executive_decision",
    type: "meeting_decision",
    label: "Meeting led to decision",
  },
  {
    fromCategory: "recommendation",
    toCategory: "executive_decision",
    type: "entity_related",
    label: "Recommendation became decision",
  },
];

function sharedEntity(
  left: MemoryEntry,
  right: MemoryEntry,
): { fromType: string; fromId: string; toType: string; toId: string } | null {
  for (const leftEntity of left.relatedEntities) {
    for (const rightEntity of right.relatedEntities) {
      if (
        leftEntity.entityType === rightEntity.entityType &&
        leftEntity.entityId === rightEntity.entityId
      ) {
        return {
          fromType: leftEntity.entityType,
          fromId: leftEntity.entityId,
          toType: rightEntity.entityType,
          toId: rightEntity.entityId,
        };
      }
    }
  }

  return null;
}

/** Automatically relates memory entries and entities (Mission P-004). */
export class RelationshipEngine {
  constructor(private readonly repository: KnowledgeRepository) {}

  relateEntries(
    left: MemoryEntry,
    right: MemoryEntry,
    context: ServiceContext,
    explicitType?: MemoryRelationshipType,
    label?: string,
  ): MemoryRelationship | null {
    const existing = this.repository
      .getRelationships(left.id, context)
      .find(
        (rel) =>
          (rel.fromMemoryId === left.id && rel.toMemoryId === right.id) ||
          (rel.fromMemoryId === right.id && rel.toMemoryId === left.id),
      );

    if (existing) {
      return existing;
    }

    const rule = RELATIONSHIP_RULES.find(
      (entry) =>
        (entry.fromCategory === left.category && entry.toCategory === right.category) ||
        (entry.fromCategory === right.category && entry.toCategory === left.category),
    );

    const shared = sharedEntity(left, right);
    const relationshipType = explicitType ?? rule?.type ?? "entity_related";
    const relationshipLabel = label ?? rule?.label ?? "Related organizational knowledge";

    const relationship: MemoryRelationship = {
      id: createRelationshipId(),
      organizationId: context.organizationId,
      fromMemoryId: left.id,
      toMemoryId: right.id,
      fromEntityType: shared?.fromType ?? left.category,
      fromEntityId: shared?.fromId ?? left.id,
      toEntityType: shared?.toType ?? right.category,
      toEntityId: shared?.toId ?? right.id,
      relationshipType,
      label: relationshipLabel,
      strength: shared ? 90 : 70,
      createdAt: new Date().toISOString(),
    };

    return this.repository.addRelationship(relationship);
  }

  /** Builds relationships across all memories for an organization. */
  indexOrganization(context: ServiceContext): MemoryRelationship[] {
    const entries = this.repository.listAll(context);
    const created: MemoryRelationship[] = [];

    for (let index = 0; index < entries.length; index += 1) {
      for (let inner = index + 1; inner < entries.length; inner += 1) {
        const left = entries[index]!;
        const right = entries[inner]!;
        const shared = sharedEntity(left, right);
        const rule = RELATIONSHIP_RULES.find(
          (entry) =>
            (entry.fromCategory === left.category && entry.toCategory === right.category) ||
            (entry.fromCategory === right.category && entry.toCategory === left.category),
        );

        if (shared || rule || left.relatedDecisionIds.some((id) => right.relatedDecisionIds.includes(id))) {
          const relationship = this.relateEntries(left, right, context);
          if (relationship) {
            created.push(relationship);
          }
        }
      }
    }

    return created;
  }

  getRelatedMemoryIds(memoryId: string, context: ServiceContext): string[] {
    const ids = new Set<string>();

    for (const relationship of this.repository.getRelationships(memoryId, context)) {
      ids.add(relationship.fromMemoryId);
      ids.add(relationship.toMemoryId);
    }

    ids.delete(memoryId);
    return [...ids];
  }
}

export const createRelationshipEngine = (repository: KnowledgeRepository) =>
  new RelationshipEngine(repository);
