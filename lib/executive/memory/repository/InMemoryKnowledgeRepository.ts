import type { KnowledgeRepository } from "@/lib/executive/memory/repository/KnowledgeRepository";
import type {
  MemoryEntry,
  MemoryRelationship,
  MemorySearchFilter,
} from "@/types/executive/memory";
import type { ServiceContext } from "@/types/services";

function matchesFilter(entry: MemoryEntry, filter: MemorySearchFilter): boolean {
  if (filter.category) {
    const categories = Array.isArray(filter.category) ? filter.category : [filter.category];
    if (!categories.includes(entry.category)) {
      return false;
    }
  }

  if (filter.workspace && entry.workspace !== filter.workspace) {
    return false;
  }

  if (filter.entityType) {
    const hasEntity = entry.relatedEntities.some(
      (entity) => entity.entityType === filter.entityType,
    );
    if (!hasEntity) {
      return false;
    }
  }

  if (filter.entityId) {
    const hasEntity = entry.relatedEntities.some(
      (entity) => entity.entityId === filter.entityId,
    );
    if (!hasEntity) {
      return false;
    }
  }

  if (filter.tag && !entry.tags.includes(filter.tag)) {
    return false;
  }

  if (filter.fromDate && entry.createdAt < filter.fromDate) {
    return false;
  }

  if (filter.toDate && entry.createdAt > filter.toDate) {
    return false;
  }

  if (filter.minImportance !== undefined && entry.importance < filter.minImportance) {
    return false;
  }

  if (filter.minConfidence !== undefined && entry.confidence < filter.minConfidence) {
    return false;
  }

  if (filter.relatedToDecisionId) {
    if (!entry.relatedDecisionIds.includes(filter.relatedToDecisionId)) {
      return false;
    }
  }

  const keyword = filter.keyword ?? filter.query;

  if (keyword) {
    const normalized = keyword.toLowerCase();
    const haystack = [
      entry.title,
      entry.summary,
      entry.fullContext,
      ...entry.tags,
      ...entry.relatedEntities.map((entity) => entity.entityLabel ?? entity.entityId),
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(normalized)) {
      return false;
    }
  }

  return true;
}

/** In-memory knowledge repository (Mission P-004). */
export class InMemoryKnowledgeRepository implements KnowledgeRepository {
  readonly entityName = "MemoryEntry" as const;

  private readonly entries = new Map<string, MemoryEntry>();
  private readonly relationships: MemoryRelationship[] = [];

  constructor(initial: MemoryEntry[] = [], initialRelationships: MemoryRelationship[] = []) {
    for (const entry of initial) {
      this.entries.set(entry.id, entry);
    }

    this.relationships.push(...initialRelationships);
  }

  create(entry: MemoryEntry): MemoryEntry {
    this.entries.set(entry.id, entry);
    return entry;
  }

  update(entry: MemoryEntry): MemoryEntry {
    this.entries.set(entry.id, entry);
    return entry;
  }

  findById(id: string, context: ServiceContext): MemoryEntry | null {
    const entry = this.entries.get(id);
    if (!entry || entry.organizationId !== context.organizationId) {
      return null;
    }

    return entry;
  }

  findByDecisionId(decisionId: string, context: ServiceContext): MemoryEntry[] {
    return this.listAll(context).filter((entry) =>
      entry.relatedDecisionIds.includes(decisionId),
    );
  }

  search(filter: MemorySearchFilter, context: ServiceContext): MemoryEntry[] {
    let results = this.listAll(context).filter((entry) => matchesFilter(entry, filter));

    if (filter.relatedToMemoryId) {
      const relatedIds = new Set(
        this.getRelationships(filter.relatedToMemoryId, context).flatMap((rel) => [
          rel.fromMemoryId,
          rel.toMemoryId,
        ]),
      );
      relatedIds.add(filter.relatedToMemoryId);
      results = results.filter((entry) => relatedIds.has(entry.id));
    }

    return results.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  listAll(context: ServiceContext): MemoryEntry[] {
    return [...this.entries.values()].filter(
      (entry) => entry.organizationId === context.organizationId,
    );
  }

  addRelationship(relationship: MemoryRelationship): MemoryRelationship {
    this.relationships.push(relationship);
    return relationship;
  }

  getRelationships(memoryId: string, context: ServiceContext): MemoryRelationship[] {
    return this.relationships.filter(
      (rel) =>
        rel.organizationId === context.organizationId &&
        (rel.fromMemoryId === memoryId || rel.toMemoryId === memoryId),
    );
  }

  listRelationships(context: ServiceContext): MemoryRelationship[] {
    return this.relationships.filter((rel) => rel.organizationId === context.organizationId);
  }

  clear(): void {
    this.entries.clear();
    this.relationships.length = 0;
  }
}

export const defaultKnowledgeRepository = new InMemoryKnowledgeRepository();
