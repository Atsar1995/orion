import { describe, expect, it, vi } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import {
  DefaultGraphSearchEngine,
  computeGraphProximityScores,
  resolveGraphStartEntityId,
  resolveGraphValidatedOnly,
} from "@/lib/aurora/knowledge/retrieval/GraphSearchEngine";
import {
  DefaultKnowledgeGraphService,
  DefaultKnowledgeService,
  DefaultTaxonomyManager,
  MAX_GRAPH_TRAVERSAL_DEPTH,
  MAX_GRAPH_TRAVERSAL_ENTITIES,
  RelationshipEngine,
  type KnowledgeGraphService,
} from "@/lib/aurora/knowledge/services";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { AuroraError } from "@/lib/aurora/errors/AuroraError";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const TENANT_B = "660e8400-e29b-41d4-a716-446655440002";
const BRAND_A = "770e8400-e29b-41d4-a716-446655440003";
const BRAND_B = "880e8400-e29b-41d4-a716-446655440004";
const START_ID = "knw_550e8400-e29b-41d4-a716-446655440000";
const NEIGHBOR_ID = "knw_660e8400-e29b-41d4-a716-446655440001";
const DISTANT_ID = "knw_770e8400-e29b-41d4-a716-446655440002";
const ENTITY_A_ID = "knw_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ENTITY_B_ID = "knw_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

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

function createGraphStack() {
  const repository = new InMemoryKnowledgeRepository();
  const authorization = new DefaultAuroraAuthorizationService();
  const graphService = new DefaultKnowledgeGraphService(
    new DefaultKnowledgeService(repository, authorization, new DefaultTaxonomyManager()),
    new RelationshipEngine(repository),
    repository,
    authorization,
  );
  return { repository, graphService };
}

function createEngine(graphService: KnowledgeGraphService) {
  return new DefaultGraphSearchEngine(graphService, new DefaultAuroraAuthorizationService());
}

function createContext(tenantId: string) {
  return createTestAuroraRuntimeContext({
    tenantId,
    userId: "usr_test",
    brandId: BRAND_A,
  });
}

async function seedBasicGraph(repository: InMemoryKnowledgeRepository) {
  await repository.create(
    TENANT_A,
    createEntity(TENANT_A, { id: START_ID, entityType: "brand.profile", title: "Start node" }),
  );
  await repository.create(
    TENANT_A,
    createEntity(TENANT_A, { id: NEIGHBOR_ID, entityType: "campaign.record", title: "Neighbor" }),
  );
  await repository.create(
    TENANT_A,
    createEntity(TENANT_A, { id: DISTANT_ID, entityType: "campaign.record", title: "Distant" }),
  );

  await repository.saveRelationship(TENANT_A, {
    id: "rel_start_neighbor",
    tenantId: TENANT_A,
    sourceEntityId: START_ID,
    targetEntityId: NEIGHBOR_ID,
    relationshipType: "informed_by",
    weight: 0.9,
    metadata: {},
    createdAt: "2026-08-27T00:00:00.000Z",
  });
  await repository.saveRelationship(TENANT_A, {
    id: "rel_neighbor_distant",
    tenantId: TENANT_A,
    sourceEntityId: NEIGHBOR_ID,
    targetEntityId: DISTANT_ID,
    relationshipType: "informed_by",
    weight: 0.8,
    metadata: {},
    createdAt: "2026-08-27T00:00:00.000Z",
  });
}

