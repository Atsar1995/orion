import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  InMemoryEmbeddingRepository,
  InMemoryKnowledgeRepository,
  PostgresEmbeddingRepository,
  PostgresKnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories";
import type { ContextAssembler } from "@/lib/aurora/knowledge/retrieval/ContextAssembler";
import type { HybridSearchEngine } from "@/lib/aurora/knowledge/retrieval/HybridSearchEngine";
import {
  DefaultConfidenceScorer,
  DefaultContextAssembler,
  DefaultCitationBuilder,
  DefaultGraphSearchEngine,
  DefaultHybridSearchEngine,
  DefaultKeywordSearchEngine,
  DefaultMemorySearchEngine,
  DefaultSemanticSearchEngine,
} from "@/lib/aurora/knowledge/retrieval";
import { InMemoryRetrievalCache } from "@/lib/aurora/knowledge/cache";
import type { EmbeddingProvider } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import {
  DefaultEmbeddingService,
  DefaultKnowledgeGraphService,
  DefaultKnowledgeRetrievalService,
  DefaultKnowledgeService,
  DefaultTaxonomyManager,
  DeterministicEmbeddingProvider,
  RelationshipEngine,
  type KnowledgeRetrievalService,
} from "@/lib/aurora/knowledge/services";
import type { KnowledgeService } from "@/lib/aurora/knowledge/services/KnowledgeService";
import type { RetrievalCache } from "@/lib/aurora/knowledge/cache/RetrievalCache";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { EmbeddingService } from "@/lib/aurora/knowledge/services/EmbeddingService";
import type { KnowledgeRepository } from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";
import type { PostgresTestHarness } from "@/tests/aurora/helpers/postgresTestHarness";

export function createKnowledgeEntity(
  tenantId: string,
  brandId: string,
  overrides: Partial<KnowledgeEntity> & Pick<KnowledgeEntity, "id" | "entityType">,
): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get(overrides.entityType);
  if (!definition?.domain) {
    throw new Error(`Unknown entity type: ${overrides.entityType}`);
  }

  return {
    tenantId,
    brandId,
    domain: definition.domain,
    status: "validated",
    classification: "internal",
    title: "Knowledge entity",
    content: {},
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
    ...overrides,
  };
}

export function createHarnessContext(
  harness: PostgresTestHarness,
  tenant: "A" | "B",
  overrides: Partial<AuroraRuntimeContext> = {},
): AuroraRuntimeContext {
  return createTestAuroraRuntimeContext({
    tenantId: tenant === "A" ? harness.tenantAId : harness.tenantBId,
    userId: tenant === "A" ? harness.userAId : harness.userBId,
    brandId: tenant === "A" ? harness.brandAId : harness.brandBId,
    ...overrides,
  });
}

export const VIEWER_KNOWLEDGE_PERMISSIONS = [
  "aurora.content.read",
  "aurora.campaign.read",
  "aurora.seo.read",
  "aurora.analytics.read",
  "aurora.creative.read",
  "aurora.knowledge.read",
] as const;

export const APPROVER_KNOWLEDGE_PERMISSIONS = [
  "aurora.content.read",
  "aurora.content.approve",
  "aurora.campaign.read",
  "aurora.campaign.approve",
  "aurora.seo.read",
  "aurora.analytics.read",
  "aurora.creative.read",
  "aurora.knowledge.read",
] as const;

export type KnowledgeRetrievalOrchestrationStack = {
  readonly hybridSearchEngine: HybridSearchEngine;
  readonly contextAssembler: ContextAssembler;
};

export type PostgresKnowledgeRetrievalStack = KnowledgeRetrievalOrchestrationStack & {
  readonly retrievalService: KnowledgeRetrievalService;
  readonly knowledgeRepository: KnowledgeRepository;
  readonly embeddingService: EmbeddingService;
};

