import type { RetrievalCache } from "@/lib/aurora/knowledge/cache/RetrievalCache";
import {
  RETRIEVAL_CACHE_TTL_SECONDS,
  buildRetrievalCacheKey,
} from "@/lib/aurora/knowledge/cache/retrievalCacheKeys";
import type { CitationBuilder } from "@/lib/aurora/knowledge/retrieval/CitationBuilder";
import type { ContextAssembler } from "@/lib/aurora/knowledge/retrieval/ContextAssembler";
import type { ConfidenceScorer } from "@/lib/aurora/knowledge/retrieval/ConfidenceScorer";
import type { HybridSearchEngine } from "@/lib/aurora/knowledge/retrieval/HybridSearchEngine";
import { EmbeddingProviderUnavailableError } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import type { EmbeddingService } from "@/lib/aurora/knowledge/services/EmbeddingService";
import {
  RetrievalInvalidRequestError,
  SPRINT3_MEMORY_RETRIEVAL_DEGRADED,
  buildRetrievalQueryFromRequest,
  resolveRetrievalQueryFilters,
  type QueryVectorResolution,
  validateRetrievalRequest,
} from "@/lib/aurora/knowledge/services/retrievalOrchestration";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import type {
  CacheScope,
  ContextAssemblyRequest,
  ContextPackage,
  RetrievalQuery,
  RetrievalRequest,
  RetrievalResult,
  ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export interface KnowledgeRetrievalService {
  preflight(ctx: AuroraRuntimeContext, request: RetrievalRequest): Promise<RetrievalResult>;
  search(ctx: AuroraRuntimeContext, query: RetrievalQuery): Promise<readonly ScoredEntity[]>;
  assembleContext(ctx: AuroraRuntimeContext, request: ContextAssemblyRequest): Promise<ContextPackage>;
  invalidateCache(ctx: AuroraRuntimeContext, scope?: CacheScope): Promise<void>;
}

function assertTenantContext(ctx: AuroraRuntimeContext): void {
  if (!ctx.tenantId) {
    throw new KnowledgeInvalidTenantContextError("Tenant context is required.");
  }
}

function mergeGaps(...gapGroups: ReadonlyArray<readonly string[]>): readonly string[] {
  const merged = new Set<string>();
  for (const group of gapGroups) {
    for (const gap of group) {
      merged.add(gap);
    }
  }
  return [...merged];
}

export class DefaultKnowledgeRetrievalService implements KnowledgeRetrievalService {
  constructor(
    private readonly hybridSearchEngine: HybridSearchEngine,
    private readonly embeddingService: EmbeddingService,
    private readonly contextAssembler: ContextAssembler,
    private readonly confidenceScorer: ConfidenceScorer,
    private readonly citationBuilder: CitationBuilder,
    private readonly retrievalCache: RetrievalCache,
    private readonly authorizationService: AuroraAuthorizationService,
  ) {}

  private assertRetrievalAccess(ctx: AuroraRuntimeContext, operation: string): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation,
      resource: "knowledge-retrieval",
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.read", {
      operation,
      resource: "knowledge-retrieval",
    });
  }

  private async resolveQueryVector(
    ctx: AuroraRuntimeContext,
    queryText: string,
  ): Promise<QueryVectorResolution> {
    try {
      const queryVector = await this.embeddingService.embedQuery(ctx, queryText.trim());
      return { queryVector, semanticDegraded: false };
    } catch (error) {
      if (error instanceof EmbeddingProviderUnavailableError) {
        return {
          semanticDegraded: true,
          semanticDegradationReason: error.message,
        };
      }
      throw error;
    }
  }

  async preflight(ctx: AuroraRuntimeContext, request: RetrievalRequest): Promise<RetrievalResult> {
    const startedAt = performance.now();
    assertTenantContext(ctx);
    this.assertRetrievalAccess(ctx, "knowledgeRetrievalPreflight");
    validateRetrievalRequest(request);

    const retrievalQuery = buildRetrievalQueryFromRequest(ctx, request);
    const cacheKey = buildRetrievalCacheKey(ctx, request, retrievalQuery);
    const cachedResult = await this.retrievalCache.get(cacheKey);

    if (cachedResult) {
      return {
        ...structuredClone(cachedResult),
        latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
      };
    }

    const vectorResolution = await this.resolveQueryVector(ctx, request.query);
    const scoredEntities = await this.hybridSearchEngine.search(ctx, retrievalQuery, {
      queryVector: vectorResolution.queryVector,
    });

    const confidenceResult = this.confidenceScorer.score({
      scoredEntities,
      semanticDegraded: vectorResolution.semanticDegraded,
      memoryDegraded: SPRINT3_MEMORY_RETRIEVAL_DEGRADED,
      requestedDomains: retrievalQuery.domains,
      tenantId: ctx.tenantId,
    });

    const filters = resolveRetrievalQueryFilters(ctx, request);
    const contextPackage = await this.contextAssembler.assemble(ctx, {
      scoredEntities,
      taskType: request.taskType,
      campaignId: request.campaignId,
      maxTokens: request.maxTokens,
      validatedOnly: filters.validatedOnly,
      includeProvisional: filters.includeProvisional,
    });

    const citations = this.citationBuilder.build({
      scoredEntities,
      contextPackage,
    });

    const result: RetrievalResult = {
      confidence: confidenceResult.confidence,
      contextPackage,
      citations,
      gaps: mergeGaps(confidenceResult.gaps),
      latencyMs: Math.max(0, Math.round(performance.now() - startedAt)),
    };

    if (!vectorResolution.semanticDegraded) {
      await this.retrievalCache.set(cacheKey, result, RETRIEVAL_CACHE_TTL_SECONDS);
    }

    return result;
  }

  async search(ctx: AuroraRuntimeContext, query: RetrievalQuery): Promise<readonly ScoredEntity[]> {
    assertTenantContext(ctx);
    this.assertRetrievalAccess(ctx, "knowledgeRetrievalSearch");

    if (!query.query.trim()) {
      throw new RetrievalInvalidRequestError("Retrieval query must not be empty.");
    }

    const vectorResolution = await this.resolveQueryVector(ctx, query.query);
    return this.hybridSearchEngine.search(ctx, query, {
      queryVector: vectorResolution.queryVector,
    });
  }

  async assembleContext(
    ctx: AuroraRuntimeContext,
    request: ContextAssemblyRequest,
  ): Promise<ContextPackage> {
    assertTenantContext(ctx);
    this.assertRetrievalAccess(ctx, "knowledgeRetrievalAssembleContext");
    return this.contextAssembler.assemble(ctx, request);
  }

  async invalidateCache(ctx: AuroraRuntimeContext, scope?: CacheScope): Promise<void> {
    assertTenantContext(ctx);
    this.assertRetrievalAccess(ctx, "knowledgeRetrievalInvalidateCache");

    await this.retrievalCache.invalidate({
      tenantId: ctx.tenantId,
      brandId: scope?.brandId,
      queryHash: scope?.queryHash,
    });
  }
}
