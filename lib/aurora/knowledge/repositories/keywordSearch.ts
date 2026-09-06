import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import {
  DEFAULT_RETRIEVAL_TOP_K,
  type KeywordSearchOptions,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";

/** Mirrors PostgreSQL FTS weights from migration 009 (title=A, content=B). */
export const KEYWORD_TITLE_WEIGHT = 1.0 as const;
export const KEYWORD_CONTENT_WEIGHT = 0.4 as const;

export type ScoredKeywordMatch = {
  readonly entity: KnowledgeEntity;
  readonly rank: number;
};

export function resolveKeywordSearchDefaults(options?: KeywordSearchOptions): {
  readonly topK: number;
} {
  return {
    topK: options?.topK ?? DEFAULT_RETRIEVAL_TOP_K,
  };
}

export function tokenizeKeywordQuery(query: string): readonly string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function passesKeywordEntityFilters(
  entity: KnowledgeEntity,
  options?: KeywordSearchOptions,
): boolean {
  if (options?.brandId && entity.brandId !== options.brandId) {
    return false;
  }

  if (options?.domains?.length && !options.domains.includes(entity.domain)) {
    return false;
  }

  if (options?.entityType && entity.entityType !== options.entityType) {
    return false;
  }

  if (options?.validatedOnly && entity.status !== "validated") {
    return false;
  }

  if (options?.includeProvisional === false && entity.status === "provisional") {
    return false;
  }

  return true;
}

/** Deterministic in-memory lexical rank aligned with weighted FTS (title A, content B). */
export function computeKeywordRank(
  entity: KnowledgeEntity,
  query: string,
  terms: readonly string[],
): number {
  const title = entity.title.toLowerCase();
  const content = JSON.stringify(entity.content).toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();

  let rank = 0;
  for (const term of terms) {
    if (title.includes(term)) {
      rank += KEYWORD_TITLE_WEIGHT;
    }
    if (content.includes(term)) {
      rank += KEYWORD_CONTENT_WEIGHT;
    }
  }

  if (normalizedQuery.length > 0 && title.includes(normalizedQuery)) {
    rank += KEYWORD_TITLE_WEIGHT * terms.length;
  }

  return rank;
}

export function matchesKeywordQuery(entity: KnowledgeEntity, terms: readonly string[]): boolean {
  if (terms.length === 0) {
    return false;
  }

  const haystack = `${entity.title} ${JSON.stringify(entity.content)}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function compareScoredKeywordMatches(
  left: ScoredKeywordMatch,
  right: ScoredKeywordMatch,
): number {
  if (right.rank !== left.rank) {
    return right.rank - left.rank;
  }

  return left.entity.id.localeCompare(right.entity.id);
}

export function searchEntitiesByKeyword(
  entities: readonly KnowledgeEntity[],
  tenantId: string,
  query: string,
  options?: KeywordSearchOptions,
): readonly ScoredKeywordMatch[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const terms = tokenizeKeywordQuery(trimmed);
  if (terms.length === 0) {
    return [];
  }

  const { topK } = resolveKeywordSearchDefaults(options);
  const matches: ScoredKeywordMatch[] = [];

  for (const entity of entities) {
    if (entity.tenantId !== tenantId) {
      continue;
    }

    if (!passesKeywordEntityFilters(entity, options)) {
      continue;
    }

    if (!matchesKeywordQuery(entity, terms)) {
      continue;
    }

    matches.push({
      entity,
      rank: computeKeywordRank(entity, trimmed, terms),
    });
  }

  return matches.sort(compareScoredKeywordMatches).slice(0, topK);
}