describe("GraphSearchEngine", () => {
  it("retrieves graph-connected entities through KnowledgeGraphService", async () => {
    const { repository, graphService } = createGraphStack();
    await seedBasicGraph(repository);
    const engine = createEngine(graphService);

    const result = await engine.search(createContext(TENANT_A), { query: "graph" }, START_ID);

    expect(result.length).toBeGreaterThan(1);
    expect(result.some((entry) => entry.entity.id === START_ID)).toBe(true);
    expect(result.some((entry) => entry.entity.id === NEIGHBOR_ID)).toBe(true);
  });

  it("maps traversal results into ScoredEntity entries", async () => {
    const { repository, graphService } = createGraphStack();
    await seedBasicGraph(repository);
    const engine = createEngine(graphService);

    const result = await engine.search(createContext(TENANT_A), { query: "graph" }, START_ID);
    const start = result.find((entry) => entry.entity.id === START_ID);

    expect(start?.entity.title).toBe("Start node");
    expect(start?.score).toBeDefined();
    expect(start?.graphProximityScore).toBeDefined();
  });

  it("maps graph proximity into score and graphProximityScore", async () => {
    const { repository, graphService } = createGraphStack();
    await seedBasicGraph(repository);
    const engine = createEngine(graphService);

    const result = await engine.search(createContext(TENANT_A), { query: "graph" }, START_ID);
    const start = result.find((entry) => entry.entity.id === START_ID);
    const neighbor = result.find((entry) => entry.entity.id === NEIGHBOR_ID);

    expect(start?.score).toBe(1);
    expect(start?.graphProximityScore).toBe(1);
    expect(neighbor?.graphProximityScore).toBeGreaterThan(0);
    expect(neighbor?.score).toBe(neighbor?.graphProximityScore);
    expect(neighbor?.semanticScore).toBeUndefined();
    expect(neighbor?.keywordScore).toBeUndefined();
  });

  it("respects topK after graph ranking", async () => {
    const { repository, graphService } = createGraphStack();
    await seedBasicGraph(repository);
    const engine = createEngine(graphService);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "graph", topK: 2 },
      START_ID,
    );

    expect(result).toHaveLength(2);
  });

  it("filters results by brandId", async () => {
    const { repository, graphService } = createGraphStack();
    await seedBasicGraph(repository);
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: "knw_880e8400-e29b-41d4-a716-446655440003",
        entityType: "brand.profile",
        brandId: BRAND_B,
        title: "Other brand neighbor",
      }),
    );
    await repository.saveRelationship(TENANT_A, {
      id: "rel_other_brand",
      tenantId: TENANT_A,
      sourceEntityId: START_ID,
      targetEntityId: "knw_880e8400-e29b-41d4-a716-446655440003",
      relationshipType: "informed_by",
      weight: 0.95,
      metadata: {},
      createdAt: "2026-08-27T00:00:00.000Z",
    });

    const engine = createEngine(graphService);
    const result = await engine.search(
      createContext(TENANT_A),
      { query: "graph", brandId: BRAND_A },
      START_ID,
    );

    expect(result.every((entry) => entry.entity.brandId === BRAND_A)).toBe(true);
  });

  it("filters results by domain", async () => {
    const { repository, graphService } = createGraphStack();
    await seedBasicGraph(repository);
    const brandDefinition = knowledgeEntityRegistry.get("brand.profile");
    if (!brandDefinition?.domain) {
      throw new Error("brand.profile domain is required for this test");
    }
    const engine = createEngine(graphService);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "graph", domains: [brandDefinition.domain] },
      START_ID,
    );

    expect(result.every((entry) => entry.entity.domain === brandDefinition.domain)).toBe(true);
  });

  it("filters results by entity type", async () => {
    const { repository, graphService } = createGraphStack();
    await seedBasicGraph(repository);
    const engine = createEngine(graphService);

    const result = await engine.search(
      createContext(TENANT_A),
      { query: "graph", entityType: "campaign.record" },
      START_ID,
    );

    expect(result.every((entry) => entry.entity.entityType === "campaign.record")).toBe(true);
    expect(result.some((entry) => entry.entity.id === START_ID)).toBe(false);
  });

  it("excludes non-validated entities when validatedOnly is true", async () => {
    const { repository, graphService } = createGraphStack();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: START_ID,
        entityType: "brand.profile",
        status: "validated",
      }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id: NEIGHBOR_ID,
        entityType: "campaign.record",
        status: "provisional",
      }),
    );
    await repository.saveRelationship(TENANT_A, {
      id: "rel_validated_provisional",
      tenantId: TENANT_A,
      sourceEntityId: START_ID,
      targetEntityId: NEIGHBOR_ID,
      relationshipType: "informed_by",
      weight: 1,
      metadata: {},
      createdAt: "2026-08-27T00:00:00.000Z",
    });

    const engine = createEngine(graphService);
    const result = await engine.search(
      createContext(TENANT_A),
      { query: "graph", validatedOnly: true },
      START_ID,
    );

    expect(result.every((entry) => entry.entity.status === "validated")).toBe(true);
  });

  describe("validatedOnly defaults (Discovery H8)", () => {
    it("defaults omitted validatedOnly to true for traverse", () => {
      expect(resolveGraphValidatedOnly({ query: "graph" })).toBe(true);
    });

    it("passes validatedOnly=true to traverse when explicitly set", async () => {
      const graphService = {
        traverse: vi.fn().mockResolvedValue({ entities: [], relationships: [], depthReached: 0 }),
      } as unknown as KnowledgeGraphService;
      const engine = createEngine(graphService);

      await engine.search(createContext(TENANT_A), { query: "graph", validatedOnly: true }, START_ID);

      expect(graphService.traverse).toHaveBeenCalledWith(
        expect.anything(),
        START_ID,
        expect.objectContaining({ validatedOnly: true }),
      );
    });

    it("passes validatedOnly=true to traverse when omitted", async () => {
      const graphService = {
        traverse: vi.fn().mockResolvedValue({ entities: [], relationships: [], depthReached: 0 }),
      } as unknown as KnowledgeGraphService;
      const engine = createEngine(graphService);

      await engine.search(createContext(TENANT_A), { query: "graph" }, START_ID);

      expect(graphService.traverse).toHaveBeenCalledWith(
        expect.anything(),
        START_ID,
        expect.objectContaining({ validatedOnly: true }),
      );
    });

    it("passes validatedOnly=false to traverse when explicitly set", async () => {
      const graphService = {
        traverse: vi.fn().mockResolvedValue({ entities: [], relationships: [], depthReached: 0 }),
      } as unknown as KnowledgeGraphService;
      const engine = createEngine(graphService);

      await engine.search(
        createContext(TENANT_A),
        { query: "graph", validatedOnly: false },
        START_ID,
      );

      expect(graphService.traverse).toHaveBeenCalledWith(
        expect.anything(),
        START_ID,
        expect.objectContaining({ validatedOnly: false }),
      );
    });

    it("excludes provisional entities when validatedOnly is omitted", async () => {
      const { repository, graphService } = createGraphStack();
      await repository.create(
        TENANT_A,
        createEntity(TENANT_A, {
          id: START_ID,
          entityType: "brand.profile",
          status: "validated",
        }),
      );
      await repository.create(
        TENANT_A,
        createEntity(TENANT_A, {
          id: NEIGHBOR_ID,
          entityType: "campaign.record",
          status: "provisional",
        }),
      );
      await repository.saveRelationship(TENANT_A, {
        id: "rel_default_validated_only",
        tenantId: TENANT_A,
        sourceEntityId: START_ID,
        targetEntityId: NEIGHBOR_ID,
        relationshipType: "informed_by",
        weight: 1,
        metadata: {},
        createdAt: "2026-08-27T00:00:00.000Z",
      });

      const engine = createEngine(graphService);
      const result = await engine.search(createContext(TENANT_A), { query: "graph" }, START_ID);

      expect(result.some((entry) => entry.entity.id === NEIGHBOR_ID)).toBe(false);
      expect(result.every((entry) => entry.entity.status === "validated")).toBe(true);
    });

    it("includes provisional entities when validatedOnly is explicitly false", async () => {
      const { repository, graphService } = createGraphStack();
      await repository.create(
        TENANT_A,
        createEntity(TENANT_A, {
          id: START_ID,
          entityType: "brand.profile",
          status: "validated",
        }),
      );
      await repository.create(
        TENANT_A,
        createEntity(TENANT_A, {
          id: NEIGHBOR_ID,
          entityType: "campaign.record",
          status: "provisional",
        }),
      );
      await repository.saveRelationship(TENANT_A, {
        id: "rel_explicit_false_validated_only",
        tenantId: TENANT_A,
        sourceEntityId: START_ID,
        targetEntityId: NEIGHBOR_ID,
        relationshipType: "informed_by",
        weight: 1,
        metadata: {},
        createdAt: "2026-08-27T00:00:00.000Z",
      });

      const engine = createEngine(graphService);
      const result = await engine.search(
        createContext(TENANT_A),
        { query: "graph", validatedOnly: false },
        START_ID,
      );

      expect(result.some((entry) => entry.entity.id === NEIGHBOR_ID)).toBe(true);
    });
  });

  it("does not return entities from another tenant", async () => {
    const { repository, graphService } = createGraphStack();
    await seedBasicGraph(repository);
    const engine = createEngine(graphService);

    const result = await engine.search(createContext(TENANT_B), { query: "graph" }, START_ID);

    expect(result).toEqual([]);
  });

  it("uses ctx.tenantId as tenant authority", async () => {
    const graphService = {
      traverse: vi.fn().mockResolvedValue({ entities: [], relationships: [], depthReached: 0 }),
    } as unknown as KnowledgeGraphService;
    const engine = createEngine(graphService);
    const ctx = createContext(TENANT_A);

    await engine.search(ctx, { query: "graph" }, START_ID);

    expect(graphService.traverse).toHaveBeenCalledWith(
      ctx,
      START_ID,
      expect.objectContaining({ maxDepth: MAX_GRAPH_TRAVERSAL_DEPTH }),
    );
  });

  it("rejects unauthorized graph reads", async () => {
    const { graphService } = createGraphStack();
    const engine = createEngine(graphService);
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      roles: ["aurora.viewer"],
      auroraPermissions: ["aurora.knowledge.write"],
    });

    await expect(
      engine.search(ctx, { query: "graph" }, START_ID),
    ).rejects.toBeInstanceOf(AuroraError);
  });

  it("returns empty results when no start node can be resolved", async () => {
    const { graphService } = createGraphStack();
    const engine = createEngine(graphService);

    await expect(
      engine.search(createContext(TENANT_A), { query: "graph without start" }),
    ).resolves.toEqual([]);
  });

  it("resolves campaignId as a graph start node fallback", () => {
    expect(
      resolveGraphStartEntityId(undefined, {
        query: "campaign graph",
        campaignId: "knw_campaign_001",
      }),
    ).toBe("knw_campaign_001");
  });

  it("orders equal-score entities deterministically by entity id", async () => {
    const { repository, graphService } = createGraphStack();
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: START_ID, entityType: "brand.profile" }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: ENTITY_B_ID, entityType: "campaign.record" }),
    );
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, { id: ENTITY_A_ID, entityType: "campaign.record" }),
    );

    for (const [sourceEntityId, targetEntityId, id] of [
      [START_ID, ENTITY_B_ID, "rel_b"],
      [START_ID, ENTITY_A_ID, "rel_a"],
    ] as const) {
      await repository.saveRelationship(TENANT_A, {
        id,
        tenantId: TENANT_A,
        sourceEntityId,
        targetEntityId,
        relationshipType: "informed_by",
        weight: 0.5,
        metadata: {},
        createdAt: "2026-08-27T00:00:00.000Z",
      });
    }

    const engine = createEngine(graphService);
    const result = await engine.search(createContext(TENANT_A), { query: "graph" }, START_ID);
    const tied = result.filter((entry) => entry.score === result[1]?.score);

    expect(tied.map((entry) => entry.entity.id)).toEqual(
      [...tied.map((entry) => entry.entity.id)].sort((left, right) => left.localeCompare(right)),
    );
  });

  it("propagates graph service failures", async () => {
    const graphService = {
      traverse: vi.fn().mockRejectedValue(new Error("graph backend unavailable")),
    } as unknown as KnowledgeGraphService;
    const engine = createEngine(graphService);

    await expect(
      engine.search(createContext(TENANT_A), { query: "graph" }, START_ID),
    ).rejects.toThrow("graph backend unavailable");
  });

  it("preserves canonical traversal depth when delegating to graph service", async () => {
    const graphService = {
      traverse: vi.fn().mockResolvedValue({ entities: [], relationships: [], depthReached: 0 }),
    } as unknown as KnowledgeGraphService;
    const engine = createEngine(graphService);

    await engine.search(createContext(TENANT_A), { query: "graph" }, START_ID);

    expect(graphService.traverse).toHaveBeenCalledWith(
      expect.anything(),
      START_ID,
      expect.objectContaining({ maxDepth: MAX_GRAPH_TRAVERSAL_DEPTH }),
    );
  });

  it("does not return duplicate entities", async () => {
    const { repository, graphService } = createGraphStack();
    await seedBasicGraph(repository);
    const engine = createEngine(graphService);

    const result = await engine.search(createContext(TENANT_A), { query: "graph" }, START_ID);
    const ids = result.map((entry) => entry.entity.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not import semantic or keyword retrieval engines", async () => {
    const graphModule = await import("@/lib/aurora/knowledge/retrieval/GraphSearchEngine");
    expect(graphModule).not.toHaveProperty("DefaultSemanticSearchEngine");
    expect(graphModule).not.toHaveProperty("DefaultKeywordSearchEngine");
  });

  it("requires tenant context", async () => {
    const { graphService } = createGraphStack();
    const engine = createEngine(graphService);

    await expect(
      engine.search(
        createTestAuroraRuntimeContext({ tenantId: "", userId: "usr_test" }),
        { query: "graph" },
        START_ID,
      ),
    ).rejects.toBeInstanceOf(KnowledgeInvalidTenantContextError);
  });

  it("respects graph traversal entity limits from the underlying service", async () => {
    const { repository, graphService } = createGraphStack();
    const ids = Array.from(
      { length: MAX_GRAPH_TRAVERSAL_ENTITIES + 5 },
      (_, index) => `knw_${(index + 1).toString().padStart(4, "0")}0000-e29b-41d4-a716-446655440000`,
    );

    for (const id of ids) {
      await repository.create(
        TENANT_A,
        createEntity(TENANT_A, { id, entityType: "brand.profile" }),
      );
    }

    for (let index = 0; index < ids.length - 1; index += 1) {
      await repository.saveRelationship(TENANT_A, {
        id: `rel_${index}`,
        tenantId: TENANT_A,
        sourceEntityId: ids[index]!,
        targetEntityId: ids[index + 1]!,
        relationshipType: "informed_by",
        weight: 1,
        metadata: {},
        createdAt: "2026-08-27T00:00:00.000Z",
      });
    }

    const engine = createEngine(graphService);
    const result = await engine.search(createContext(TENANT_A), { query: "graph" }, ids[0]!);

    expect(result.length).toBeLessThanOrEqual(MAX_GRAPH_TRAVERSAL_ENTITIES);
  });

  it("scores closer neighbors higher than distant ones", async () => {
    const { repository, graphService } = createGraphStack();
    await seedBasicGraph(repository);
    const engine = createEngine(graphService);

    const result = await engine.search(createContext(TENANT_A), { query: "graph" }, START_ID);
    const neighbor = result.find((entry) => entry.entity.id === NEIGHBOR_ID);
    const distant = result.find((entry) => entry.entity.id === DISTANT_ID);

    expect(neighbor?.graphProximityScore ?? 0).toBeGreaterThan(distant?.graphProximityScore ?? 0);
  });

  it("computes deterministic graph proximity scores from traversal output", () => {
    const traversal = {
      entities: [],
      relationships: [
        {
          id: "rel_1",
          tenantId: TENANT_A,
          sourceEntityId: START_ID,
          targetEntityId: NEIGHBOR_ID,
          relationshipType: "informed_by" as const,
          weight: 0.8,
          metadata: {},
          createdAt: "2026-08-27T00:00:00.000Z",
        },
      ],
      depthReached: 1,
    };

    const scores = computeGraphProximityScores(START_ID, traversal);
    expect(scores.get(START_ID)).toBe(1);
    expect(scores.get(NEIGHBOR_ID)).toBeCloseTo(0.4, 5);
  });
});
