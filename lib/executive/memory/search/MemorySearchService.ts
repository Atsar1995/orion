import type { KnowledgeRepository } from "@/lib/executive/memory/repository/KnowledgeRepository";
import { createRelationshipEngine } from "@/lib/executive/memory/RelationshipEngine";
import type { MemoryEntry, MemorySearchFilter, MemorySearchResult } from "@/types/executive/memory";
import type { ServiceContext } from "@/types/services";

function scoreEntry(entry: MemoryEntry, keyword?: string): { score: number; matchedFields: string[] } {
  if (!keyword) {
    return { score: entry.importance, matchedFields: ["importance"] };
  }

  const normalized = keyword.toLowerCase();
  const matchedFields: string[] = [];
  let score = entry.importance;

  const fields: Array<[string, string]> = [
    ["title", entry.title],
    ["summary", entry.summary],
    ["fullContext", entry.fullContext],
    ...entry.tags.map((tag) => ["tag", tag] as [string, string]),
  ];

  for (const [field, value] of fields) {
    if (value.toLowerCase().includes(normalized)) {
      matchedFields.push(field);
      score += field === "title" ? 30 : 15;
    }
  }

  return { score, matchedFields };
}

/** Memory search with semantic-ready scoring architecture (Mission P-004). */
export class MemorySearchService {
  private readonly relationshipEngine;

  constructor(private readonly repository: KnowledgeRepository) {
    this.relationshipEngine = createRelationshipEngine(repository);
  }

  search(filter: MemorySearchFilter, context: ServiceContext): MemorySearchResult[] {
    const keyword = filter.keyword ?? filter.query;
    const entries = this.repository.search({ ...filter, query: undefined, keyword: undefined }, context);

    const results = entries.map((entry) => {
      const { score, matchedFields } = scoreEntry(entry, keyword);
      return { entry, score, matchedFields };
    });

    let filtered = keyword
      ? results.filter((result) => result.matchedFields.length > 0 || result.score > 0)
      : results;

    if (filter.relatedToMemoryId) {
      const relatedIds = new Set(
        this.relationshipEngine.getRelatedMemoryIds(filter.relatedToMemoryId, context),
      );
      filtered = filtered.filter((result) => relatedIds.has(result.entry.id));
    }

    return filtered.sort((left, right) => right.score - left.score);
  }

  /** Entity-centric search across related memories. */
  searchByEntity(
    entityType: string,
    entityId: string,
    context: ServiceContext,
  ): MemorySearchResult[] {
    return this.search({ entityType, entityId }, context);
  }

  /** Timeline-oriented search. */
  searchTimeline(
    context: ServiceContext,
    options?: { fromDate?: string; toDate?: string; workspace?: string; query?: string },
  ): MemorySearchResult[] {
    return this.search(
      {
        fromDate: options?.fromDate,
        toDate: options?.toDate,
        workspace: options?.workspace,
        query: options?.query,
      },
      context,
    );
  }
}

export const createMemorySearchService = (repository: KnowledgeRepository) =>
  new MemorySearchService(repository);
