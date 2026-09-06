import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  InMemoryEmbeddingRepository,
  InMemoryKnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories";
import {
  DefaultCitationBuilder,
  DefaultConfidenceScorer,
  DefaultContextAssembler,
  DefaultGraphSearchEngine,
  DefaultHybridSearchEngine,
  DefaultKeywordSearchEngine,
  DefaultMemorySearchEngine,
  DefaultSemanticSearchEngine,
} from "@/lib/aurora/knowledge/retrieval";
import { InMemoryRetrievalCache } from "@/lib/aurora/knowledge/cache";
import {
  DefaultEmbeddingService,
  DefaultKnowledgeGraphService,
  DefaultKnowledgeRetrievalService,
  DefaultKnowledgeService,
  DefaultTaxonomyManager,
  DeterministicEmbeddingProvider,
  RelationshipEngine,
} from "@/lib/aurora/knowledge/services";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const BRAND_A = "770e8400-e29b-41d4-a716-446655440003";

function createKnowledgeEntity(
  id: string,
  title: string,
  content: Record<string, unknown>,
): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get("brand.profile");
  if (!definition?.domain) {
    throw new Error("brand.profile domain is required for this test");
  }

  return {
    id,
    tenantId: TENANT_A,
    brandId: BRAND_A,
    domain: definition.domain,
    entityType: "brand.profile",
    status: "validated",
    classification: "internal",
    title,
    content,
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  };
}

function createStack(repository: InMemoryKnowledgeRepository) {
  const authorization = new DefaultAuroraAuthorizationService();
  const retrievalCache = new InMemoryRetrievalCache();
  const embeddingRepository = new InMemoryEmbeddingRepository();
  const embeddingService = new DefaultEmbeddingService(
    new DeterministicEmbeddingProvider(),
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
  const retrievalService = new DefaultKnowledgeRetrievalService(
    hybridSearchEngine,
    embeddingService,
    new DefaultContextAssembler(authorization),
    new DefaultConfidenceScorer(),
    new DefaultCitationBuilder(),
    retrievalCache,
    authorization,
  );

  return { knowledgeService, retrievalService };
}

describe("retrieval cache write invalidation", () => {
  it("invalidates cached preflight results after KnowledgeService.updateEntity", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const entityId = `knw_${randomUUID()}`;
    const initial = createKnowledgeEntity(entityId, "Original brand voice", {
      note: "brand voice guidance original",
    });

    await repository.create(TENANT_A, initial);

    const { knowledgeService, retrievalService } = createStack(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_admin",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    });
    const request = {
      taskType: "content_generation" as const,
      query: "brand voice guidance",
    };

    const first = await retrievalService.preflight(ctx, request);
    const cached = await retrievalService.preflight(ctx, request);

    expect(first.contextPackage.entities[0]?.title).toBe("Original brand voice");
    expect(cached.contextPackage.entities[0]?.title).toBe("Original brand voice");

    await knowledgeService.updateEntity(ctx, entityId, {
      entity: {
        ...initial,
        title: "Updated brand voice",
        content: { note: "brand voice guidance updated" },
        version: 2,
        updatedAt: "2026-09-05T00:00:00.000Z",
      },
      changedBy: "usr_admin",
    });

    const refreshed = await retrievalService.preflight(ctx, request);

    expect(refreshed.contextPackage.entities.some((entity) => entity.title === "Updated brand voice")).toBe(
      true,
    );
    expect(
      refreshed.citations.some((citation) => citation.title === "Updated brand voice"),
    ).toBe(true);
  });

  it("invalidates cached preflight results after KnowledgeService.createEntity", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const { knowledgeService, retrievalService } = createStack(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_admin",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    });
    const request = {
      taskType: "content_generation" as const,
      query: "net new brand guidance",
    };

    const beforeCreate = await retrievalService.preflight(ctx, request);
    expect(beforeCreate.confidence).toBe("insufficient");
    expect(beforeCreate.contextPackage.entities).toEqual([]);

    const entityId = `knw_${randomUUID()}`;
    await knowledgeService.createEntity(ctx, {
      entity: createKnowledgeEntity(entityId, "Net new brand guidance", {
        note: "fresh guidance",
      }),
    });

    const afterCreate = await retrievalService.preflight(ctx, request);

    expect(afterCreate.contextPackage.entities.some((entity) => entity.id === entityId)).toBe(true);
    expect(afterCreate.citations.some((citation) => citation.entityId === entityId)).toBe(true);
  });
});
