import { describe, expect, it, vi } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import type { ContextAssembler } from "@/lib/aurora/knowledge/retrieval/ContextAssembler";
import type { ConfidenceScorer } from "@/lib/aurora/knowledge/retrieval/ConfidenceScorer";
import { DefaultCitationBuilder } from "@/lib/aurora/knowledge/retrieval/CitationBuilder";
import type { HybridSearchEngine } from "@/lib/aurora/knowledge/retrieval/HybridSearchEngine";
import { InMemoryRetrievalCache } from "@/lib/aurora/knowledge/cache";
import type { RetrievalCache } from "@/lib/aurora/knowledge/cache/RetrievalCache";
import { EmbeddingProviderUnavailableError } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import {
  DefaultKnowledgeRetrievalService,
  type KnowledgeRetrievalService,
} from "@/lib/aurora/knowledge/services/KnowledgeRetrievalService";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import {
  RetrievalInvalidRequestError,
  RetrievalUnsupportedTaskError,
  buildRetrievalQueryFromRequest,
  requiresValidatedOnlyRetrieval,
  resolveRetrievalQueryFilters,
} from "@/lib/aurora/knowledge/services/retrievalOrchestration";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { AuroraError } from "@/lib/aurora/errors/AuroraError";
import {
  CONTEXT_LAYER_TOKEN_LIMITS,
  RETRIEVAL_MAX_CONTEXT_TOKENS,
  type ContextAssemblyRequest,
  type RetrievalQuery,
  type RetrievalRequest,
  type ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const VECTOR = Array.from({ length: 1536 }, (_, index) => Number((index * 0.001).toFixed(6)));

function createEntity(id: string, status: KnowledgeEntity["status"] = "validated"): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get("brand.profile");
  if (!definition?.domain) {
    throw new Error("brand.profile domain is required for this test");
  }

  return {
    id,
    tenantId: TENANT_A,
    brandId: "770e8400-e29b-41d4-a716-446655440003",
    domain: definition.domain,
    entityType: "brand.profile",
    status,
    classification: "internal",
    title: "Brand",
    content: {},
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  };
}

function scored(entity: KnowledgeEntity, score: number): ScoredEntity {
  return { entity, score };
}

function createHighConfidenceSet(): ScoredEntity[] {
  return Array.from({ length: 5 }, (_, index) =>
    scored(
      createEntity(`knw_${String(index).padStart(8, "0")}-0000-4000-8000-000000000001`),
      0.91,
    ),
  );
}

function createService(overrides?: {
  hybrid?: HybridSearchEngine;
  embedding?: { embedQuery: ReturnType<typeof vi.fn> };
  contextAssembler?: ContextAssembler;
  confidenceScorer?: ConfidenceScorer;
  retrievalCache?: RetrievalCache;
}): {
  service: KnowledgeRetrievalService;
  hybrid: HybridSearchEngine;
  embedding: { embedQuery: ReturnType<typeof vi.fn> };
  contextAssembler: ContextAssembler;
  confidenceScorer: ConfidenceScorer;
  retrievalCache: RetrievalCache;
} {
  const hybrid =
    overrides?.hybrid ??
    ({
      search: vi.fn().mockResolvedValue(createHighConfidenceSet()),
    } satisfies HybridSearchEngine);
  const embedding = overrides?.embedding ?? {
    embedQuery: vi.fn().mockResolvedValue(VECTOR),
  };
  const contextAssembler =
    overrides?.contextAssembler ??
    ({
      assemble: vi.fn().mockResolvedValue({
        layers: [],
        totalTokens: 0,
        maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
        entities: [],
        assembledAt: "2026-09-04T00:00:00.000Z",
      }),
    } satisfies ContextAssembler);
  const confidenceScorer =
    overrides?.confidenceScorer ??
    ({
      score: vi.fn().mockReturnValue({
        confidence: "high",
        averageScore: 0.91,
        resultCount: 5,
        validatedCount: 5,
        gaps: [],
      }),
    } satisfies ConfidenceScorer);
  const retrievalCache = overrides?.retrievalCache ?? new InMemoryRetrievalCache();

  return {
    service: new DefaultKnowledgeRetrievalService(
      hybrid,
      embedding as never,
      contextAssembler,
      confidenceScorer,
      new DefaultCitationBuilder(),
      retrievalCache,
      new DefaultAuroraAuthorizationService(),
    ),
    hybrid,
    embedding,
    contextAssembler,
    confidenceScorer,
    retrievalCache,
  };
}

