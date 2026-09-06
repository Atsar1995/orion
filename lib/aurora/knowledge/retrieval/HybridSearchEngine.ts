import { compareScoredEntities, passesEntityFilters } from "@/lib/aurora/knowledge/retrieval/SemanticSearchEngine";
import type { GraphSearchEngine } from "@/lib/aurora/knowledge/retrieval/GraphSearchEngine";
import type { KeywordSearchEngine } from "@/lib/aurora/knowledge/retrieval/KeywordSearchEngine";
import type { MemorySearchEngine } from "@/lib/aurora/knowledge/retrieval/MemorySearchEngine";
import {
  buildHybridScoredEntities,
  compareHybridScoredEntities,
  mergeScoredEntityIntoAccumulator,
  type HybridEntityAccumulator,
  type HybridSignalAvailability,
} from "@/lib/aurora/knowledge/retrieval/hybridScoring";
import type {
  SemanticSearchEngine,
  SemanticSearchResult,
} from "@/lib/aurora/knowledge/retrieval/SemanticSearchEngine";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import {
  DEFAULT_RETRIEVAL_TOP_K,
  type RetrievalQuery,
  type ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export type HybridSearchOptions = {
  readonly queryVector?: readonly number[];
  readonly graphStartEntityId?: string;
};

export interface HybridSearchEngine {
  search(
    ctx: AuroraRuntimeContext,
    query: RetrievalQuery,
    options?: HybridSearchOptions,
  ): Promise<readonly ScoredEntity[]>;
}

function assertTenantContext(ctx: AuroraRuntimeContext): void {
  if (!ctx.tenantId) {
    throw new KnowledgeInvalidTenantContextError("Tenant context is required.");
  }
}

function resolveTopK(query: RetrievalQuery): number {
  return query.topK ?? DEFAULT_RETRIEVAL_TOP_K;
}

function ingestEngineResults(
  accumulators: Map<string, HybridEntityAccumulator>,
  results: readonly ScoredEntity[],
  signal: keyof Pick<
    HybridEntityAccumulator,
    "semanticScore" | "keywordScore" | "graphProximityScore" | "memoryRelevanceScore"
  >,
): void {
  for (const result of results) {
    mergeScoredEntityIntoAccumulator(accumulators, result, signal);
  }
}

function resolveSemanticAvailability(
  semanticResult: SemanticSearchResult,
  queryVectorProvided: boolean,
): boolean {
  if (!queryVectorProvided) {
    return false;
  }
  return !semanticResult.degraded;
}

function resolveMemoryAvailability(excludeMemoryScore: boolean | undefined): boolean {
  return excludeMemoryScore !== true;
}

export class DefaultHybridSearchEngine implements HybridSearchEngine {
  constructor(
    private readonly semanticSearchEngine: SemanticSearchEngine,
    private readonly keywordSearchEngine: KeywordSearchEngine,
    private readonly graphSearchEngine: GraphSearchEngine,
    private readonly memorySearchEngine: MemorySearchEngine,
    private readonly authorizationService: AuroraAuthorizationService,
  ) {}

  private assertReadAccess(ctx: AuroraRuntimeContext, resource: string): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "readKnowledgeHybridSearch",
      resource,
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.read", {
      operation: "readKnowledgeHybridSearch",
      resource,
    });
  }

  async search(
    ctx: AuroraRuntimeContext,
    query: RetrievalQuery,
    options?: HybridSearchOptions,
  ): Promise<readonly ScoredEntity[]> {
    assertTenantContext(ctx);
    this.assertReadAccess(ctx, query.brandId ?? query.query);

    const queryVectorProvided = Boolean(options?.queryVector?.length);

    const semanticPromise: Promise<SemanticSearchResult> = queryVectorProvided
      ? this.semanticSearchEngine.search(ctx, query, options!.queryVector!)
      : Promise.resolve({
          entities: [],
          degraded: true,
          degradeToKeywordSearch: true,
          degradationReason: "Semantic query vector was not supplied.",
        });

    const [semanticResult, keywordResults, graphResults, memoryResult] = await Promise.all([
      semanticPromise,
      this.keywordSearchEngine.search(ctx, query, query.query),
      this.graphSearchEngine.search(ctx, query, options?.graphStartEntityId),
      this.memorySearchEngine.search(ctx, query),
    ]);

    const availability: HybridSignalAvailability = {
      semantic: resolveSemanticAvailability(semanticResult, queryVectorProvided),
      keyword: true,
      graph: true,
      memory: resolveMemoryAvailability(memoryResult.excludeMemoryScore),
    };

    const accumulators = new Map<string, HybridEntityAccumulator>();
    ingestEngineResults(accumulators, semanticResult.entities, "semanticScore");
    ingestEngineResults(accumulators, keywordResults, "keywordScore");
    ingestEngineResults(accumulators, graphResults, "graphProximityScore");
    ingestEngineResults(accumulators, memoryResult.entities, "memoryRelevanceScore");

    const merged = buildHybridScoredEntities(accumulators, availability)
      .filter((entry) => entry.entity.tenantId === ctx.tenantId)
      .filter((entry) => passesEntityFilters(entry.entity, query))
      .sort(compareHybridScoredEntities);

    return merged.slice(0, resolveTopK(query));
  }
}

export { compareHybridScoredEntities, compareScoredEntities };
