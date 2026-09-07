import { randomUUID } from "node:crypto";
import type { EmbeddingProvider } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import { EmbeddingProviderUnavailableError } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import {
  RETRIEVAL_CONFIDENCE_LEVELS,
  RETRIEVAL_MAX_CONTEXT_TOKENS,
  type RetrievalRequest,
  type RetrievalResult,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import { AURORA_ERR_0403 } from "@/lib/aurora/errors/AuroraError";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
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
  createInMemoryKnowledgeRetrievalStack,
  createKnowledgeEntity,
  createPostgresKnowledgeRetrievalStack,
  type InMemoryKnowledgeRetrievalStack,
} from "@/tests/aurora/helpers/knowledgeSecurityFixtures";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const TENANT_B = "550e8400-e29b-41d4-a716-446655440002";
const BRAND_A = "770e8400-e29b-41d4-a716-446655440003";
const BRAND_B = "880e8400-e29b-41d4-a716-446655440004";

const unavailableEmbeddingProvider: EmbeddingProvider = {
  embed: async () => {
    throw new EmbeddingProviderUnavailableError("Embedding unavailable for Gate 16 ERR-2 test");
  },
  embedBatch: async () => {
    throw new EmbeddingProviderUnavailableError("Embedding unavailable for Gate 16 ERR-2 test");
  },
};

function adminCtx(overrides: Partial<AuroraRuntimeContext> = {}): AuroraRuntimeContext {
  return createTestAuroraRuntimeContext({
    tenantId: TENANT_A,
    userId: "usr_admin",
    brandId: BRAND_A,
    roles: ["aurora.admin"],
    auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    ...overrides,
  });
}

function viewerCtx(overrides: Partial<AuroraRuntimeContext> = {}): AuroraRuntimeContext {
  return createTestAuroraRuntimeContext({
    tenantId: TENANT_A,
    userId: "usr_viewer",
    brandId: BRAND_A,
    roles: ["aurora.viewer"],
    auroraPermissions: [...VIEWER_KNOWLEDGE_PERMISSIONS],
    ...overrides,
  });
}

function approverCtx(overrides: Partial<AuroraRuntimeContext> = {}): AuroraRuntimeContext {
  return createTestAuroraRuntimeContext({
    tenantId: TENANT_A,
    userId: "usr_approver",
    brandId: BRAND_A,
    roles: ["aurora.approver"],
    auroraPermissions: [...APPROVER_KNOWLEDGE_PERMISSIONS],
    ...overrides,
  });
}

function directorCtx(overrides: Partial<AuroraRuntimeContext> = {}): AuroraRuntimeContext {
  return createTestAuroraRuntimeContext({
    tenantId: TENANT_A,
    userId: "usr_director",
    brandId: BRAND_A,
    roles: ["aurora.director"],
    auroraPermissions: ["aurora.knowledge.read"],
    ...overrides,
  });
}

function defaultRequest(overrides: Partial<RetrievalRequest> = {}): RetrievalRequest {
  return {
    taskType: "content_generation",
    query: "gate16 retrieval pipeline voice",
    ...overrides,
  };
}

function assertRetrievalResultStructure(result: RetrievalResult): void {
  expect(RETRIEVAL_CONFIDENCE_LEVELS).toContain(result.confidence);
  expect(result.contextPackage.maxTokens).toBeLessThanOrEqual(RETRIEVAL_MAX_CONTEXT_TOKENS);
  expect(result.contextPackage.totalTokens).toBeLessThanOrEqual(result.contextPackage.maxTokens);
  expect(typeof result.contextPackage.assembledAt).toBe("string");
  expect(Array.isArray(result.contextPackage.layers)).toBe(true);
  expect(Array.isArray(result.contextPackage.entities)).toBe(true);
  expect(Array.isArray(result.citations)).toBe(true);
  expect(Array.isArray(result.gaps)).toBe(true);
  expect(typeof result.latencyMs).toBe("number");
  expect(result.latencyMs).toBeGreaterThanOrEqual(0);
}