function createRequest(overrides: Partial<RetrievalRequest> = {}): RetrievalRequest {
  return {
    taskType: "content_generation",
    query: "brand voice guidelines",
    ...overrides,
  };
}

function createCtx(overrides: Partial<AuroraRuntimeContext> = {}) {
  return createTestAuroraRuntimeContext({
    tenantId: TENANT_A,
    userId: "usr_test",
    brandId: "770e8400-e29b-41d4-a716-446655440003",
    ...overrides,
  });
}

describe("KnowledgeRetrievalService", () => {
  it("orchestrates a successful end-to-end preflight retrieval", async () => {
    const { service } = createService();
    const result = await service.preflight(createCtx(), createRequest());

    expect(result.confidence).toBe("high");
    expect(result.contextPackage.maxTokens).toBe(RETRIEVAL_MAX_CONTEXT_TOKENS);
    expect(result.citations).toEqual([]);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("builds citations from assembled context entities", async () => {
    const entities = createHighConfidenceSet().slice(0, 2);
    const contextAssembler = {
      assemble: vi.fn().mockResolvedValue({
        layers: [],
        totalTokens: 0,
        maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
        entities: entities.map((item) => item.entity),
        assembledAt: "2026-09-04T00:00:00.000Z",
      }),
    } satisfies ContextAssembler;
    const hybrid = { search: vi.fn().mockResolvedValue(entities) } satisfies HybridSearchEngine;
    const { service } = createService({ hybrid, contextAssembler });

    const result = await service.preflight(createCtx(), createRequest());

    expect(result.citations).toHaveLength(2);
    expect(result.citations.map((citation) => citation.entityId)).toEqual(
      entities.map((item) => item.entity.id),
    );
    expect(
      result.citations.every((citation) => citation.retrievedAt === "2026-09-04T00:00:00.000Z"),
    ).toBe(true);
  });

  it("preserves ERR-2 keyword-only degradation with keyword-derived citations", async () => {
    const entities = createHighConfidenceSet().slice(0, 2);
    const embedding = {
      embedQuery: vi.fn().mockRejectedValue(new EmbeddingProviderUnavailableError("Embedding unavailable")),
    };
    const contextAssembler = {
      assemble: vi.fn().mockResolvedValue({
        layers: [],
        totalTokens: 0,
        maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
        entities: entities.map((item) => item.entity),
        assembledAt: "2026-09-04T00:00:00.000Z",
      }),
    } satisfies ContextAssembler;
    const hybrid = { search: vi.fn().mockResolvedValue(entities) } satisfies HybridSearchEngine;
    const { service } = createService({ embedding, hybrid, contextAssembler });

    const result = await service.preflight(createCtx(), createRequest());

    expect(result.citations).toHaveLength(2);
    expect(
      result.citations.every((citation) =>
        entities.some((item) => item.entity.id === citation.entityId),
      ),
    ).toBe(true);
  });

  it("runs preflight validation before retrieval", async () => {
    const { service } = createService();

    await expect(
      service.preflight(createCtx(), createRequest({ query: "   " })),
    ).rejects.toBeInstanceOf(RetrievalInvalidRequestError);
  });

  it("rejects unsupported task types", async () => {
    const { service } = createService();

    await expect(
      service.preflight(createCtx(), {
        taskType: "unsupported_task" as RetrievalRequest["taskType"],
        query: "test",
      }),
    ).rejects.toBeInstanceOf(RetrievalUnsupportedTaskError);
  });

  it("rejects unauthorized retrieval access without ERR-2 degradation", async () => {
    const hybrid = { search: vi.fn().mockResolvedValue([]) } satisfies HybridSearchEngine;
    const confidenceScorer = {
      score: vi.fn(),
    } satisfies ConfidenceScorer;
    const { service } = createService({ hybrid, confidenceScorer });

    await expect(
      service.preflight(
        createCtx({
          roles: ["aurora.viewer"],
          auroraPermissions: [
            "aurora.content.read",
            "aurora.campaign.read",
            "aurora.seo.read",
            "aurora.analytics.read",
            "aurora.creative.read",
          ],
        }),
        createRequest(),
      ),
    ).rejects.toBeInstanceOf(AuroraError);

    expect(hybrid.search).not.toHaveBeenCalled();
    expect(confidenceScorer.score).not.toHaveBeenCalled();
  });

  it("allows viewer with aurora.knowledge.read to complete preflight", async () => {
    const hybrid = { search: vi.fn().mockResolvedValue(createHighConfidenceSet()) } satisfies HybridSearchEngine;
    const { service, embedding } = createService({ hybrid });

    const result = await service.preflight(
      createCtx({
        roles: ["aurora.viewer"],
        auroraPermissions: [
          "aurora.content.read",
          "aurora.campaign.read",
          "aurora.seo.read",
          "aurora.analytics.read",
          "aurora.creative.read",
          "aurora.knowledge.read",
        ],
      }),
      createRequest(),
    );

    expect(embedding.embedQuery).toHaveBeenCalled();
    expect(result.confidence).toBe("high");
  });

  it("requires runtime tenant context", async () => {
    const { service } = createService();

    await expect(service.preflight(createCtx({ tenantId: "" }), createRequest())).rejects.toBeInstanceOf(
      KnowledgeInvalidTenantContextError,
    );
  });

  it("maps supported tasks to canonical retrieval domains", () => {
    const query = buildRetrievalQueryFromRequest(createCtx(), createRequest({ taskType: "seo_analysis" }));

    expect(query.domains).toEqual([
      "knowledge.seo",
      "knowledge.content",
      "knowledge.brand",
      "knowledge.industry",
    ]);
  });

  it("invokes HybridSearchEngine with the built retrieval query and query vector", async () => {
    const hybrid = { search: vi.fn().mockResolvedValue([]) } satisfies HybridSearchEngine;
    const { service, embedding } = createService({ hybrid });

    await service.preflight(createCtx(), createRequest());

    expect(embedding.embedQuery).toHaveBeenCalledWith(expect.anything(), "brand voice guidelines");
    expect(hybrid.search).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: TENANT_A }),
      expect.objectContaining({
        query: "brand voice guidelines",
        validatedOnly: false,
      }),
      expect.objectContaining({ queryVector: VECTOR }),
    );
  });

  it("invokes ConfidenceScorer before ContextAssembler per canonical ordering", async () => {
    const callOrder: string[] = [];
    const hybrid = {
      search: vi.fn().mockImplementation(async () => {
        callOrder.push("hybrid");
        return createHighConfidenceSet();
      }),
    } satisfies HybridSearchEngine;
    const confidenceScorer = {
      score: vi.fn().mockImplementation(() => {
        callOrder.push("confidence");
        return {
          confidence: "high",
          averageScore: 0.91,
          resultCount: 5,
          validatedCount: 5,
          gaps: [],
        };
      }),
    } satisfies ConfidenceScorer;
    const contextAssembler = {
      assemble: vi.fn().mockImplementation(async () => {
        callOrder.push("context");
        return {
          layers: [],
          totalTokens: 0,
          maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
          entities: [],
          assembledAt: "2026-09-04T00:00:00.000Z",
        };
      }),
    } satisfies ContextAssembler;

    const { service } = createService({ hybrid, confidenceScorer, contextAssembler });
    await service.preflight(createCtx(), createRequest());

    expect(callOrder).toEqual(["hybrid", "confidence", "context"]);
  });

  it("passes scored entities to ContextAssembler and ConfidenceScorer", async () => {
    const entities = createHighConfidenceSet();
    const hybrid = { search: vi.fn().mockResolvedValue(entities) } satisfies HybridSearchEngine;
    const confidenceScorer = {
      score: vi.fn().mockReturnValue({
        confidence: "high",
        averageScore: 0.91,
        resultCount: 5,
        validatedCount: 5,
        gaps: [],
      }),
    } satisfies ConfidenceScorer;
    const contextAssembler = {
      assemble: vi.fn().mockResolvedValue({
        layers: [],
        totalTokens: 0,
        maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
        entities: [],
        assembledAt: "2026-09-04T00:00:00.000Z",
      }),
    } satisfies ContextAssembler;
    const { service } = createService({ hybrid, confidenceScorer, contextAssembler });

    await service.preflight(createCtx(), createRequest());

    expect(confidenceScorer.score).toHaveBeenCalledWith(
      expect.objectContaining({ scoredEntities: entities }),
    );
    expect(contextAssembler.assemble).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ scoredEntities: entities, taskType: "content_generation" }),
    );
  });

  it("returns insufficient confidence without fabricating citations", async () => {
    const confidenceScorer = {
      score: vi.fn().mockReturnValue({
        confidence: "insufficient",
        averageScore: 0,
        resultCount: 0,
        validatedCount: 0,
        gaps: ["No relevant knowledge entities retrieved for the requested context."],
      }),
    } satisfies ConfidenceScorer;
    const hybrid = { search: vi.fn().mockResolvedValue([]) } satisfies HybridSearchEngine;
    const { service } = createService({ hybrid, confidenceScorer });

    const result = await service.preflight(createCtx(), createRequest());

    expect(result.confidence).toBe("insufficient");
    expect(result.citations).toEqual([]);
    expect(result.gaps.length).toBeGreaterThan(0);
  });

  it("preserves ERR-2 semantic degradation metadata", async () => {
    const embedding = {
      embedQuery: vi.fn().mockRejectedValue(new EmbeddingProviderUnavailableError("Embedding unavailable")),
    };
    const confidenceScorer = {
      score: vi.fn().mockReturnValue({
        confidence: "low",
        averageScore: 0.72,
        resultCount: 2,
        validatedCount: 2,
        gaps: [],
      }),
    } satisfies ConfidenceScorer;
    const hybrid = {
      search: vi.fn().mockResolvedValue(createHighConfidenceSet().slice(0, 2)),
    } satisfies HybridSearchEngine;
    const { service } = createService({ embedding, hybrid, confidenceScorer });

    await service.preflight(createCtx(), createRequest());

    expect(confidenceScorer.score).toHaveBeenCalledWith(
      expect.objectContaining({ semanticDegraded: true, memoryDegraded: true }),
    );
  });

  it("preserves ERR-3 memory degradation metadata for Sprint 3", async () => {
    const confidenceScorer = {
      score: vi.fn().mockReturnValue({
        confidence: "medium",
        averageScore: 0.8,
        resultCount: 3,
        validatedCount: 3,
        gaps: [],
      }),
    } satisfies ConfidenceScorer;
    const { service } = createService({ confidenceScorer });

    await service.preflight(createCtx(), createRequest());

    expect(confidenceScorer.score).toHaveBeenCalledWith(
      expect.objectContaining({ memoryDegraded: true }),
    );
  });

  it("identifies validated-only roles", () => {
    expect(requiresValidatedOnlyRetrieval(createCtx({ roles: ["aurora.viewer"] }))).toBe(true);
    expect(requiresValidatedOnlyRetrieval(createCtx({ roles: ["aurora.admin"] }))).toBe(false);
  });

  it("applies validated-only filters for viewer roles", async () => {
    const hybrid = { search: vi.fn().mockResolvedValue([]) } satisfies HybridSearchEngine;
    const { service } = createService({ hybrid });

    await service.preflight(
      createCtx({
        roles: ["aurora.viewer"],
        auroraPermissions: [
          "aurora.content.read",
          "aurora.campaign.read",
          "aurora.seo.read",
          "aurora.analytics.read",
          "aurora.creative.read",
          "aurora.knowledge.read",
        ],
      }),
      createRequest(),
    );

    expect(hybrid.search).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ validatedOnly: true, includeProvisional: false }),
      expect.anything(),
    );
  });

  it("delegates assembleContext to ContextAssembler", async () => {
    const contextAssembler = {
      assemble: vi.fn().mockResolvedValue({
        layers: [
          {
            key: "brand",
            content: "Brand",
            tokenCount: 1,
            maxTokens: CONTEXT_LAYER_TOKEN_LIMITS.brand,
          },
        ],
        totalTokens: 1,
        maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
        entities: [],
        assembledAt: "2026-09-04T00:00:00.000Z",
      }),
    } satisfies ContextAssembler;
    const { service } = createService({ contextAssembler });
    const ctx = createCtx();
    const request: ContextAssemblyRequest = { scoredEntities: createHighConfidenceSet() };

    const result = await service.assembleContext(ctx, request);

    expect(contextAssembler.assemble).toHaveBeenCalledWith(ctx, request);
    expect(result.totalTokens).toBe(1);
  });

  it("exposes hybrid search without full context assembly", async () => {
    const hybrid = { search: vi.fn().mockResolvedValue(createHighConfidenceSet()) } satisfies HybridSearchEngine;
    const { service } = createService({ hybrid });
    const query: RetrievalQuery = { query: "brand voice" };

    const results = await service.search(createCtx(), query);

    expect(results).toHaveLength(5);
    expect(hybrid.search).toHaveBeenCalled();
  });

  it("does not mutate upstream scored entities during preflight", async () => {
    const entities = createHighConfidenceSet();
    const snapshot = structuredClone(entities);
    const hybrid = { search: vi.fn().mockResolvedValue(entities) } satisfies HybridSearchEngine;
    const { service } = createService({ hybrid });

    await service.preflight(createCtx(), createRequest());

    expect(entities).toEqual(snapshot);
  });

  it("does not mutate the retrieval request", async () => {
    const request = createRequest();
    const snapshot = structuredClone(request);
    const { service } = createService();

    await service.preflight(createCtx(), request);

    expect(request).toEqual(snapshot);
  });

  it("returns a stable result structure for repeated identical preflight calls", async () => {
    const confidenceScorer = {
      score: vi.fn().mockReturnValue({
        confidence: "medium",
        averageScore: 0.8,
        resultCount: 3,
        validatedCount: 3,
        gaps: ["Retrieval coverage is partial; review remaining knowledge gaps."],
      }),
    } satisfies ConfidenceScorer;
    const contextAssembler = {
      assemble: vi.fn().mockResolvedValue({
        layers: [],
        totalTokens: 0,
        maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
        entities: [],
        assembledAt: "2026-09-04T00:00:00.000Z",
      }),
    } satisfies ContextAssembler;
    const { service } = createService({ confidenceScorer, contextAssembler });
    const ctx = createCtx();
    const request = createRequest();

    const first = await service.preflight(ctx, request);
    const second = await service.preflight(ctx, request);

    expect(first.confidence).toEqual(second.confidence);
    expect(first.gaps).toEqual(second.gaps);
    expect(first.citations).toEqual(second.citations);
    expect(first.contextPackage).toEqual(second.contextPackage);
  });

  it("returns cached preflight results without re-running hybrid search", async () => {
    const entities = createHighConfidenceSet().slice(0, 2);
    const contextAssembler = {
      assemble: vi.fn().mockResolvedValue({
        layers: [],
        totalTokens: 0,
        maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
        entities: entities.map((item) => item.entity),
        assembledAt: "2026-09-04T00:00:00.000Z",
      }),
    } satisfies ContextAssembler;
    const hybrid = { search: vi.fn().mockResolvedValue(entities) } satisfies HybridSearchEngine;
    const { service, hybrid: hybridMock } = createService({ hybrid, contextAssembler });
    const ctx = createCtx();
    const request = createRequest();

    const first = await service.preflight(ctx, request);
    const second = await service.preflight(ctx, request);

    expect(hybridMock.search).toHaveBeenCalledTimes(1);
    expect(second.confidence).toEqual(first.confidence);
    expect(second.citations).toEqual(first.citations);
    expect(second.contextPackage).toEqual(first.contextPackage);
    expect(second.gaps).toEqual(first.gaps);
    expect(second.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("does not cache semantically degraded preflight results", async () => {
    const entities = createHighConfidenceSet().slice(0, 2);
    const embedding = {
      embedQuery: vi.fn().mockRejectedValue(new EmbeddingProviderUnavailableError("Embedding unavailable")),
    };
    const contextAssembler = {
      assemble: vi.fn().mockResolvedValue({
        layers: [],
        totalTokens: 0,
        maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
        entities: entities.map((item) => item.entity),
        assembledAt: "2026-09-04T00:00:00.000Z",
      }),
    } satisfies ContextAssembler;
    const hybrid = { search: vi.fn().mockResolvedValue(entities) } satisfies HybridSearchEngine;
    const retrievalCache = new InMemoryRetrievalCache();
    const { service, hybrid: hybridMock } = createService({
      embedding,
      hybrid,
      contextAssembler,
      retrievalCache,
    });

    await service.preflight(createCtx(), createRequest());
    await service.preflight(createCtx(), createRequest());

    expect(hybridMock.search).toHaveBeenCalledTimes(2);
  });

  it("invalidateCache removes cached preflight results", async () => {
    const entities = createHighConfidenceSet().slice(0, 1);
    const contextAssembler = {
      assemble: vi.fn().mockResolvedValue({
        layers: [],
        totalTokens: 0,
        maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
        entities: entities.map((item) => item.entity),
        assembledAt: "2026-09-04T00:00:00.000Z",
      }),
    } satisfies ContextAssembler;
    const hybrid = { search: vi.fn().mockResolvedValue(entities) } satisfies HybridSearchEngine;
    const { service, hybrid: hybridMock } = createService({ hybrid, contextAssembler });
    const ctx = createCtx();
    const request = createRequest();

    await service.preflight(ctx, request);
    await service.invalidateCache(ctx);
    await service.preflight(ctx, request);

    expect(hybridMock.search).toHaveBeenCalledTimes(2);
  });

  it("propagates dependency failures without swallowing infrastructure errors", async () => {
    const hybrid = {
      search: vi.fn().mockRejectedValue(new Error("keyword infrastructure failure")),
    } satisfies HybridSearchEngine;
    const { service } = createService({ hybrid });

    await expect(service.preflight(createCtx(), createRequest())).rejects.toThrow(
      "keyword infrastructure failure",
    );
  });

  it("passes tenantId to confidence scoring for tenant-safe filtering", async () => {
    const confidenceScorer = {
      score: vi.fn().mockReturnValue({
        confidence: "high",
        averageScore: 0.91,
        resultCount: 5,
        validatedCount: 5,
        gaps: [],
      }),
    } satisfies ConfidenceScorer;
    const { service } = createService({ confidenceScorer });
    const ctx = createCtx();

    await service.preflight(ctx, createRequest());

    expect(confidenceScorer.score).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: ctx.tenantId }),
    );
  });
});

