import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
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
import { EmbeddingProviderUnavailableError } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import type { EmbeddingProvider } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
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
import { AURORA_ERR_0403 } from "@/lib/aurora/errors/AuroraError";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
import {
  APPROVER_KNOWLEDGE_PERMISSIONS,
  VIEWER_KNOWLEDGE_PERMISSIONS,
  createKnowledgeEntity,
} from "@/tests/aurora/helpers/knowledgeSecurityFixtures";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const TENANT_B = "550e8400-e29b-41d4-a716-446655440002";
const BRAND_A = "770e8400-e29b-41d4-a716-446655440003";
const BRAND_B = "880e8400-e29b-41d4-a716-446655440004";

const unavailableEmbeddingProvider: EmbeddingProvider = {
  embed: async () => {
    throw new EmbeddingProviderUnavailableError("Embedding unavailable for citation attachment test");
  },
  embedBatch: async () => {
    throw new EmbeddingProviderUnavailableError("Embedding unavailable for citation attachment test");
  },
};

function createRetrievalService(
  repository: InMemoryKnowledgeRepository,
  embeddingProvider: EmbeddingProvider = new DeterministicEmbeddingProvider(),
) {
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

  return new DefaultKnowledgeRetrievalService(
    hybridSearchEngine,
    embeddingService,
    contextAssembler,
    new DefaultConfidenceScorer(),
    new DefaultCitationBuilder(),
    retrievalCache,
    authorization,
  );
}

describe("citationAttachment", () => {
  it("attaches citations for eligible retrieved entities through preflight", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const validatedId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: validatedId,
        entityType: "brand.profile",
        status: "validated",
        title: "gate14 validated brand voice",
        content: { note: "validated brand voice guidance" },
      }),
    );

    const service = createRetrievalService(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_admin",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    });

    const result = await service.preflight(ctx, {
      taskType: "content_generation",
      query: "gate14 validated brand voice",
    });

    expect(result.contextPackage.entities.some((entity) => entity.id === validatedId)).toBe(true);
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.citations.some((citation) => citation.entityId === validatedId)).toBe(true);
    expect(result.citations.every((citation) => citation.retrievedAt === result.contextPackage.assembledAt)).toBe(
      true,
    );
  });

  it("returns only validated citations for viewer roles", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const validatedId = `knw_${randomUUID()}`;
    const provisionalId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: validatedId,
        entityType: "brand.profile",
        status: "validated",
        title: "gate14 viewer validated voice",
        content: { note: "validated viewer guidance" },
      }),
    );
    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: provisionalId,
        entityType: "brand.profile",
        status: "provisional",
        title: "gate14 viewer provisional voice",
        content: { note: "provisional viewer guidance" },
      }),
    );

    const service = createRetrievalService(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      brandId: BRAND_A,
      roles: ["aurora.viewer"],
      auroraPermissions: [...VIEWER_KNOWLEDGE_PERMISSIONS],
    });

    const result = await service.preflight(ctx, {
      taskType: "content_generation",
      query: "gate14 viewer voice",
      includeProvisional: true,
    });

    expect(result.citations.map((citation) => citation.entityId)).toContain(validatedId);
    expect(result.citations.map((citation) => citation.entityId)).not.toContain(provisionalId);
  });

  it("returns only validated citations for approver roles", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const provisionalId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: provisionalId,
        entityType: "brand.profile",
        status: "provisional",
        title: "gate14 approver provisional voice",
        content: { note: "provisional approver guidance" },
      }),
    );

    const service = createRetrievalService(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_approver",
      brandId: BRAND_A,
      roles: ["aurora.approver"],
      auroraPermissions: [...APPROVER_KNOWLEDGE_PERMISSIONS],
    });

    const result = await service.preflight(ctx, {
      taskType: "content_generation",
      query: "gate14 approver provisional voice",
      includeProvisional: true,
    });

    expect(result.citations.some((citation) => citation.entityId === provisionalId)).toBe(false);
  });

  it("denies preflight citation attachment without aurora.knowledge.read", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const service = createRetrievalService(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      brandId: BRAND_A,
      roles: ["aurora.viewer"],
      auroraPermissions: [
        "aurora.content.read",
        "aurora.campaign.read",
        "aurora.seo.read",
        "aurora.analytics.read",
        "aurora.creative.read",
      ],
    });

    await expect(
      service.preflight(ctx, {
        taskType: "content_generation",
        query: "brand voice",
      }),
    ).rejects.toMatchObject({ code: AURORA_ERR_0403, statusCode: 403 });
  });

  it("preserves ERR-2 keyword-only degradation while attaching keyword-derived citations", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const validatedId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: validatedId,
        entityType: "brand.profile",
        status: "validated",
        title: "gate14 keyword only brand voice",
        content: { note: "keyword only guidance" },
      }),
    );

    const service = createRetrievalService(repository, unavailableEmbeddingProvider);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_admin",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    });

    const result = await service.preflight(ctx, {
      taskType: "content_generation",
      query: "gate14 keyword only brand voice",
    });

    expect(result.citations.some((citation) => citation.entityId === validatedId)).toBe(true);
  });

  it("does not attach cross-tenant citations", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const tenantAId = `knw_${randomUUID()}`;
    const tenantBId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: tenantAId,
        entityType: "brand.profile",
        status: "validated",
        title: "tenant a brand voice",
        content: { note: "tenant a guidance" },
      }),
    );
    await repository.create(
      TENANT_B,
      createKnowledgeEntity(TENANT_B, BRAND_B, {
        id: tenantBId,
        entityType: "brand.profile",
        status: "validated",
        title: "tenant b brand voice",
        content: { note: "tenant b guidance" },
      }),
    );

    const service = createRetrievalService(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_admin",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    });

    const result = await service.preflight(ctx, {
      taskType: "content_generation",
      query: "tenant a brand voice",
    });

    expect(result.citations.map((citation) => citation.entityId)).toContain(tenantAId);
    expect(result.citations.map((citation) => citation.entityId)).not.toContain(tenantBId);
  });

  it("does not fabricate citations when retrieval returns no eligible entities", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const service = createRetrievalService(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_admin",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    });

    const result = await service.preflight(ctx, {
      taskType: "content_generation",
      query: "no matching knowledge in empty repository",
    });

    expect(result.citations).toEqual([]);
  });
});