function assertCitationAttachment(result: RetrievalResult): void {
  const contextEntityIds = new Set(result.contextPackage.entities.map((entity) => entity.id));

  expect(result.citations.every((citation) => contextEntityIds.has(citation.entityId))).toBe(true);
  expect(
    result.citations.every((citation) => citation.retrievedAt === result.contextPackage.assembledAt),
  ).toBe(true);

  for (const citation of result.citations) {
    const entity = result.contextPackage.entities.find((entry) => entry.id === citation.entityId);
    expect(entity).toBeDefined();
    expect(citation.domain).toBe(entity?.domain);
    expect(citation.entityType).toBe(entity?.entityType);
    expect(citation.title).toBe(entity?.title);
    expect(citation.sourceType).toBe(entity?.sourceType);
    expect(citation.confidence).toBeGreaterThanOrEqual(0);
    expect(citation.confidence).toBeLessThanOrEqual(1);
  }
}

function assertDeterministicCitationOrder(first: RetrievalResult, second: RetrievalResult): void {
  expect(first.citations.map((citation) => citation.entityId)).toEqual(
    second.citations.map((citation) => citation.entityId),
  );
}

function withoutLatency(result: RetrievalResult): Omit<RetrievalResult, "latencyMs"> {
  const { latencyMs: _latencyMs, ...rest } = result;
  return rest;
}

async function seedValidatedBrandProfile(
  repository: InMemoryKnowledgeRepository,
  tenantId: string,
  brandId: string,
  title: string,
  id = `knw_${randomUUID()}`,
): Promise<string> {
  await repository.create(
    tenantId,
    createKnowledgeEntity(tenantId, brandId, {
      id,
      entityType: "brand.profile",
      status: "validated",
      title,
      content: { note: `${title} guidance` },
    }),
  );
  return id;
}

