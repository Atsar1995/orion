import {
  validateEmbeddingVector,
  type KnowledgeRepository,
  type ScoredEmbeddingMatch,
} from "@/lib/aurora/knowledge/repositories";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import type { EmbeddingService } from "@/lib/aurora/knowledge/services/EmbeddingService";
import { EmbeddingProviderUnavailableError } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import {
  DEFAULT_RETRIEVAL_TOP_K,
  type RetrievalQuery,
  type ScoredEntity,
  type VectorSearchOptions,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

/** Chunk-level fetch multiplier before entity collapse (Gate 5 assumption). */
export const SEMANTIC_SEARCH_CHUNK_FETCH_MULTIPLIER = 8 as const;

/** Semantic search outcome for HybridSearchEngine consumption (ERR-2 compatible). */
export type SemanticSearchResult = {
  readonly entities: readonly ScoredEntity[];
  readonly degraded: boolean;
  readonly degradeToKeywordSearch?: boolean;
  readonly degradationReason?: string;
};

export interface SemanticSearchEngine {
  search(
    ctx: AuroraRuntimeContext,
    query: RetrievalQuery,
    vector: readonly number[],
  ): Promise<SemanticSearchResult>;
}

function assertTenantContext(ctx: AuroraRuntimeContext): void {
  if (!ctx.tenantId) {
    throw new KnowledgeInvalidTenantContextError("Tenant context is required.");
  }
}

function resolveEntityTopK(query: RetrievalQuery): number {
  return query.topK ?? DEFAULT_RETRIEVAL_TOP_K;
}

function resolveChunkTopK(query: RetrievalQuery): number {
  const entityTopK = resolveEntityTopK(query);
  return Math.max(entityTopK * SEMANTIC_SEARCH_CHUNK_FETCH_MULTIPLIER, entityTopK);
}

export function toVectorSearchOptions(
  query: RetrievalQuery,
  chunkTopK: number,
): VectorSearchOptions {
  return {
    domains: query.domains,
    brandId: query.brandId,
    topK: chunkTopK,
    validatedOnly: query.validatedOnly,
  };
}

export function passesEntityFilters(entity: KnowledgeEntity, query: RetrievalQuery): boolean {
  if (query.brandId && entity.brandId !== query.brandId) {
    return false;
  }

  if (query.domains?.length && !query.domains.includes(entity.domain)) {
    return false;
  }

  if (query.entityType && entity.entityType !== query.entityType) {
    return false;
  }

  if (query.validatedOnly && entity.status !== "validated") {
    return false;
  }

  if (query.includeProvisional === false && entity.status === "provisional") {
    return false;
  }

  return true;
}

export function collapseEmbeddingMatches(
  matches: readonly ScoredEmbeddingMatch[],
  entitiesById: ReadonlyMap<string, KnowledgeEntity>,
  query: RetrievalQuery,
  tenantId: string,
): readonly ScoredEntity[] {
  const strongestByEntity = new Map<string, ScoredEntity>();

  for (const match of matches) {
    if (match.embedding.tenantId !== tenantId) {
      continue;
    }

    const entity = entitiesById.get(match.embedding.entityId);
    if (!entity || entity.tenantId !== tenantId) {
      continue;
    }

    if (!passesEntityFilters(entity, query)) {
      continue;
    }

    const semanticScore = match.similarity;
    const existing = strongestByEntity.get(entity.id);
    if (existing && existing.semanticScore! >= semanticScore) {
      continue;
    }

    strongestByEntity.set(entity.id, {
      entity,
      score: semanticScore,
      semanticScore,
    });
  }

  return [...strongestByEntity.values()].sort(compareScoredEntities);
}

export function compareScoredEntities(left: ScoredEntity, right: ScoredEntity): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return left.entity.id.localeCompare(right.entity.id);
}

export class DefaultSemanticSearchEngine implements SemanticSearchEngine {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly knowledgeRepository: KnowledgeRepository,
  ) {}

  async search(
    ctx: AuroraRuntimeContext,
    query: RetrievalQuery,
    vector: readonly number[],
  ): Promise<SemanticSearchResult> {
    assertTenantContext(ctx);
    validateEmbeddingVector(vector);

    const chunkTopK = resolveChunkTopK(query);
    const vectorOptions = toVectorSearchOptions(query, chunkTopK);

    let matches: readonly ScoredEmbeddingMatch[];
    try {
      matches = await this.embeddingService.semanticSearch(ctx, vector, vectorOptions);
    } catch (error) {
      if (error instanceof EmbeddingProviderUnavailableError) {
        return {
          entities: [],
          degraded: true,
          degradeToKeywordSearch: true,
          degradationReason: error.message,
        };
      }
      throw error;
    }

    const entityIds = [...new Set(matches.map((match) => match.embedding.entityId))];
    const entitiesById = new Map<string, KnowledgeEntity>();

    for (const entityId of entityIds) {
      const entity = await this.knowledgeRepository.getById(ctx.tenantId, entityId);
      if (entity && entity.tenantId === ctx.tenantId) {
        entitiesById.set(entityId, entity);
      }
    }

    const collapsed = collapseEmbeddingMatches(matches, entitiesById, query, ctx.tenantId);
    const entityTopK = resolveEntityTopK(query);

    return {
      entities: collapsed.slice(0, entityTopK),
      degraded: false,
    };
  }
}