export type InMemoryKnowledgeRetrievalStack = KnowledgeRetrievalOrchestrationStack & {
  readonly retrievalService: KnowledgeRetrievalService;
  readonly knowledgeService: KnowledgeService;
  readonly knowledgeRepository: InMemoryKnowledgeRepository;
  readonly embeddingService: EmbeddingService;
  readonly retrievalCache: RetrievalCache;
};

export function createInMemoryKnowledgeRetrievalStack(
  repository: InMemoryKnowledgeRepository = new InMemoryKnowledgeRepository(),
  embeddingProvider: EmbeddingProvider = new DeterministicEmbeddingProvider(),
): InMemoryKnowledgeRetrievalStack {
  const authorization = new DefaultAuroraAuthorizationService();
  const retrievalCache = new InMemoryRetrievalCache();
  const embeddingRepository = new InMemoryEmbeddingRepository();
  const embeddingService = new DefaultEmbeddingService(
    embeddingProvider,
    embeddingRepository,
    repository,
    authorization,
  );
  const knowledgeService = new DefaultKnowledgeService(
    repository,
    authorization,
    new DefaultTaxonomyManager(),
    retrievalCache,
  );
  const graphService = new DefaultKnowledgeGraphService(
    knowledgeService,
    new RelationshipEngine(repository),
    repository,
    authorization,
  );
  const hybridSearchEngine = new DefaultHybridSearchEngine(
    new DefaultSemanticSearchEngine(embeddingService, repository),
    new DefaultKeywordSearchEngine(repository, authorization),
    new DefaultGraphSearchEngine(graphService, authorization),
    new DefaultMemorySearchEngine(authorization),
    authorization,
  );
  const contextAssembler = new DefaultContextAssembler(authorization);

  return {
    knowledgeRepository: repository,
    embeddingService,
    hybridSearchEngine,
    contextAssembler,
    knowledgeService,
    retrievalCache,
    retrievalService: new DefaultKnowledgeRetrievalService(
      hybridSearchEngine,
      embeddingService,
      contextAssembler,
      new DefaultConfidenceScorer(),
      new DefaultCitationBuilder(),
      retrievalCache,
      authorization,
    ),
  };
}

export function createPostgresKnowledgeRetrievalStack(
  harness: PostgresTestHarness,
): PostgresKnowledgeRetrievalStack {
  const authorization = new DefaultAuroraAuthorizationService();
  const retrievalCache = new InMemoryRetrievalCache();
  const knowledgeRepository = new PostgresKnowledgeRepository(harness.tenantDbScope);
  const embeddingRepository = new PostgresEmbeddingRepository(harness.tenantDbScope);
  const embeddingService = new DefaultEmbeddingService(
    new DeterministicEmbeddingProvider(),
    embeddingRepository,
    knowledgeRepository,
    authorization,
  );
  const knowledgeService = new DefaultKnowledgeService(
    knowledgeRepository,
    authorization,
    new DefaultTaxonomyManager(),
    retrievalCache,
  );
  const graphService = new DefaultKnowledgeGraphService(
    knowledgeService,
    new RelationshipEngine(knowledgeRepository),
    knowledgeRepository,
    authorization,
  );
  const hybridSearchEngine = new DefaultHybridSearchEngine(
    new DefaultSemanticSearchEngine(embeddingService, knowledgeRepository),
    new DefaultKeywordSearchEngine(knowledgeRepository, authorization),
    new DefaultGraphSearchEngine(graphService, authorization),
    new DefaultMemorySearchEngine(authorization),
    authorization,
  );
  const contextAssembler = new DefaultContextAssembler(authorization);

  return {
    knowledgeRepository,
    embeddingService,
    hybridSearchEngine,
    contextAssembler,
    retrievalService: new DefaultKnowledgeRetrievalService(
      hybridSearchEngine,
      embeddingService,
      contextAssembler,
      new DefaultConfidenceScorer(),
      new DefaultCitationBuilder(),
      retrievalCache,
      authorization,
    ),
  };
}

export function createPostgresKnowledgeRetrievalService(
  harness: PostgresTestHarness,
): KnowledgeRetrievalService {
  return createPostgresKnowledgeRetrievalStack(harness).retrievalService;
}