describe("retrievalOrchestration helpers", () => {
  const viewerCtx = createCtx({
    roles: ["aurora.viewer"],
    auroraPermissions: [
      "aurora.content.read",
      "aurora.campaign.read",
      "aurora.seo.read",
      "aurora.analytics.read",
      "aurora.creative.read",
      "aurora.knowledge.read",
    ],
  });
  const approverCtx = createCtx({
    roles: ["aurora.approver"],
    auroraPermissions: [
      "aurora.content.read",
      "aurora.content.approve",
      "aurora.campaign.read",
      "aurora.campaign.approve",
      "aurora.seo.read",
      "aurora.analytics.read",
      "aurora.creative.read",
      "aurora.knowledge.read",
    ],
  });

  it("honors explicit request domain overrides", () => {
    const query = buildRetrievalQueryFromRequest(
      createCtx(),
      createRequest({ domains: ["knowledge.brand"] }),
    );

    expect(query.domains).toEqual(["knowledge.brand"]);
  });

  it("enforces validated-only role floor for viewer with no request override", () => {
    expect(resolveRetrievalQueryFilters(viewerCtx, createRequest())).toEqual({
      validatedOnly: true,
      includeProvisional: false,
    });
  });

  it("ignores viewer request validatedOnly=false override", () => {
    expect(
      resolveRetrievalQueryFilters(viewerCtx, createRequest({ validatedOnly: false })),
    ).toEqual({
      validatedOnly: true,
      includeProvisional: false,
    });
  });

  it("ignores viewer request includeProvisional=true override", () => {
    expect(
      resolveRetrievalQueryFilters(viewerCtx, createRequest({ includeProvisional: true })),
    ).toEqual({
      validatedOnly: true,
      includeProvisional: false,
    });
  });

  it("ignores viewer request with both weakening overrides", () => {
    expect(
      resolveRetrievalQueryFilters(
        viewerCtx,
        createRequest({ validatedOnly: false, includeProvisional: true }),
      ),
    ).toEqual({
      validatedOnly: true,
      includeProvisional: false,
    });
  });

  it("enforces validated-only role floor for approver with validatedOnly=false", () => {
    expect(
      resolveRetrievalQueryFilters(approverCtx, createRequest({ validatedOnly: false })),
    ).toEqual({
      validatedOnly: true,
      includeProvisional: false,
    });
  });

  it("enforces validated-only role floor for approver with includeProvisional=true", () => {
    expect(
      resolveRetrievalQueryFilters(approverCtx, createRequest({ includeProvisional: true })),
    ).toEqual({
      validatedOnly: true,
      includeProvisional: false,
    });
  });

  it("preserves request preferences for non-validated-only roles", () => {
    const adminCtx = createCtx({ roles: ["aurora.admin"] });

    expect(resolveRetrievalQueryFilters(adminCtx, createRequest())).toEqual({
      validatedOnly: false,
      includeProvisional: true,
    });
    expect(
      resolveRetrievalQueryFilters(adminCtx, createRequest({ validatedOnly: true })),
    ).toEqual({
      validatedOnly: true,
      includeProvisional: false,
    });
    expect(
      resolveRetrievalQueryFilters(
        adminCtx,
        createRequest({ validatedOnly: false, includeProvisional: false }),
      ),
    ).toEqual({
      validatedOnly: false,
      includeProvisional: false,
    });
  });
});

