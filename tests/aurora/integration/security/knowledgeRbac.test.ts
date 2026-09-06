import { randomUUID } from "node:crypto";
import type { EmbeddingProvider } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import { EmbeddingProviderUnavailableError } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import {
  InMemoryEmbeddingRepository,
  InMemoryKnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories";
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
import { AURORA_ERR_0403, AuroraError } from "@/lib/aurora/errors/AuroraError";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
import {
  AURORA_LIVE_POSTGRES,
  cleanupPostgresTestHarness,
  setupPostgresTestHarness,
  type PostgresTestHarness,
} from "@/tests/aurora/helpers/postgresTestHarness";
import {
  APPROVER_KNOWLEDGE_PERMISSIONS,
  VIEWER_KNOWLEDGE_PERMISSIONS,
  createHarnessContext,
  createKnowledgeEntity,
  createPostgresKnowledgeRetrievalStack,
} from "@/tests/aurora/helpers/knowledgeSecurityFixtures";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const TENANT_B = "550e8400-e29b-41d4-a716-446655440002";
const BRAND_A = "770e8400-e29b-41d4-a716-446655440003";
const BRAND_B = "880e8400-e29b-41d4-a716-446655440004";

const unavailableEmbeddingProvider: EmbeddingProvider = {
  embed: async () => {
    throw new EmbeddingProviderUnavailableError("Embedding unavailable for Gate 13 RBAC test");
  },
  embedBatch: async () => {
    throw new EmbeddingProviderUnavailableError("Embedding unavailable for Gate 13 RBAC test");
  },
};

function createInMemoryRetrievalService(
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
    authorization,
    repository,
    embeddingRepository,
    hybridSearchEngine,
    contextAssembler,
    service: new DefaultKnowledgeRetrievalService(
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

describe("knowledgeRbac", () => {
  it("denies retrieval preflight without aurora.knowledge.read", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const { service } = createInMemoryRetrievalService(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_test",
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

  it("does not expose tenant identifiers in authorization denial messages", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const { service } = createInMemoryRetrievalService(repository);
    const secretTenantId = "990e8400-e29b-41d4-a716-446655440099";
    const ctx = createTestAuroraRuntimeContext({
      tenantId: secretTenantId,
      userId: "usr_test",
      brandId: BRAND_A,
      auroraPermissions: ["aurora.content.read"],
    });

    await expect(
      service.preflight(ctx, {
        taskType: "content_generation",
        query: "brand voice",
      }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(AuroraError);
      const message = (error as AuroraError).message;
      expect(message).not.toContain(secretTenantId);
      return true;
    });
  });

  it("allows viewer preflight with aurora.knowledge.read through query embedding", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const validatedId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: validatedId,
        entityType: "brand.profile",
        status: "validated",
        title: "gate13 validated brand voice",
        content: { note: "validated brand voice guidance" },
      }),
    );

    const { service } = createInMemoryRetrievalService(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      brandId: BRAND_A,
      roles: ["aurora.viewer"],
      auroraPermissions: [...VIEWER_KNOWLEDGE_PERMISSIONS],
    });

    const result = await service.preflight(ctx, {
      taskType: "content_generation",
      query: "gate13 validated brand voice",
    });

    expect(result.contextPackage.entities.some((entity) => entity.id === validatedId)).toBe(true);
  });

  it("enforces validated-only floor for viewer through preflight", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const validatedId = `knw_${randomUUID()}`;
    const provisionalId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: validatedId,
        entityType: "brand.profile",
        status: "validated",
        title: "gate13 validated brand voice",
        content: { note: "validated brand voice guidance" },
      }),
    );
    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: provisionalId,
        entityType: "brand.profile",
        status: "provisional",
        title: "gate13 provisional brand voice",
        content: { note: "provisional brand voice guidance" },
      }),
    );

    const { service } = createInMemoryRetrievalService(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      brandId: BRAND_A,
      roles: ["aurora.viewer"],
      auroraPermissions: [...VIEWER_KNOWLEDGE_PERMISSIONS],
    });

    const result = await service.preflight(ctx, {
      taskType: "content_generation",
      query: "gate13 brand voice",
      validatedOnly: false,
      includeProvisional: true,
    });

    const returnedIds = result.contextPackage.entities.map((entity) => entity.id);
    expect(returnedIds).toContain(validatedId);
    expect(returnedIds).not.toContain(provisionalId);
    expect(result.contextPackage.entities.every((entity) => entity.status === "validated")).toBe(
      true,
    );
  });

  it("enforces validated-only floor for approver through preflight", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const provisionalId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: provisionalId,
        entityType: "brand.profile",
        status: "provisional",
        title: "gate13 approver provisional voice",
        content: { note: "provisional approver voice guidance" },
      }),
    );

    const { service } = createInMemoryRetrievalService(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_approver",
      brandId: BRAND_A,
      roles: ["aurora.approver"],
      auroraPermissions: [...APPROVER_KNOWLEDGE_PERMISSIONS],
    });

    const result = await service.preflight(ctx, {
      taskType: "content_generation",
      query: "gate13 approver provisional voice",
      includeProvisional: true,
    });

    expect(result.contextPackage.entities.some((entity) => entity.id === provisionalId)).toBe(
      false,
    );
  });

  it("does not serve an admin cached preflight result to a viewer", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const validatedId = `knw_${randomUUID()}`;
    const provisionalId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: validatedId,
        entityType: "brand.profile",
        status: "validated",
        title: "gate15 cache validated voice",
        content: { note: "validated cache guidance" },
      }),
    );
    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: provisionalId,
        entityType: "brand.profile",
        status: "provisional",
        title: "gate15 cache provisional voice",
        content: { note: "provisional cache guidance" },
      }),
    );

    const { service } = createInMemoryRetrievalService(repository);
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_admin",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    });
    const viewerCtx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      brandId: BRAND_A,
      roles: ["aurora.viewer"],
      auroraPermissions: [...VIEWER_KNOWLEDGE_PERMISSIONS],
    });
    const request = {
      taskType: "content_generation" as const,
      query: "gate15 cache voice",
      includeProvisional: true,
    };

    const adminResult = await service.preflight(adminCtx, request);
    expect(adminResult.contextPackage.entities.map((entity) => entity.id)).toEqual(
      expect.arrayContaining([validatedId, provisionalId]),
    );

    const viewerResult = await service.preflight(viewerCtx, request);

    expect(viewerResult.contextPackage.entities.map((entity) => entity.id)).toContain(validatedId);
    expect(viewerResult.contextPackage.entities.map((entity) => entity.id)).not.toContain(
      provisionalId,
    );
  });

  it("degrades viewer retrieval to keyword-only when provider is unavailable", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const validatedId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: validatedId,
        entityType: "brand.profile",
        status: "validated",
        title: "gate13 err2 viewer keyword voice",
        content: { note: "err2 viewer keyword guidance" },
      }),
    );

    const { service } = createInMemoryRetrievalService(repository, unavailableEmbeddingProvider);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      brandId: BRAND_A,
      roles: ["aurora.viewer"],
      auroraPermissions: [...VIEWER_KNOWLEDGE_PERMISSIONS],
    });

    const result = await service.preflight(ctx, {
      taskType: "content_generation",
      query: "gate13 err2 viewer keyword voice",
    });

    expect(result.contextPackage.entities.some((entity) => entity.id === validatedId)).toBe(true);
  });

  it("allows admin retrieval preferences without weakening other roles", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const provisionalId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: provisionalId,
        entityType: "brand.profile",
        status: "provisional",
        title: "gate13 admin provisional voice",
        content: { note: "admin provisional voice guidance" },
      }),
    );

    const { service } = createInMemoryRetrievalService(repository);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_admin",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
    });

    const result = await service.preflight(ctx, {
      taskType: "content_generation",
      query: "gate13 admin provisional voice",
      includeProvisional: true,
    });

    expect(result.contextPackage.entities.some((entity) => entity.id === provisionalId)).toBe(
      true,
    );
  });

  it("preserves tenant isolation for in-memory retrieval orchestration", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const tenantAEntityId = `knw_${randomUUID()}`;
    const tenantBEntityId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_A,
      createKnowledgeEntity(TENANT_A, BRAND_A, {
        id: tenantAEntityId,
        entityType: "brand.profile",
        title: "gate13 tenant A isolated voice",
        content: { note: "tenant A isolated voice guidance" },
      }),
    );
    await repository.create(
      TENANT_B,
      createKnowledgeEntity(TENANT_B, BRAND_B, {
        id: tenantBEntityId,
        entityType: "brand.profile",
        title: "gate13 tenant B isolated voice",
        content: { note: "tenant B isolated voice guidance" },
      }),
    );

    const { service } = createInMemoryRetrievalService(repository);
    const tenantACtx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_a",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
    });
    const tenantBCtx = createTestAuroraRuntimeContext({
      tenantId: TENANT_B,
      userId: "usr_b",
      brandId: BRAND_B,
      roles: ["aurora.admin"],
    });

    const tenantAResult = await service.preflight(tenantACtx, {
      taskType: "content_generation",
      query: "gate13 tenant A isolated voice",
    });
    const tenantBResult = await service.preflight(tenantBCtx, {
      taskType: "content_generation",
      query: "gate13 tenant B isolated voice",
    });

    expect(tenantAResult.contextPackage.entities.every((entity) => entity.tenantId === TENANT_A)).toBe(
      true,
    );
    expect(tenantBResult.contextPackage.entities.every((entity) => entity.tenantId === TENANT_B)).toBe(
      true,
    );
    expect(tenantAResult.contextPackage.entities.some((entity) => entity.id === tenantBEntityId)).toBe(
      false,
    );
    expect(tenantBResult.contextPackage.entities.some((entity) => entity.id === tenantAEntityId)).toBe(
      false,
    );
  });

  it("preserves tenant isolation when ERR-2 semantic embedding is unavailable", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const tenantBEntityId = `knw_${randomUUID()}`;

    await repository.create(
      TENANT_B,
      createKnowledgeEntity(TENANT_B, BRAND_B, {
        id: tenantBEntityId,
        entityType: "brand.profile",
        title: "gate13 err2 tenant B keyword",
        content: { note: "err2 tenant B keyword guidance" },
      }),
    );

    const { service } = createInMemoryRetrievalService(repository, unavailableEmbeddingProvider);
    const tenantACtx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_a",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
    });

    const result = await service.preflight(tenantACtx, {
      taskType: "content_generation",
      query: "gate13 err2 tenant B keyword",
    });

    expect(result.contextPackage.entities.some((entity) => entity.id === tenantBEntityId)).toBe(
      false,
    );
    expect(result.contextPackage.entities.every((entity) => entity.tenantId === TENANT_A)).toBe(
      true,
    );
  });
});

