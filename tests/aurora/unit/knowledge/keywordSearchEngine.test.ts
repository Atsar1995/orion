import { describe, expect, it, vi } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  InMemoryKnowledgeRepository,
  KnowledgeKeywordSearchError,
} from "@/lib/aurora/knowledge/repositories";
import {
  DefaultKeywordSearchEngine,
  KeywordInvalidQueryError,
} from "@/lib/aurora/knowledge/retrieval/KeywordSearchEngine";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { AuroraError } from "@/lib/aurora/errors/AuroraError";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const TENANT_B = "660e8400-e29b-41d4-a716-446655440002";
const BRAND_A = "770e8400-e29b-41d4-a716-446655440003";
const BRAND_B = "880e8400-e29b-41d4-a716-446655440004";
const ENTITY_A = "knw_550e8400-e29b-41d4-a716-446655440000";
const ENTITY_B = "knw_660e8400-e29b-41d4-a716-446655440001";
const ENTITY_C = "knw_770e8400-e29b-41d4-a716-446655440002";

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
    brandId: BRAND_A,
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
    brandId: BRAND_A,
  });
}

function createEngine(repository = new InMemoryKnowledgeRepository()) {
  return {
    engine: new DefaultKeywordSearchEngine(repository, new DefaultAuroraAuthorizationService()),
    repository,
  };
}