describe("KnowledgeRetrievalService validated-only role floor", () => {
  const viewerCtx = createCtx({
    roles: ["aurora.viewer"],
    auroraPermissions: [
      "aurora.content.read",
      "aurora.campaign.read",
      "aurora.seo.read",
      "aurora.analytics.read",
      "aurora.creative.read",
      "aurora.knowledge.read",
    ],
  });

  async function expectPreflightFilters(
    request: RetrievalRequest,
    expected: { validatedOnly: boolean; includeProvisional: boolean },
  ): Promise<void> {
    const hybrid = { search: vi.fn().mockResolvedValue([]) } satisfies HybridSearchEngine;
    const contextAssembler = {
      assemble: vi.fn().mockResolvedValue({
        layers: [],
        totalTokens: 0,
        maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
        entities: [],
        assembledAt: "2026-09-04T00:00:00.000Z",
      }),
    } satisfies ContextAssembler;
    const { service } = createService({ hybrid, contextAssembler });

    await service.preflight(viewerCtx, request);

    expect(hybrid.search).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining(expected),
      expect.anything(),
    );
    expect(contextAssembler.assemble).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining(expected),
    );
  }

  it("passes role-floor filters to HybridSearchEngine and ContextAssembler", async () => {
    await expectPreflightFilters(createRequest(), {
      validatedOnly: true,
      includeProvisional: false,
    });
  });

  it("passes role-floor filters when request attempts validatedOnly=false", async () => {
    await expectPreflightFilters(createRequest({ validatedOnly: false }), {
      validatedOnly: true,
      includeProvisional: false,
    });
  });

  it("passes role-floor filters when request attempts includeProvisional=true", async () => {
    await expectPreflightFilters(createRequest({ includeProvisional: true }), {
      validatedOnly: true,
      includeProvisional: false,
    });
  });

  it("passes role-floor filters when request attempts both weakening overrides", async () => {
    await expectPreflightFilters(
      createRequest({ validatedOnly: false, includeProvisional: true }),
      {
        validatedOnly: true,
        includeProvisional: false,
      },
    );
  });
});