describe.skipIf(!AURORA_LIVE_POSTGRES)("knowledgeRbac — live PostgreSQL", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;
  let stack: ReturnType<typeof createPostgresKnowledgeRetrievalStack> | undefined;
  let tenantAValidatedId: string;
  let tenantAProvisionalId: string;
  let tenantBEntityId: string;

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
      stack = createPostgresKnowledgeRetrievalStack(harness);

      tenantAValidatedId = `knw_${randomUUID()}`;
      tenantAProvisionalId = `knw_${randomUUID()}`;
      tenantBEntityId = `knw_${randomUUID()}`;

      await stack.knowledgeRepository.create(
        harness.tenantAId,
        createKnowledgeEntity(harness.tenantAId, harness.brandAId, {
          id: tenantAValidatedId,
          entityType: "brand.profile",
          status: "validated",
          title: "gate13 live validated brand voice",
          content: { note: "validated brand voice guidance live" },
        }),
      );
      await stack.knowledgeRepository.create(
        harness.tenantAId,
        createKnowledgeEntity(harness.tenantAId, harness.brandAId, {
          id: tenantAProvisionalId,
          entityType: "brand.profile",
          status: "provisional",
          title: "gate13 live provisional brand voice",
          content: { note: "provisional brand voice guidance live" },
        }),
      );
      await stack.knowledgeRepository.create(
        harness.tenantBId,
        createKnowledgeEntity(harness.tenantBId, harness.brandBId, {
          id: tenantBEntityId,
          entityType: "brand.profile",
          status: "validated",
          title: "gate13 live tenant B brand voice",
          content: { note: "tenant B brand voice guidance live" },
        }),
      );

      const adminCtx = createHarnessContext(harness, "A", { roles: ["aurora.admin"] });
      await stack.embeddingService.indexEntity(adminCtx, tenantAValidatedId);
      await stack.embeddingService.indexEntity(adminCtx, tenantAProvisionalId);
      await stack.embeddingService.indexEntity(
        createHarnessContext(harness, "B", { roles: ["aurora.admin"] }),
        tenantBEntityId,
      );
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping knowledgeRbac live suite:", error);
    }
  });

  afterAll(async () => {
    if (harness && postgresAvailable) {
      await cleanupPostgresTestHarness(harness);
    }
  });

  it("runs only when live PostgreSQL is reachable", () => {
    expect(postgresAvailable).toBe(true);
  });

  it("scopes live retrieval preflight to tenant A entities only", async () => {
    const tenantACtx = createHarnessContext(harness!, "A", {
      roles: ["aurora.admin"],
    });

    const result = await stack!.retrievalService.preflight(tenantACtx, {
      taskType: "content_generation",
      query: "gate13 live brand voice",
    });

    expect(result.contextPackage.entities.every((entity) => entity.tenantId === harness!.tenantAId)).toBe(
      true,
    );
    expect(result.contextPackage.entities.some((entity) => entity.id === tenantBEntityId)).toBe(
      false,
    );
  });

  it("enforces viewer validated-only floor through live preflight", async () => {
    const viewerCtx = createHarnessContext(harness!, "A", {
      roles: ["aurora.viewer"],
      auroraPermissions: [...VIEWER_KNOWLEDGE_PERMISSIONS],
    });

    const result = await stack!.retrievalService.preflight(viewerCtx, {
      taskType: "content_generation",
      query: "gate13 live brand voice",
      validatedOnly: false,
      includeProvisional: true,
    });

    const returnedIds = result.contextPackage.entities.map((entity) => entity.id);
    expect(returnedIds).not.toContain(tenantAProvisionalId);
    expect(returnedIds).toContain(tenantAValidatedId);
  });
});

describe("knowledgeRbac availability marker", () => {
  it("reports whether live PostgreSQL verification is configured", () => {
    if (!AURORA_LIVE_POSTGRES) {
      expect(process.env.AURORA_LIVE_POSTGRES).not.toBe("1");
    } else {
      expect(process.env.ORION_DATABASE_URL).toBeTruthy();
      expect(process.env.AURORA_APP_DATABASE_URL).toBeTruthy();
    }
  });
});