describe("KeywordSearchEngine", () => {
  it("returns exact keyword title matches with the highest rank", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        title: "Orion Brand Voice",
      }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_B,
        entityType: "campaign.record",
        title: "Campaign notes",
        content: { note: "Orion Brand Voice appears in content only" },
      }),
    );

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion Brand Voice" },
      "Orion Brand Voice",
    );

    expect(result[0]?.entity.id).toBe(ENTITY_A);
    expect(result[0]?.keywordScore).toBeGreaterThan(result[1]?.keywordScore ?? 0);
  });

  it("ranks title matches above content-only matches", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        title: "Orion lexicon",
      }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_B,
        entityType: "campaign.record",
        title: "Campaign record",
        content: { summary: "Orion lexicon details" },
      }),
    );

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion lexicon" },
      "Orion lexicon",
    );

    expect(result.map((entry) => entry.entity.id)).toEqual([ENTITY_A, ENTITY_B]);
    expect(result[0]?.keywordScore).toBeGreaterThan(result[1]?.keywordScore ?? 0);
  });

  it("orders weaker lexical matches below stronger ones", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        title: "Orion alpha beta gamma",
      }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_B,
        entityType: "campaign.record",
        title: "Orion alpha",
      }),
    );

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion alpha beta" },
      "Orion alpha beta",
    );

    expect(result[0]?.entity.id).toBe(ENTITY_A);
    expect(result[0]?.score).toBeGreaterThan(result[1]?.score ?? 0);
  });

  it("respects topK", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: ENTITY_A, entityType: "brand.profile", title: "Orion one" }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: ENTITY_B, entityType: "campaign.record", title: "Orion two" }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: ENTITY_C, entityType: "campaign.record", title: "Orion three" }),
    );

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion", topK: 2 },
      "Orion",
    );

    expect(result).toHaveLength(2);
  });

  it("filters by brandId", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        brandId: BRAND_A,
        title: "Orion brand profile",
      }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_B,
        entityType: "brand.profile",
        brandId: BRAND_B,
        title: "Orion other brand",
      }),
    );

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion", brandId: BRAND_A },
      "Orion",
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.entity.id).toBe(ENTITY_A);
  });

  it("filters by domain", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        title: "Orion brand domain",
      }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_B,
        entityType: "campaign.record",
        title: "Orion campaign domain",
      }),
    );

    const brandDefinition = knowledgeEntityRegistry.get("brand.profile");
    if (!brandDefinition?.domain) {
      throw new Error("brand.profile domain is required for this test");
    }
    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion", domains: [brandDefinition.domain] },
      "Orion",
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.entity.id).toBe(ENTITY_A);
  });

  it("filters by entity type", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        title: "Orion profile type",
      }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_B,
        entityType: "campaign.record",
        title: "Orion campaign type",
      }),
    );

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion", entityType: "brand.profile" },
      "Orion",
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.entity.entityType).toBe("brand.profile");
  });

  it("returns only validated entities when validatedOnly is true", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        status: "validated",
        title: "Orion validated",
      }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_B,
        entityType: "brand.profile",
        status: "provisional",
        title: "Orion provisional",
      }),
    );

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion", validatedOnly: true },
      "Orion",
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.entity.status).toBe("validated");
  });

  it("excludes provisional entities when includeProvisional is false", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        status: "provisional",
        title: "Orion provisional excluded",
      }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_B,
        entityType: "brand.profile",
        status: "validated",
        title: "Orion validated included",
      }),
    );

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion", includeProvisional: false },
      "Orion",
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.entity.id).toBe(ENTITY_B);
  });

  it("includes provisional entities by default", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        status: "provisional",
        title: "Orion provisional default",
      }),
    );

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion provisional default" },
      "Orion provisional default",
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.entity.status).toBe("provisional");
  });

  it("does not return entities from another tenant", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        title: "Orion tenant A",
      }),
    );

    const result = await engine.search(
      createContext(TENANT_B),
      { query: "Orion tenant A" },
      "Orion tenant A",
    );

    expect(result).toEqual([]);
  });

  it("uses deterministic score and entity-id ordering", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_B,
        entityType: "brand.profile",
        title: "Orion tie",
      }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "campaign.record",
        title: "Orion tie",
      }),
    );

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion tie" },
      "Orion tie",
    );

    expect(result[0]?.score).toBe(result[1]?.score);
    expect(result.map((entry) => entry.entity.id)).toEqual([ENTITY_A, ENTITY_B]);
  });

  it("rejects unauthorized keyword reads", async () => {
    const { engine } = createEngine();
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      roles: ["aurora.viewer"],
      auroraPermissions: ["aurora.knowledge.write"],
    });

    await expect(
      engine.search(ctx, { query: "Orion" }, "Orion"),
    ).rejects.toBeInstanceOf(AuroraError);
  });

  it("rejects empty search terms", async () => {
    const { engine } = createEngine();

    await expect(
      engine.search(createContext(TENANT_A), { query: "Orion" }, "   "),
    ).rejects.toBeInstanceOf(KeywordInvalidQueryError);
  });

  it("requires tenant context", async () => {
    const { engine } = createEngine();

    await expect(
      engine.search(
        createTestAuroraRuntimeContext({ tenantId: "", userId: "usr_test" }),
        { query: "Orion" },
        "Orion",
      ),
    ).rejects.toBeInstanceOf(KnowledgeInvalidTenantContextError);
  });

  it("propagates repository keyword search failures", async () => {
    const repository = {
      searchKeyword: vi.fn().mockRejectedValue(new Error("fts unavailable")),
    };
    const engine = new DefaultKeywordSearchEngine(
      repository as never,
      new DefaultAuroraAuthorizationService(),
    );

    await expect(
      engine.search(createContext(TENANT_A), { query: "Orion" }, "Orion"),
    ).rejects.toBeInstanceOf(KnowledgeKeywordSearchError);
  });

  it("maps keyword rank into score and keywordScore only", async () => {
    const { engine, repository } = createEngine();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: ENTITY_A,
        entityType: "brand.profile",
        title: "Orion mapping",
      }),
    );

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "Orion mapping" },
      "Orion mapping",
    );

    expect(result[0]?.score).toBe(result[0]?.keywordScore);
    expect(result[0]?.semanticScore).toBeUndefined();
    expect(result[0]?.graphProximityScore).toBeUndefined();
  });
});
