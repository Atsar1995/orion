import { describe, expect, it, vi } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  EMBEDDING_VECTOR_DIMENSION,
  InMemoryEmbeddingRepository,
  InMemoryKnowledgeRepository,
  KnowledgeEntityNotFoundError,
  KnowledgeInvalidEmbeddingVectorError,
} from "@/lib/aurora/knowledge/repositories";
import {
  chunkEmbeddingText,
  DefaultEmbeddingService,
  DeterministicEmbeddingProvider,
  EmbeddingInvalidInputError,
  EmbeddingProviderUnavailableError,
  hashEmbeddingChunkContent,
  type EmbeddingProvider,
} from "@/lib/aurora/knowledge/services";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { AURORA_ERR_0403, AuroraError } from "@/lib/aurora/errors/AuroraError";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const TENANT_B = "660e8400-e29b-41d4-a716-446655440002";
const ENTITY_ID = "knw_550e8400-e29b-41d4-a716-446655440000";

function createEntity(
  tenantId: string,
  overrides: Partial<KnowledgeEntity> & Pick<KnowledgeEntity, "id" | "entityType">,
): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get(overrides.entityType);
  if (!definition?.domain) {
    throw new Error(`Unknown entity type: ${overrides.entityType}`);
  }

  return {
    tenantId,
    brandId: "770e8400-e29b-41d4-a716-446655440003",
    domain: definition.domain,
    status: "validated",
    classification: "internal",
    title: "Test entity",
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

function createContext(tenantId: string) {
  return createTestAuroraRuntimeContext({
    tenantId,
    userId: "usr_test",
  });
}

function createService(
  provider: EmbeddingProvider = new DeterministicEmbeddingProvider(),
  knowledgeRepository = new InMemoryKnowledgeRepository(),
  embeddingRepository = new InMemoryEmbeddingRepository(),
) {
  return {
    service: new DefaultEmbeddingService(
      provider,
      embeddingRepository,
      knowledgeRepository,
      new DefaultAuroraAuthorizationService(),
    ),
    knowledgeRepository,
    embeddingRepository,
  };
}

function createReadOnlyKnowledgeContext(
  role: "aurora.viewer" | "aurora.approver" | "aurora.editor",
) {
  return createTestAuroraRuntimeContext({
    tenantId: TENANT_A,
    userId: `usr_${role}`,
    roles: [role],
    auroraPermissions: ["aurora.knowledge.read"],
  });
}

describe("EmbeddingService", () => {
  it("delegates embedQuery to the provider without persisting", async () => {
    const provider = new DeterministicEmbeddingProvider();
    const embedSpy = vi.spyOn(provider, "embed");
    const { service, embeddingRepository } = createService(provider);
    const ctx = createReadOnlyKnowledgeContext("aurora.viewer");

    const vector = await service.embedQuery(ctx, "brand voice guidelines");
    expect(vector).toHaveLength(EMBEDDING_VECTOR_DIMENSION);
    expect(embedSpy).toHaveBeenCalledWith("brand voice guidelines");
    await expect(embeddingRepository.listByEntity(TENANT_A, ENTITY_ID)).resolves.toEqual([]);
  });

  it("allows viewer with aurora.knowledge.read to call embedQuery", async () => {
    const { service } = createService();
    const vector = await service.embedQuery(
      createReadOnlyKnowledgeContext("aurora.viewer"),
      "viewer query",
    );
    expect(vector).toHaveLength(EMBEDDING_VECTOR_DIMENSION);
  });

  it("allows approver with aurora.knowledge.read to call embedQuery", async () => {
    const { service } = createService();
    const vector = await service.embedQuery(
      createReadOnlyKnowledgeContext("aurora.approver"),
      "approver query",
    );
    expect(vector).toHaveLength(EMBEDDING_VECTOR_DIMENSION);
  });

  it("allows analyst-equivalent read role to call embedQuery", async () => {
    const { service } = createService();
    const vector = await service.embedQuery(
      createReadOnlyKnowledgeContext("aurora.editor"),
      "analyst query",
    );
    expect(vector).toHaveLength(EMBEDDING_VECTOR_DIMENSION);
  });

  it("rejects embedQuery without aurora.knowledge.read", async () => {
    const { service } = createService();
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_no_read",
      roles: ["aurora.viewer"],
      auroraPermissions: ["aurora.content.read"],
    });

    await expect(service.embedQuery(ctx, "blocked query")).rejects.toMatchObject({
      code: AURORA_ERR_0403,
      statusCode: 403,
    });
  });

  it("does not require aurora.knowledge.write for embedQuery", async () => {
    const { service } = createService();
    const ctx = createReadOnlyKnowledgeContext("aurora.viewer");

    await expect(service.embedQuery(ctx, "read-only query")).resolves.toHaveLength(
      EMBEDDING_VECTOR_DIMENSION,
    );
  });

  it("surfaces provider failure from embedQuery for ERR-2 keyword degradation", async () => {
    const failingProvider: EmbeddingProvider = {
      embed: async () => {
        throw new Error("provider unavailable");
      },
      embedBatch: async () => {
        throw new Error("provider unavailable");
      },
    };
    const { service } = createService(failingProvider);
    const ctx = createReadOnlyKnowledgeContext("aurora.viewer");

    await expect(service.embedQuery(ctx, "provider down")).rejects.toMatchObject({
      name: "EmbeddingProviderUnavailableError",
      degradeToKeywordSearch: true,
    });
  });

  it("rejects invalid provider vectors from embedQuery", async () => {
    const invalidProvider: EmbeddingProvider = {
      embed: async () => [0.1, 0.2],
      embedBatch: async () => [[0.1, 0.2]],
    };
    const { service } = createService(invalidProvider);
    const ctx = createReadOnlyKnowledgeContext("aurora.viewer");

    await expect(service.embedQuery(ctx, "invalid vector")).rejects.toBeInstanceOf(
      KnowledgeInvalidEmbeddingVectorError,
    );
  });

  it("delegates embed to the provider", async () => {
    const provider = new DeterministicEmbeddingProvider();
    const embedSpy = vi.spyOn(provider, "embed");
    const { service } = createService(provider);
    const ctx = createContext(TENANT_A);

    const vector = await service.embed(ctx, "brand voice guidelines");
    expect(vector).toHaveLength(EMBEDDING_VECTOR_DIMENSION);
    expect(embedSpy).toHaveBeenCalledWith("brand voice guidelines", undefined);
  });

  it("preserves embedBatch ordering", async () => {
    const { service } = createService();
    const ctx = createContext(TENANT_A);
    const vectors = await service.embedBatch(ctx, ["alpha text", "beta text"]);

    expect(vectors).toHaveLength(2);
    expect(vectors[0]).not.toEqual(vectors[1]);
  });

  it("rejects invalid provider vectors", async () => {
    const invalidProvider: EmbeddingProvider = {
      embed: async () => [0.1, 0.2],
      embedBatch: async () => [[0.1, 0.2]],
    };
    const { service } = createService(invalidProvider);
    const ctx = createContext(TENANT_A);

    await expect(service.embed(ctx, "invalid vector")).rejects.toBeInstanceOf(
      KnowledgeInvalidEmbeddingVectorError,
    );
  });

  it("surfaces provider failure for ERR-2 keyword degradation", async () => {
    const failingProvider: EmbeddingProvider = {
      embed: async () => {
        throw new Error("provider unavailable");
      },
      embedBatch: async () => {
        throw new Error("provider unavailable");
      },
    };
    const { service } = createService(failingProvider);
    const ctx = createContext(TENANT_A);

    await expect(service.embed(ctx, "provider down")).rejects.toMatchObject({
      name: "EmbeddingProviderUnavailableError",
      degradeToKeywordSearch: true,
    });
  });

  it("indexes entity embeddings through the repository", async () => {
    const { service, knowledgeRepository, embeddingRepository } = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
      title: "Brand profile",
      content: { voice: "professional" },
    });
    await knowledgeRepository.create(TENANT_A, entity);

    const result = await service.indexEntity(ctx, ENTITY_ID);
    expect(result.chunksIndexed).toBeGreaterThan(0);
    await expect(embeddingRepository.listByEntity(TENANT_A, ENTITY_ID)).resolves.toHaveLength(
      result.chunksIndexed,
    );
  });

  it("uses deterministic 512-word chunking approximation", () => {
    const words = Array.from({ length: 600 }, (_, index) => `word${index}`);
    const chunks = chunkEmbeddingText(words.join(" "));
    expect(chunks).toHaveLength(2);
    expect(chunks[0]?.split(/\s+/)).toHaveLength(512);
    expect(chunks[1]?.split(/\s+/)).toHaveLength(88);
  });

  it("uses deterministic SHA-256 content hashes", () => {
    const hashA = hashEmbeddingChunkContent("stable chunk text");
    const hashB = hashEmbeddingChunkContent("stable chunk text");
    const hashC = hashEmbeddingChunkContent("different chunk text");

    expect(hashA).toBe(hashB);
    expect(hashA).not.toBe(hashC);
  });

  it("skips unchanged chunks on repeated indexing", async () => {
    const { service, knowledgeRepository } = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
      title: "Stable profile",
    });
    await knowledgeRepository.create(TENANT_A, entity);

    const first = await service.indexEntity(ctx, ENTITY_ID);
    const second = await service.indexEntity(ctx, ENTITY_ID);

    expect(first.chunksIndexed).toBeGreaterThan(0);
    expect(second.chunksIndexed).toBe(0);
    expect(second.chunksSkipped).toBe(first.chunksIndexed);
  });

  it("removes embeddings from the index", async () => {
    const { service, knowledgeRepository, embeddingRepository } = createService();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });
    await knowledgeRepository.create(TENANT_A, entity);
    await service.indexEntity(ctx, ENTITY_ID);

    await expect(service.removeFromIndex(ctx, ENTITY_ID)).resolves.toBeGreaterThan(0);
    await expect(embeddingRepository.listByEntity(TENANT_A, ENTITY_ID)).resolves.toEqual([]);
  });

  it("delegates semanticSearch to the embedding repository", async () => {
    const embeddingRepository = new InMemoryEmbeddingRepository();
    const searchSpy = vi.spyOn(embeddingRepository, "searchSimilar");
    const { service } = createService(new DeterministicEmbeddingProvider(), new InMemoryKnowledgeRepository(), embeddingRepository);
    const ctx = createContext(TENANT_A);
    const query = await service.embedQuery(ctx, "semantic query text");

    await service.semanticSearch(ctx, query, { topK: 3, minSimilarity: 0.5 });
    expect(searchSpy).toHaveBeenCalledWith(TENANT_A, query, { topK: 3, minSimilarity: 0.5 });
  });

  it("enforces tenant isolation on indexing and removal", async () => {
    const { service, knowledgeRepository } = createService();
    const tenantACtx = createContext(TENANT_A);
    const tenantBCtx = createContext(TENANT_B);
    const entity = createEntity(TENANT_A, {
      id: ENTITY_ID,
      entityType: "brand.profile",
    });
    await knowledgeRepository.create(TENANT_A, entity);
    await service.indexEntity(tenantACtx, ENTITY_ID);

    await expect(service.removeFromIndex(tenantBCtx, ENTITY_ID)).rejects.toBeInstanceOf(
      KnowledgeEntityNotFoundError,
    );
  });

  it("rejects unauthorized embedding writes while allowing read-only embedQuery", async () => {
    const { service } = createService();
    const ctx = createReadOnlyKnowledgeContext("aurora.viewer");

    await expect(service.embed(ctx, "blocked")).rejects.toBeInstanceOf(AuroraError);
    await expect(service.indexEntity(ctx, ENTITY_ID)).rejects.toBeInstanceOf(AuroraError);
    await expect(service.embedQuery(ctx, "allowed query")).resolves.toHaveLength(
      EMBEDDING_VECTOR_DIMENSION,
    );
  });

  it("reindexes all tenant entities", async () => {
    const { service, knowledgeRepository } = createService();
    const ctx = createContext(TENANT_A);
    await knowledgeRepository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_ID,
        entityType: "brand.profile",
      }),
    );
    await knowledgeRepository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: "knw_660e8400-e29b-41d4-a716-446655440001",
        entityType: "campaign.record",
      }),
    );

    const result = await service.reindexTenant(ctx);
    expect(result.indexed).toBeGreaterThan(0);
    expect(result.failed).toBe(0);
  });

  it("rejects empty embedQuery input", async () => {
    const { service } = createService();
    const ctx = createReadOnlyKnowledgeContext("aurora.viewer");
    await expect(service.embedQuery(ctx, "   ")).rejects.toBeInstanceOf(EmbeddingInvalidInputError);
  });

  it("requires tenant context for embedQuery", async () => {
    const { service } = createService();
    const ctx = createTestAuroraRuntimeContext({
      tenantId: "",
      userId: "usr_test",
      auroraPermissions: ["aurora.knowledge.read"],
    });

    await expect(service.embedQuery(ctx, "missing tenant")).rejects.toBeInstanceOf(
      KnowledgeInvalidTenantContextError,
    );
  });

  it("rejects empty embedding input", async () => {
    const { service } = createService();
    const ctx = createContext(TENANT_A);
    await expect(service.embed(ctx, "   ")).rejects.toBeInstanceOf(EmbeddingInvalidInputError);
  });

  it("requires tenant context", async () => {
    const { service } = createService();
    const ctx = createTestAuroraRuntimeContext({
      tenantId: "",
      userId: "usr_test",
    });

    await expect(service.embed(ctx, "missing tenant")).rejects.toBeInstanceOf(
      KnowledgeInvalidTenantContextError,
    );
  });
});

describe("EmbeddingProvider", () => {
  it("exposes an unavailable production stub", async () => {
    const { UnavailableEmbeddingProvider } = await import(
      "@/lib/aurora/knowledge/services/EmbeddingProvider"
    );
    const provider = new UnavailableEmbeddingProvider();

    await expect(provider.embed("text")).rejects.toBeInstanceOf(
      EmbeddingProviderUnavailableError,
    );
  });
});
