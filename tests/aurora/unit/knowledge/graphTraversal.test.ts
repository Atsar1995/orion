import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import {
  DefaultKnowledgeGraphService,
  DefaultKnowledgeService,
  DefaultTaxonomyManager,
  MAX_GRAPH_TRAVERSAL_DEPTH,
  RelationshipEngine,
  applyRelationshipWeightDecay,
} from "@/lib/aurora/knowledge/services";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "ten_alpha";
const TENANT_B = "ten_beta";

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
    brandId: "brd_001",
    domain: definition.domain,
    status: overrides.status ?? "validated",
    classification: "internal",
    title: "Test entity",
    content: {},
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-08-27T00:00:00.000Z",
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

async function seedChain(repository: InMemoryKnowledgeRepository) {
  const ids = [
    "knw_550e8400-e29b-41d4-a716-446655440000",
    "knw_660e8400-e29b-41d4-a716-446655440001",
    "knw_770e8400-e29b-41d4-a716-446655440002",
    "knw_880e8400-e29b-41d4-a716-446655440003",
  ];

  for (const [index, id] of ids.entries()) {
    await repository.create(
      TENANT_A,
      createEntity(TENANT_A, {
        id,
        entityType: index % 2 === 0 ? "brand.profile" : "campaign.record",
      }),
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

  return ids;
}

describe("graph traversal", () => {
  it("traverses one hop from the start entity", async () => {
    const { repository, graphService } = createGraphStack();
    const ctx = createTestAuroraRuntimeContext({ tenantId: TENANT_A, userId: "usr_test" });
    const ids = await seedChain(repository);

    const result = await graphService.traverse(ctx, ids[0]!, { maxDepth: 1 });
    expect(result.entities.map((entity) => entity.id).sort()).toEqual([ids[0], ids[1]].sort());
    expect(result.depthReached).toBe(1);
  });

  it("traverses two hops from the start entity", async () => {
    const { repository, graphService } = createGraphStack();
    const ctx = createTestAuroraRuntimeContext({ tenantId: TENANT_A, userId: "usr_test" });
    const ids = await seedChain(repository);

    const result = await graphService.traverse(ctx, ids[0]!, { maxDepth: 2 });
    expect(result.entities).toHaveLength(3);
    expect(result.depthReached).toBe(2);
  });

  it("traverses three hops and respects the canonical maximum depth", async () => {
    const { repository, graphService } = createGraphStack();
    const ctx = createTestAuroraRuntimeContext({ tenantId: TENANT_A, userId: "usr_test" });
    const ids = await seedChain(repository);

    const result = await graphService.traverse(ctx, ids[0]!, { maxDepth: MAX_GRAPH_TRAVERSAL_DEPTH });
    expect(result.entities).toHaveLength(4);
    expect(result.depthReached).toBe(3);
  });

  it("limits traversal beyond three hops", async () => {
    const { repository, graphService } = createGraphStack();
    const ctx = createTestAuroraRuntimeContext({ tenantId: TENANT_A, userId: "usr_test" });
    const ids = [
      "knw_550e8400-e29b-41d4-a716-446655440000",
      "knw_660e8400-e29b-41d4-a716-446655440001",
      "knw_770e8400-e29b-41d4-a716-446655440002",
      "knw_880e8400-e29b-41d4-a716-446655440003",
      "knw_990e8400-e29b-41d4-a716-446655440099",
    ];

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

    const result = await graphService.traverse(ctx, ids[0]!, { maxDepth: 10 });
    expect(result.entities).toHaveLength(4);
    expect(result.entities.some((entity) => entity.id === ids[4]!)).toBe(false);
  });

  it("detects cycles and avoids revisiting entities in the same path", async () => {
    const { repository, graphService } = createGraphStack();
    const ctx = createTestAuroraRuntimeContext({ tenantId: TENANT_A, userId: "usr_test" });
    const left = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const right = createEntity(TENANT_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "campaign.record",
    });
    await repository.create(TENANT_A, left);
    await repository.create(TENANT_A, right);

    for (const [sourceEntityId, targetEntityId, id] of [
      [left.id, right.id, "rel_ab"],
      [right.id, left.id, "rel_ba"],
    ] as const) {
      await repository.saveRelationship(TENANT_A, {
        id,
        tenantId: TENANT_A,
        sourceEntityId,
        targetEntityId,
        relationshipType: "informed_by",
        weight: 1,
        metadata: {},
        createdAt: "2026-08-27T00:00:00.000Z",
      });
    }

    const result = await graphService.traverse(ctx, left.id, { maxDepth: 3 });
    expect(result.entities).toHaveLength(2);
  });

  it("applies relationship weight decay", () => {
    const decayed = applyRelationshipWeightDecay(1, "2026-01-01T00:00:00.000Z", "2026-08-27T00:00:00.000Z");
    expect(decayed).toBeLessThan(1);
    expect(decayed).toBeCloseTo(0.6983, 3);
  });

  it("excludes non-validated entities when validatedOnly is enabled", async () => {
    const { repository, graphService } = createGraphStack();
    const ctx = createTestAuroraRuntimeContext({ tenantId: TENANT_A, userId: "usr_test" });
    const validated = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
      status: "validated",
    });
    const provisional = createEntity(TENANT_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "campaign.record",
      status: "provisional",
    });
    await repository.create(TENANT_A, validated);
    await repository.create(TENANT_A, provisional);
    await repository.saveRelationship(TENANT_A, {
      id: "rel_001",
      tenantId: TENANT_A,
      sourceEntityId: validated.id,
      targetEntityId: provisional.id,
      relationshipType: "informed_by",
      weight: 1,
      metadata: {},
      createdAt: "2026-08-27T00:00:00.000Z",
    });

    const result = await graphService.traverse(ctx, validated.id, {
      maxDepth: 2,
      validatedOnly: true,
    });
    expect(result.entities.map((entity) => entity.id)).toEqual([validated.id]);
  });

  it("keeps traversal within tenant boundaries", async () => {
    const { repository, graphService } = createGraphStack();
    const tenantACtx = createTestAuroraRuntimeContext({ tenantId: TENANT_A, userId: "usr_a" });
    const tenantAEntity = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const tenantBEntity = createEntity(TENANT_B, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "brand.profile",
    });
    await repository.create(TENANT_A, tenantAEntity);
    await repository.create(TENANT_B, tenantBEntity);

    const result = await graphService.traverse(tenantACtx, tenantAEntity.id, { maxDepth: 1 });
    expect(result.entities.every((entity) => entity.tenantId === TENANT_A)).toBe(true);
  });
});