describe("retrievalPipeline — in-memory integration", () => {
  describe("1. happy path", () => {
    it("returns a structurally valid non-empty RetrievalResult from preflight", async () => {
      const repository = new InMemoryKnowledgeRepository();
      const entityId = await seedValidatedBrandProfile(
        repository,
        TENANT_A,
        BRAND_A,
        "gate16 happy path validated voice",
      );

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const result = await stack.retrievalService.preflight(
        adminCtx(),
        defaultRequest({ query: "gate16 happy path validated voice" }),
      );

      assertRetrievalResultStructure(result);
      expect(result.contextPackage.entities.length).toBeGreaterThan(0);
      expect(result.contextPackage.entities.some((entity) => entity.id === entityId)).toBe(true);
      expect(result.citations.length).toBeGreaterThan(0);
    });
  });

  describe("2. pipeline completeness", () => {
    it("flows cache miss through embed, hybrid search, scoring, assembly, citations, and cache write", async () => {
      const repository = new InMemoryKnowledgeRepository();
      await seedValidatedBrandProfile(
        repository,
        TENANT_A,
        BRAND_A,
        "gate16 pipeline completeness voice",
      );

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const embedSpy = vi.spyOn(stack.embeddingService, "embedQuery");
      const searchSpy = vi.spyOn(stack.hybridSearchEngine, "search");
      const request = defaultRequest({ query: "gate16 pipeline completeness voice" });

      const first = await stack.retrievalService.preflight(adminCtx(), request);

      expect(embedSpy).toHaveBeenCalledTimes(1);
      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(first.citations.length).toBeGreaterThan(0);
      assertCitationAttachment(first);

      embedSpy.mockClear();
      searchSpy.mockClear();

      const second = await stack.retrievalService.preflight(adminCtx(), request);

      expect(embedSpy).not.toHaveBeenCalled();
      expect(searchSpy).not.toHaveBeenCalled();
      expect(withoutLatency(second)).toEqual(withoutLatency(first));
    });
  });

  describe("3. insufficient retrieval", () => {
    it("returns insufficient confidence with gaps and no fabricated entities when repository is empty", async () => {
      const stack = createInMemoryKnowledgeRetrievalStack(new InMemoryKnowledgeRepository());
      const result = await stack.retrievalService.preflight(
        adminCtx(),
        defaultRequest({ query: "gate16 no matching knowledge" }),
      );

      assertRetrievalResultStructure(result);
      expect(result.confidence).toBe("insufficient");
      expect(result.gaps.length).toBeGreaterThan(0);
      expect(result.contextPackage.entities).toEqual([]);
      expect(result.citations).toEqual([]);
    });
  });

  describe("4. tenant isolation", () => {
    it("returns only tenant-scoped entities and citations for each tenant context", async () => {
      const repository = new InMemoryKnowledgeRepository();
      const tenantAEntityId = await seedValidatedBrandProfile(
        repository,
        TENANT_A,
        BRAND_A,
        "gate16 tenant A isolated voice",
      );
      const tenantBEntityId = await seedValidatedBrandProfile(
        repository,
        TENANT_B,
        BRAND_B,
        "gate16 tenant B isolated voice",
      );

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const tenantACtx = adminCtx({ tenantId: TENANT_A, brandId: BRAND_A, userId: "usr_a" });
      const tenantBCtx = adminCtx({ tenantId: TENANT_B, brandId: BRAND_B, userId: "usr_b" });

      const tenantAResult = await stack.retrievalService.preflight(
        tenantACtx,
        defaultRequest({ query: "gate16 tenant A isolated voice" }),
      );
      const tenantBResult = await stack.retrievalService.preflight(
        tenantBCtx,
        defaultRequest({ query: "gate16 tenant B isolated voice" }),
      );

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
      expect(tenantAResult.citations.every((citation) => citation.entityId !== tenantBEntityId)).toBe(
        true,
      );
      expect(tenantBResult.citations.every((citation) => citation.entityId !== tenantAEntityId)).toBe(
        true,
      );
    });
  });

  describe("5. RBAC", () => {
    it("rejects preflight without aurora.knowledge.read before retrieval", async () => {
      const repository = new InMemoryKnowledgeRepository();
      await seedValidatedBrandProfile(repository, TENANT_A, BRAND_A, "gate16 rbac protected voice");

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const ctx = createTestAuroraRuntimeContext({
        tenantId: TENANT_A,
        userId: "usr_no_knowledge",
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
        stack.retrievalService.preflight(ctx, defaultRequest({ query: "gate16 rbac protected voice" })),
      ).rejects.toMatchObject({ code: AURORA_ERR_0403, statusCode: 403 });
    });
  });

  describe("6. validated-only", () => {
    it("excludes provisional knowledge from viewer context even when includeProvisional is requested", async () => {
      const repository = new InMemoryKnowledgeRepository();
      const validatedId = await seedValidatedBrandProfile(
        repository,
        TENANT_A,
        BRAND_A,
        "gate16 viewer validated voice",
      );
      const provisionalId = `knw_${randomUUID()}`;
      await repository.create(
        TENANT_A,
        createKnowledgeEntity(TENANT_A, BRAND_A, {
          id: provisionalId,
          entityType: "brand.profile",
          status: "provisional",
          title: "gate16 viewer provisional voice",
          content: { note: "provisional viewer guidance" },
        }),
      );

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const result = await stack.retrievalService.preflight(
        viewerCtx(),
        defaultRequest({
          query: "gate16 viewer voice",
          validatedOnly: false,
          includeProvisional: true,
        }),
      );

      const returnedIds = result.contextPackage.entities.map((entity) => entity.id);
      expect(returnedIds).toContain(validatedId);
      expect(returnedIds).not.toContain(provisionalId);
      expect(result.citations.every((citation) => citation.entityId !== provisionalId)).toBe(true);
    });

    it("excludes provisional knowledge from approver context", async () => {
      const repository = new InMemoryKnowledgeRepository();
      const provisionalId = `knw_${randomUUID()}`;
      await repository.create(
        TENANT_A,
        createKnowledgeEntity(TENANT_A, BRAND_A, {
          id: provisionalId,
          entityType: "brand.profile",
          status: "provisional",
          title: "gate16 approver provisional voice",
          content: { note: "provisional approver guidance" },
        }),
      );

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const result = await stack.retrievalService.preflight(
        approverCtx(),
        defaultRequest({
          query: "gate16 approver provisional voice",
          includeProvisional: true,
        }),
      );

      expect(result.contextPackage.entities.some((entity) => entity.id === provisionalId)).toBe(false);
      expect(result.citations.some((citation) => citation.entityId === provisionalId)).toBe(false);
    });

    it("allows admin to retrieve provisional knowledge when explicitly permitted", async () => {
      const repository = new InMemoryKnowledgeRepository();
      const provisionalId = `knw_${randomUUID()}`;
      await repository.create(
        TENANT_A,
        createKnowledgeEntity(TENANT_A, BRAND_A, {
          id: provisionalId,
          entityType: "brand.profile",
          status: "provisional",
          title: "gate16 admin provisional voice",
          content: { note: "admin provisional guidance" },
        }),
      );

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const result = await stack.retrievalService.preflight(
        adminCtx(),
        defaultRequest({
          query: "gate16 admin provisional voice",
          includeProvisional: true,
        }),
      );

      expect(result.contextPackage.entities.some((entity) => entity.id === provisionalId)).toBe(true);
      expect(result.citations.some((citation) => citation.entityId === provisionalId)).toBe(true);
    });
  });

  describe("7. classification", () => {
    it("excludes restricted entities for non-admin and allows admin per existing contract", async () => {
      const repository = new InMemoryKnowledgeRepository();
      const restrictedId = `knw_${randomUUID()}`;
      await repository.create(
        TENANT_A,
        createKnowledgeEntity(TENANT_A, BRAND_A, {
          id: restrictedId,
          entityType: "brand.profile",
          status: "validated",
          classification: "restricted",
          title: "gate16 restricted classification voice",
          content: { note: "restricted classification guidance" },
        }),
      );

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const request = defaultRequest({ query: "gate16 restricted classification voice" });

      const directorResult = await stack.retrievalService.preflight(directorCtx(), request);
      const adminResult = await stack.retrievalService.preflight(adminCtx(), request);

      expect(directorResult.contextPackage.entities.some((entity) => entity.id === restrictedId)).toBe(
        false,
      );
      expect(directorResult.citations.some((citation) => citation.entityId === restrictedId)).toBe(false);
      expect(adminResult.contextPackage.entities.some((entity) => entity.id === restrictedId)).toBe(true);
      expect(adminResult.citations.some((citation) => citation.entityId === restrictedId)).toBe(true);
    });
  });

  describe("8. cache miss", () => {
    it("executes hybrid retrieval and populates cache on first identical preflight", async () => {
      const repository = new InMemoryKnowledgeRepository();
      await seedValidatedBrandProfile(repository, TENANT_A, BRAND_A, "gate16 cache miss voice");

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const searchSpy = vi.spyOn(stack.hybridSearchEngine, "search");
      const request = defaultRequest({ query: "gate16 cache miss voice" });

      const result = await stack.retrievalService.preflight(adminCtx(), request);

      expect(searchSpy).toHaveBeenCalledTimes(1);
      expect(result.citations.length).toBeGreaterThan(0);
    });
  });

  describe("9. cache hit", () => {
    it("returns cached result without re-invoking hybrid search on second identical preflight", async () => {
      const repository = new InMemoryKnowledgeRepository();
      await seedValidatedBrandProfile(repository, TENANT_A, BRAND_A, "gate16 cache hit voice");

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const searchSpy = vi.spyOn(stack.hybridSearchEngine, "search");
      const request = defaultRequest({ query: "gate16 cache hit voice" });
      const ctx = adminCtx();

      const first = await stack.retrievalService.preflight(ctx, request);
      searchSpy.mockClear();

      const second = await stack.retrievalService.preflight(ctx, request);

      expect(searchSpy).not.toHaveBeenCalled();
      expect(withoutLatency(second)).toEqual(withoutLatency(first));
      expect(second.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe("10. admin/viewer cache isolation", () => {
    it("does not serve admin cached provisional/restricted results to viewer", async () => {
      const repository = new InMemoryKnowledgeRepository();
      const validatedId = await seedValidatedBrandProfile(
        repository,
        TENANT_A,
        BRAND_A,
        "gate16 cache isolation validated voice",
      );
      const provisionalId = `knw_${randomUUID()}`;
      await repository.create(
        TENANT_A,
        createKnowledgeEntity(TENANT_A, BRAND_A, {
          id: provisionalId,
          entityType: "brand.profile",
          status: "provisional",
          title: "gate16 cache isolation provisional voice",
          content: { note: "provisional cache isolation guidance" },
        }),
      );

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const request = defaultRequest({
        query: "gate16 cache isolation voice",
        includeProvisional: true,
      });

      const adminResult = await stack.retrievalService.preflight(adminCtx(), request);
      expect(adminResult.contextPackage.entities.map((entity) => entity.id)).toEqual(
        expect.arrayContaining([validatedId, provisionalId]),
      );

      const viewerResult = await stack.retrievalService.preflight(viewerCtx(), request);

      expect(viewerResult.contextPackage.entities.map((entity) => entity.id)).toContain(validatedId);
      expect(viewerResult.contextPackage.entities.map((entity) => entity.id)).not.toContain(provisionalId);
      expect(viewerResult.citations.every((citation) => citation.entityId !== provisionalId)).toBe(true);
    });
  });

  describe("11. write → invalidate → fresh retrieval", () => {
    it("reflects KnowledgeService.updateEntity changes after cache population", async () => {
      const repository = new InMemoryKnowledgeRepository();
      const entityId = await seedValidatedBrandProfile(
        repository,
        TENANT_A,
        BRAND_A,
        "Original gate16 write invalidate voice",
      );
      const entity = (await repository.getById(TENANT_A, entityId))!;

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const ctx = adminCtx();
      const request = defaultRequest({ query: "gate16 write invalidate voice" });

      const first = await stack.retrievalService.preflight(ctx, request);
      const cached = await stack.retrievalService.preflight(ctx, request);

      expect(first.contextPackage.entities.some((entry) => entry.title.includes("Original"))).toBe(true);
      expect(cached.contextPackage.entities.some((entry) => entry.title.includes("Original"))).toBe(true);

      await stack.knowledgeService.updateEntity(ctx, entityId, {
        entity: {
          ...entity,
          title: "Updated gate16 write invalidate voice",
          content: { note: "updated write invalidate guidance" },
          version: 2,
          updatedAt: "2026-09-06T00:00:00.000Z",
        },
        changedBy: "usr_admin",
      });

      const refreshed = await stack.retrievalService.preflight(ctx, request);

      expect(
        refreshed.contextPackage.entities.some((entry) => entry.title === "Updated gate16 write invalidate voice"),
      ).toBe(true);
      expect(
        refreshed.citations.some((citation) => citation.title === "Updated gate16 write invalidate voice"),
      ).toBe(true);
    });
  });

  describe("12. ERR-2 semantic degradation", () => {
    it("succeeds via keyword retrieval, preserves authorization, and does not cache degraded results", async () => {
      const repository = new InMemoryKnowledgeRepository();
      const validatedId = await seedValidatedBrandProfile(
        repository,
        TENANT_A,
        BRAND_A,
        "gate16 err2 keyword voice",
      );

      const stack = createInMemoryKnowledgeRetrievalStack(repository, unavailableEmbeddingProvider);
      const searchSpy = vi.spyOn(stack.hybridSearchEngine, "search");
      const ctx = viewerCtx();
      const request = defaultRequest({ query: "gate16 err2 keyword voice" });

      const first = await stack.retrievalService.preflight(ctx, request);
      await stack.retrievalService.preflight(ctx, request);

      expect(first.contextPackage.entities.some((entity) => entity.id === validatedId)).toBe(true);
      expect(first.citations.some((citation) => citation.entityId === validatedId)).toBe(true);
      expect(searchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("13. ERR-3 memory degradation", () => {
    it("completes preflight without fabricated memory-only entities", async () => {
      const repository = new InMemoryKnowledgeRepository();
      const validatedId = await seedValidatedBrandProfile(
        repository,
        TENANT_A,
        BRAND_A,
        "gate16 err3 memory stub voice",
      );

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const result = await stack.retrievalService.preflight(
        adminCtx(),
        defaultRequest({ query: "gate16 err3 memory stub voice" }),
      );

      assertRetrievalResultStructure(result);
      expect(result.contextPackage.entities.every((entity) => entity.tenantId === TENANT_A)).toBe(true);

      for (const citation of result.citations) {
        const stored = await repository.getById(TENANT_A, citation.entityId);
        expect(stored).toBeDefined();
      }

      if (result.citations.length > 0) {
        expect(result.citations.some((citation) => citation.entityId === validatedId)).toBe(true);
      }
    });
  });

  describe("14. citation attachment", () => {
    it("keeps citations aligned with context entities and CitationBuilder contract", async () => {
      const repository = new InMemoryKnowledgeRepository();
      await seedValidatedBrandProfile(repository, TENANT_A, BRAND_A, "gate16 citation alpha voice");
      await seedValidatedBrandProfile(repository, TENANT_A, BRAND_A, "gate16 citation beta voice");

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const result = await stack.retrievalService.preflight(
        adminCtx(),
        defaultRequest({ query: "gate16 citation voice" }),
      );

      assertCitationAttachment(result);
      assertDeterministicCitationOrder(result, result);
    });
  });

  describe("15. context / token budget", () => {
    it("keeps assembled context within token budget and tenant scope", async () => {
      const repository = new InMemoryKnowledgeRepository();
      await seedValidatedBrandProfile(repository, TENANT_A, BRAND_A, "gate16 token budget voice");

      const stack = createInMemoryKnowledgeRetrievalStack(repository);
      const result = await stack.retrievalService.preflight(
        adminCtx(),
        defaultRequest({ query: "gate16 token budget voice" }),
      );

      expect(result.contextPackage.maxTokens).toBeLessThanOrEqual(RETRIEVAL_MAX_CONTEXT_TOKENS);
      expect(result.contextPackage.totalTokens).toBeLessThanOrEqual(result.contextPackage.maxTokens);
      expect(result.contextPackage.entities.every((entity) => entity.tenantId === TENANT_A)).toBe(true);
      expect(result.contextPackage.layers.every((layer) => layer.tokenCount <= layer.maxTokens)).toBe(true);
    });
  });

  describe("16. determinism", () => {
    it("returns stable confidence, gaps, context entities, and citation order for equivalent requests", async () => {
      const entityAlphaId = "knw_dddddddd-dddd-4ddd-8ddd-dddddddddddd";
      const entityBetaId = "knw_eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";

      async function runEquivalentPreflight(): Promise<RetrievalResult> {
        const repository = new InMemoryKnowledgeRepository();
        await repository.create(
          TENANT_A,
          createKnowledgeEntity(TENANT_A, BRAND_A, {
            id: entityAlphaId,
            entityType: "brand.profile",
            status: "validated",
            title: "gate16 determinism alpha voice",
            content: { note: "determinism alpha guidance" },
          }),
        );
        await repository.create(
          TENANT_A,
          createKnowledgeEntity(TENANT_A, BRAND_A, {
            id: entityBetaId,
            entityType: "brand.profile",
            status: "validated",
            title: "gate16 determinism beta voice",
            content: { note: "determinism beta guidance" },
          }),
        );

        const stack = createInMemoryKnowledgeRetrievalStack(repository);
        return stack.retrievalService.preflight(
          adminCtx(),
          defaultRequest({ query: "gate16 determinism voice" }),
        );
      }

      const first = await runEquivalentPreflight();
      const second = await runEquivalentPreflight();

      expect(first.confidence).toBe(second.confidence);
      expect(first.gaps).toEqual(second.gaps);
      expect(first.contextPackage.entities.map((entity) => entity.id)).toEqual(
        second.contextPackage.entities.map((entity) => entity.id),
      );
      assertDeterministicCitationOrder(first, second);
    });
  });
});

describe.skipIf(!AURORA_LIVE_POSTGRES)("retrievalPipeline — live PostgreSQL", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;
  let stack: ReturnType<typeof createPostgresKnowledgeRetrievalStack> | undefined;
  let tenantAEntityId: string;
  let tenantBEntityId: string;

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
      stack = createPostgresKnowledgeRetrievalStack(harness);

      tenantAEntityId = `knw_${randomUUID()}`;
      tenantBEntityId = `knw_${randomUUID()}`;

      await stack.knowledgeRepository.create(
        harness.tenantAId,
        createKnowledgeEntity(harness.tenantAId, harness.brandAId, {
          id: tenantAEntityId,
          entityType: "brand.profile",
          status: "validated",
          title: "gate16 live postgres happy path voice",
          content: { note: "live postgres happy path guidance" },
        }),
      );
      await stack.knowledgeRepository.create(
        harness.tenantBId,
        createKnowledgeEntity(harness.tenantBId, harness.brandBId, {
          id: tenantBEntityId,
          entityType: "brand.profile",
          status: "validated",
          title: "gate16 live postgres tenant B voice",
          content: { note: "live postgres tenant B guidance" },
        }),
      );
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping retrievalPipeline live PostgreSQL suite:", error);
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

  it("returns a structurally valid preflight result against PostgreSQL-backed repositories", async () => {
    if (!stack || !harness) {
      throw new Error("PostgreSQL stack was not initialized");
    }

    const result = await stack.retrievalService.preflight(
      createHarnessContext(harness, "A", {
        roles: ["aurora.admin"],
        auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
      }),
      {
        taskType: "content_generation",
        query: "gate16 live postgres happy path voice",
      },
    );

    assertRetrievalResultStructure(result);
    expect(result.contextPackage.entities.some((entity) => entity.id === tenantAEntityId)).toBe(true);
    expect(result.citations.some((citation) => citation.entityId === tenantAEntityId)).toBe(true);
  });

  it("preserves tenant-scoped retrieval under PostgreSQL", async () => {
    if (!stack || !harness) {
      throw new Error("PostgreSQL stack was not initialized");
    }

    const liveHarness = harness;

    const tenantAResult = await stack.retrievalService.preflight(
      createHarnessContext(liveHarness, "A", { roles: ["aurora.admin"] }),
      {
        taskType: "content_generation",
        query: "gate16 live postgres happy path voice",
      },
    );
    const tenantBResult = await stack.retrievalService.preflight(
      createHarnessContext(liveHarness, "B", { roles: ["aurora.admin"] }),
      {
        taskType: "content_generation",
        query: "gate16 live postgres tenant B voice",
      },
    );

    expect(
      tenantAResult.contextPackage.entities.every((entity) => entity.tenantId === liveHarness.tenantAId),
    ).toBe(true);
    expect(
      tenantBResult.contextPackage.entities.every((entity) => entity.tenantId === liveHarness.tenantBId),
    ).toBe(true);
    expect(tenantAResult.contextPackage.entities.some((entity) => entity.id === tenantBEntityId)).toBe(false);
    expect(tenantBResult.contextPackage.entities.some((entity) => entity.id === tenantAEntityId)).toBe(false);
  });
});
