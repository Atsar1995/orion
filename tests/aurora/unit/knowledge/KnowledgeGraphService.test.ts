import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { RELATIONSHIP_TYPES } from "@/lib/aurora/knowledge/domain/KnowledgeRelationship";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  InMemoryKnowledgeRepository,
  KnowledgeEntityNotFoundError,
  KnowledgeInvalidRelationshipError,
  KnowledgeRelationshipAlreadyExistsError,
} from "@/lib/aurora/knowledge/repositories";
import {
  DefaultKnowledgeGraphService,
  DefaultKnowledgeService,
  DefaultTaxonomyManager,
  RelationshipEngine,
} from "@/lib/aurora/knowledge/services";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { AuroraError } from "@/lib/aurora/errors/AuroraError";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "ten_alpha";
const TENANT_B = "ten_beta";
const BRAND_A = "brd_a";
const BRAND_B = "brd_b";

function createEntity(
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
    status: overrides.status ?? "validated",
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

function createGraphStack(repository = new InMemoryKnowledgeRepository()) {
  const authorization = new DefaultAuroraAuthorizationService();
  const knowledgeService = new DefaultKnowledgeService(
    repository,
    authorization,
    new DefaultTaxonomyManager(),
  );
  const relationshipEngine = new RelationshipEngine(repository);
  const graphService = new DefaultKnowledgeGraphService(
    knowledgeService,
    relationshipEngine,
    repository,
    authorization,
  );
  return { repository, graphService, knowledgeService };
}

function createContext(tenantId: string, brandId = BRAND_A) {
  return createTestAuroraRuntimeContext({
    tenantId,
    userId: "usr_test",
    brandId,
  });
}

describe("KnowledgeGraphService", () => {
  it("delegates entity creation to KnowledgeService", async () => {
    const { graphService } = createGraphStack();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, BRAND_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });

    await expect(graphService.createEntity(ctx, { entity })).resolves.toEqual(entity);
  });

  it("deprecates an entity and creates a new version", async () => {
    const { graphService } = createGraphStack();
    const ctx = createContext(TENANT_A);
    const entity = createEntity(TENANT_A, BRAND_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
      status: "validated",
    });

    await graphService.createEntity(ctx, { entity });
    const deprecated = await graphService.deprecateEntity(ctx, entity.id, "Superseded");
    expect(deprecated.status).toBe("deprecated");
    expect(deprecated.version).toBe(2);

    const history = await graphService.getVersionHistory(ctx, entity.id);
    expect(history).toHaveLength(2);
  });

  it("filters entities through listEntities query", async () => {
    const { graphService } = createGraphStack();
    const ctx = createContext(TENANT_A);
    const brandEntity = createEntity(TENANT_A, BRAND_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const campaignEntity = createEntity(TENANT_A, BRAND_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "campaign.record",
    });

    await graphService.createEntity(ctx, { entity: brandEntity });
    await graphService.createEntity(ctx, { entity: campaignEntity });

    await expect(
      graphService.listEntities(ctx, { domain: "knowledge.brand" }),
    ).resolves.toHaveLength(1);
  });

  it("creates and retrieves relationships", async () => {
    const { graphService } = createGraphStack();
    const ctx = createContext(TENANT_A);
    const brand = createEntity(TENANT_A, BRAND_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const campaign = createEntity(TENANT_A, BRAND_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "campaign.record",
    });

    await graphService.createEntity(ctx, { entity: brand });
    await graphService.createEntity(ctx, { entity: campaign });

    const relationship = await graphService.createRelationship(ctx, {
      sourceEntityId: campaign.id,
      targetEntityId: brand.id,
      relationshipType: "belongs_to_brand",
    });

    expect(relationship.relationshipType).toBe("belongs_to_brand");
    await expect(graphService.getRelationships(ctx, campaign.id, "out")).resolves.toHaveLength(1);
  });

  it("supports all ten canonical relationship types at the registry level", () => {
    expect(RELATIONSHIP_TYPES).toHaveLength(10);
  });

  it("rejects cross-tenant entity reads", async () => {
    const { graphService } = createGraphStack();
    const tenantACtx = createContext(TENANT_A);
    const tenantBCtx = createContext(TENANT_B);
    const entity = createEntity(TENANT_A, BRAND_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });

    await graphService.createEntity(tenantACtx, { entity });
    await expect(graphService.getEntity(tenantBCtx, entity.id)).resolves.toBeNull();
  });

  it("builds brand-centric graph snapshots within tenant scope", async () => {
    const { graphService } = createGraphStack();
    const ctx = createContext(TENANT_A);
    const brand = createEntity(TENANT_A, BRAND_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const campaign = createEntity(TENANT_A, BRAND_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "campaign.record",
    });

    await graphService.createEntity(ctx, { entity: brand });
    await graphService.createEntity(ctx, { entity: campaign });
    await graphService.createRelationship(ctx, {
      sourceEntityId: campaign.id,
      targetEntityId: brand.id,
      relationshipType: "belongs_to_brand",
    });

    const snapshot = await graphService.brandCentricQuery(ctx, BRAND_A);
    expect(snapshot.entities).toHaveLength(2);
    expect(snapshot.relationships).toHaveLength(1);
  });

  it("builds campaign-centric graph snapshots", async () => {
    const { graphService } = createGraphStack();
    const ctx = createContext(TENANT_A);
    const brand = createEntity(TENANT_A, BRAND_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const campaign = createEntity(TENANT_A, BRAND_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "campaign.record",
    });

    await graphService.createEntity(ctx, { entity: brand });
    await graphService.createEntity(ctx, { entity: campaign });
    await graphService.createRelationship(ctx, {
      sourceEntityId: campaign.id,
      targetEntityId: brand.id,
      relationshipType: "belongs_to_brand",
    });

    const snapshot = await graphService.campaignCentricQuery(ctx, campaign.id);
    expect(snapshot.entities.some((entity) => entity.id === campaign.id)).toBe(true);
  });

  it("builds cross-domain graph snapshots with tenant isolation", async () => {
    const { graphService } = createGraphStack();
    const tenantACtx = createContext(TENANT_A);
    const tenantBCtx = createContext(TENANT_B, BRAND_B);
    const brandA = createEntity(TENANT_A, BRAND_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const brandB = createEntity(TENANT_B, BRAND_B, {
      id: "knw_770e8400-e29b-41d4-a716-446655440002",
      entityType: "brand.profile",
    });

    await graphService.createEntity(tenantACtx, { entity: brandA });
    await graphService.createEntity(tenantBCtx, { entity: brandB });

    const snapshot = await graphService.crossDomainQuery(tenantACtx, {
      domains: ["knowledge.brand"],
    });
    expect(snapshot.entities).toHaveLength(1);
    expect(snapshot.entities[0]?.tenantId).toBe(TENANT_A);
  });

  it("rejects graph writes without authorization", async () => {
    const { graphService } = createGraphStack();
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      roles: ["aurora.viewer"],
      auroraPermissions: ["aurora.knowledge.read"],
    });

    await expect(
      graphService.createRelationship(ctx, {
        sourceEntityId: "knw_550e8400-e29b-41d4-a716-446655440000",
        targetEntityId: "knw_660e8400-e29b-41d4-a716-446655440001",
        relationshipType: "belongs_to_brand",
      }),
    ).rejects.toBeInstanceOf(AuroraError);
  });

  it("rejects relationship creation when source entity is missing", async () => {
    const { graphService } = createGraphStack();
    const ctx = createContext(TENANT_A);
    const target = createEntity(TENANT_A, BRAND_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "brand.profile",
    });
    await graphService.createEntity(ctx, { entity: target });

    await expect(
      graphService.createRelationship(ctx, {
        sourceEntityId: "knw_550e8400-e29b-41d4-a716-446655440000",
        targetEntityId: target.id,
        relationshipType: "belongs_to_brand",
      }),
    ).rejects.toBeInstanceOf(KnowledgeEntityNotFoundError);
  });
});
