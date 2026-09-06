import { randomUUID } from "node:crypto";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import { PostgresKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import {
  DefaultKnowledgeGraphService,
  DefaultKnowledgeService,
  DefaultTaxonomyManager,
  RelationshipEngine,
} from "@/lib/aurora/knowledge/services";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import {
  AURORA_LIVE_POSTGRES,
  cleanupPostgresTestHarness,
  setupPostgresTestHarness,
  type PostgresTestHarness,
} from "@/tests/aurora/helpers/postgresTestHarness";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

function createKnowledgeEntityId(): string {
  return `knw_${randomUUID()}`;
}

function createKnowledgeEntity(
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
    title: overrides.title ?? "Knowledge entity",
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

function createTenantContext(
  harness: PostgresTestHarness,
  tenant: "A" | "B",
  brandId?: string,
): AuroraRuntimeContext {
  return createTestAuroraRuntimeContext({
    tenantId: tenant === "A" ? harness.tenantAId : harness.tenantBId,
    userId: tenant === "A" ? harness.userAId : harness.userBId,
    brandId: brandId ?? (tenant === "A" ? harness.brandAId : harness.brandBId),
  });
}

function createGraphService(harness: PostgresTestHarness): DefaultKnowledgeGraphService {
  const repository = new PostgresKnowledgeRepository(harness.tenantDbScope);
  const authorization = new DefaultAuroraAuthorizationService();
  const knowledgeService = new DefaultKnowledgeService(
    repository,
    authorization,
    new DefaultTaxonomyManager(),
  );
  return new DefaultKnowledgeGraphService(
    knowledgeService,
    new RelationshipEngine(repository),
    repository,
    authorization,
  );
}

function expectTenantScopedSnapshot(
  snapshot: { entities: readonly KnowledgeEntity[]; relationships: readonly { tenantId: string }[] },
  tenantId: string,
): void {
  expect(snapshot.entities.every((entity) => entity.tenantId === tenantId)).toBe(true);
  expect(snapshot.relationships.every((relationship) => relationship.tenantId === tenantId)).toBe(true);
}

describe.skipIf(!AURORA_LIVE_POSTGRES)("PostgreSQL knowledge graph queries", () => {
  let harness: PostgresTestHarness | undefined;
  let postgresAvailable = false;
  let graphService: DefaultKnowledgeGraphService;

  beforeAll(async () => {
    try {
      harness = await setupPostgresTestHarness();
      postgresAvailable = true;
      graphService = createGraphService(harness);
    } catch (error) {
      postgresAvailable = false;
      console.warn("[aurora-postgres] Skipping knowledge graph query suite:", error);
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

  it("brandCentricQuery returns tenant- and brand-scoped entities and relationships", async () => {
    const brandScopeId = randomUUID();
    const unrelatedBrandId = randomUUID();
    const tenantACtx = createTenantContext(harness!, "A", brandScopeId);
    const tenantBCtx = createTenantContext(harness!, "B");

    const brandProfileId = createKnowledgeEntityId();
    const campaignId = createKnowledgeEntityId();
    const unrelatedSameTenantId = createKnowledgeEntityId();
    const tenantBEntityId = createKnowledgeEntityId();

    const brandProfile = createKnowledgeEntity(harness!.tenantAId, brandScopeId, {
      id: brandProfileId,
      entityType: "brand.profile",
      title: "Brand profile for brand-centric query",
    });
    const campaign = createKnowledgeEntity(harness!.tenantAId, brandScopeId, {
      id: campaignId,
      entityType: "campaign.record",
      title: "Campaign for brand-centric query",
    });
    const unrelatedSameTenant = createKnowledgeEntity(harness!.tenantAId, unrelatedBrandId, {
      id: unrelatedSameTenantId,
      entityType: "brand.profile",
      title: "Unrelated brand profile",
    });
    const tenantBEntity = createKnowledgeEntity(harness!.tenantBId, harness!.brandBId, {
      id: tenantBEntityId,
      entityType: "brand.profile",
      title: "Tenant B brand profile",
    });

    await graphService.createEntity(tenantACtx, { entity: brandProfile });
    await graphService.createEntity(tenantACtx, { entity: campaign });
    await graphService.createEntity(tenantACtx, { entity: unrelatedSameTenant });
    await graphService.createEntity(tenantBCtx, { entity: tenantBEntity });
    await graphService.createRelationship(tenantACtx, {
      sourceEntityId: campaignId,
      targetEntityId: brandProfileId,
      relationshipType: "belongs_to_brand",
    });

    const snapshot = await graphService.brandCentricQuery(tenantACtx, brandScopeId);

    expect(snapshot.entities).toHaveLength(2);
    expect(snapshot.entities.map((entity) => entity.id).sort()).toEqual(
      [brandProfileId, campaignId].sort(),
    );
    expect(snapshot.relationships).toHaveLength(1);
    expect(snapshot.relationships[0]?.relationshipType).toBe("belongs_to_brand");
    expect(snapshot.entities.some((entity) => entity.id === unrelatedSameTenantId)).toBe(false);
    expect(snapshot.entities.some((entity) => entity.id === tenantBEntityId)).toBe(false);
    expectTenantScopedSnapshot(snapshot, harness!.tenantAId);
  });

  it("campaignCentricQuery resolves campaign entities and inbound part_of_campaign relationships", async () => {
    const brandScopeId = randomUUID();
    const tenantACtx = createTenantContext(harness!, "A", brandScopeId);
    const tenantBCtx = createTenantContext(harness!, "B");

    const targetCampaignId = createKnowledgeEntityId();
    const unrelatedCampaignId = createKnowledgeEntityId();
    const contentId = createKnowledgeEntityId();
    const unrelatedContentId = createKnowledgeEntityId();
    const tenantBCampaignId = createKnowledgeEntityId();

    const targetCampaign = createKnowledgeEntity(harness!.tenantAId, brandScopeId, {
      id: targetCampaignId,
      entityType: "campaign.record",
      title: "Target campaign",
    });
    const unrelatedCampaign = createKnowledgeEntity(harness!.tenantAId, brandScopeId, {
      id: unrelatedCampaignId,
      entityType: "campaign.record",
      title: "Unrelated campaign",
    });
    const content = createKnowledgeEntity(harness!.tenantAId, brandScopeId, {
      id: contentId,
      entityType: "content.pattern",
      title: "Campaign content asset",
    });
    const unrelatedContent = createKnowledgeEntity(harness!.tenantAId, brandScopeId, {
      id: unrelatedContentId,
      entityType: "content.pattern",
      title: "Content for unrelated campaign",
    });
    const tenantBCampaign = createKnowledgeEntity(harness!.tenantBId, harness!.brandBId, {
      id: tenantBCampaignId,
      entityType: "campaign.record",
      title: "Tenant B campaign",
    });

    await graphService.createEntity(tenantACtx, { entity: targetCampaign });
    await graphService.createEntity(tenantACtx, { entity: unrelatedCampaign });
    await graphService.createEntity(tenantACtx, { entity: content });
    await graphService.createEntity(tenantACtx, { entity: unrelatedContent });
    await graphService.createEntity(tenantBCtx, { entity: tenantBCampaign });
    await graphService.createRelationship(tenantACtx, {
      sourceEntityId: contentId,
      targetEntityId: targetCampaignId,
      relationshipType: "part_of_campaign",
    });
    await graphService.createRelationship(tenantACtx, {
      sourceEntityId: unrelatedContentId,
      targetEntityId: unrelatedCampaignId,
      relationshipType: "part_of_campaign",
    });

    const snapshot = await graphService.campaignCentricQuery(tenantACtx, targetCampaignId);

    expect(snapshot.entities.map((entity) => entity.id).sort()).toEqual(
      [contentId, targetCampaignId].sort(),
    );
    expect(snapshot.relationships).toHaveLength(1);
    expect(snapshot.relationships[0]?.relationshipType).toBe("part_of_campaign");
    expect(snapshot.entities.some((entity) => entity.id === unrelatedCampaignId)).toBe(false);
    expect(snapshot.entities.some((entity) => entity.id === unrelatedContentId)).toBe(false);
    expect(snapshot.entities.some((entity) => entity.id === tenantBCampaignId)).toBe(false);
    expectTenantScopedSnapshot(snapshot, harness!.tenantAId);
  });

  it("crossDomainQuery respects domains, brand filtering, and validatedOnly", async () => {
    const brandScopeId = randomUUID();
    const otherBrandId = randomUUID();
    const tenantACtx = createTenantContext(harness!, "A", brandScopeId);
    const tenantBCtx = createTenantContext(harness!, "B");

    const brandEntityId = createKnowledgeEntityId();
    const campaignEntityId = createKnowledgeEntityId();
    const seoEntityId = createKnowledgeEntityId();
    const provisionalCampaignId = createKnowledgeEntityId();
    const otherBrandCampaignId = createKnowledgeEntityId();
    const tenantBBrandId = createKnowledgeEntityId();

    const brandEntity = createKnowledgeEntity(harness!.tenantAId, brandScopeId, {
      id: brandEntityId,
      entityType: "brand.profile",
      title: "Cross-domain brand entity",
      status: "validated",
    });
    const campaignEntity = createKnowledgeEntity(harness!.tenantAId, brandScopeId, {
      id: campaignEntityId,
      entityType: "campaign.record",
      title: "Cross-domain campaign entity",
      status: "validated",
    });
    const seoEntity = createKnowledgeEntity(harness!.tenantAId, brandScopeId, {
      id: seoEntityId,
      entityType: "seo.keyword",
      title: "Cross-domain seo entity",
      status: "validated",
    });
    const provisionalCampaign = createKnowledgeEntity(harness!.tenantAId, brandScopeId, {
      id: provisionalCampaignId,
      entityType: "campaign.record",
      title: "Provisional campaign entity",
      status: "provisional",
    });
    const otherBrandCampaign = createKnowledgeEntity(harness!.tenantAId, otherBrandId, {
      id: otherBrandCampaignId,
      entityType: "campaign.record",
      title: "Other brand campaign entity",
      status: "validated",
    });
    const tenantBBrand = createKnowledgeEntity(harness!.tenantBId, harness!.brandBId, {
      id: tenantBBrandId,
      entityType: "brand.profile",
      title: "Tenant B brand entity",
      status: "validated",
    });

    await graphService.createEntity(tenantACtx, { entity: brandEntity });
    await graphService.createEntity(tenantACtx, { entity: campaignEntity });
    await graphService.createEntity(tenantACtx, { entity: seoEntity });
    await graphService.createEntity(tenantACtx, { entity: provisionalCampaign });
    await graphService.createEntity(tenantACtx, { entity: otherBrandCampaign });
    await graphService.createEntity(tenantBCtx, { entity: tenantBBrand });

    const domainSnapshot = await graphService.crossDomainQuery(tenantACtx, {
      domains: ["knowledge.brand", "knowledge.campaign"],
    });
    expect(domainSnapshot.entities.map((entity) => entity.id).sort()).toEqual(
      [brandEntityId, campaignEntityId, otherBrandCampaignId, provisionalCampaignId].sort(),
    );
    expect(domainSnapshot.entities.some((entity) => entity.id === seoEntityId)).toBe(false);
    expect(domainSnapshot.entities.some((entity) => entity.id === tenantBBrandId)).toBe(false);
    expectTenantScopedSnapshot(domainSnapshot, harness!.tenantAId);

    const brandFilteredSnapshot = await graphService.crossDomainQuery(tenantACtx, {
      domains: ["knowledge.brand", "knowledge.campaign"],
      brandId: brandScopeId,
    });
    expect(brandFilteredSnapshot.entities.map((entity) => entity.id).sort()).toEqual(
      [brandEntityId, campaignEntityId, provisionalCampaignId].sort(),
    );
    expect(
      brandFilteredSnapshot.entities.some((entity) => entity.id === otherBrandCampaignId),
    ).toBe(false);

    const validatedOnlySnapshot = await graphService.crossDomainQuery(tenantACtx, {
      domains: ["knowledge.brand", "knowledge.campaign"],
      brandId: brandScopeId,
      validatedOnly: true,
    });
    expect(validatedOnlySnapshot.entities.map((entity) => entity.id).sort()).toEqual(
      [brandEntityId, campaignEntityId].sort(),
    );
    expect(
      validatedOnlySnapshot.entities.some((entity) => entity.id === provisionalCampaignId),
    ).toBe(false);
    expectTenantScopedSnapshot(validatedOnlySnapshot, harness!.tenantAId);
  });

  it("tenant A graph queries never return tenant B entities or relationships", async () => {
    const tenantABrandScopeId = randomUUID();
    const tenantBBrandScopeId = randomUUID();
    const tenantACtx = createTenantContext(harness!, "A", tenantABrandScopeId);
    const tenantBCtx = createTenantContext(harness!, "B", tenantBBrandScopeId);

    const tenantABrandId = createKnowledgeEntityId();
    const tenantACampaignId = createKnowledgeEntityId();
    const tenantAContentId = createKnowledgeEntityId();
    const tenantBBrandId = createKnowledgeEntityId();
    const tenantBCampaignId = createKnowledgeEntityId();
    const tenantBContentId = createKnowledgeEntityId();

    await graphService.createEntity(tenantACtx, {
      entity: createKnowledgeEntity(harness!.tenantAId, tenantABrandScopeId, {
        id: tenantABrandId,
        entityType: "brand.profile",
        title: "Tenant A brand for isolation",
      }),
    });
    await graphService.createEntity(tenantACtx, {
      entity: createKnowledgeEntity(harness!.tenantAId, tenantABrandScopeId, {
        id: tenantACampaignId,
        entityType: "campaign.record",
        title: "Tenant A campaign for isolation",
      }),
    });
    await graphService.createEntity(tenantACtx, {
      entity: createKnowledgeEntity(harness!.tenantAId, tenantABrandScopeId, {
        id: tenantAContentId,
        entityType: "content.pattern",
        title: "Tenant A content for isolation",
        status: "validated",
      }),
    });
    await graphService.createEntity(tenantBCtx, {
      entity: createKnowledgeEntity(harness!.tenantBId, tenantBBrandScopeId, {
        id: tenantBBrandId,
        entityType: "brand.profile",
        title: "Tenant B brand for isolation",
      }),
    });
    await graphService.createEntity(tenantBCtx, {
      entity: createKnowledgeEntity(harness!.tenantBId, tenantBBrandScopeId, {
        id: tenantBCampaignId,
        entityType: "campaign.record",
        title: "Tenant B campaign for isolation",
      }),
    });
    await graphService.createEntity(tenantBCtx, {
      entity: createKnowledgeEntity(harness!.tenantBId, tenantBBrandScopeId, {
        id: tenantBContentId,
        entityType: "content.pattern",
        title: "Tenant B content for isolation",
        status: "validated",
      }),
    });

    await graphService.createRelationship(tenantACtx, {
      sourceEntityId: tenantACampaignId,
      targetEntityId: tenantABrandId,
      relationshipType: "belongs_to_brand",
    });
    await graphService.createRelationship(tenantACtx, {
      sourceEntityId: tenantAContentId,
      targetEntityId: tenantACampaignId,
      relationshipType: "part_of_campaign",
    });
    await graphService.createRelationship(tenantBCtx, {
      sourceEntityId: tenantBCampaignId,
      targetEntityId: tenantBBrandId,
      relationshipType: "belongs_to_brand",
    });
    await graphService.createRelationship(tenantBCtx, {
      sourceEntityId: tenantBContentId,
      targetEntityId: tenantBCampaignId,
      relationshipType: "part_of_campaign",
    });

    const brandSnapshot = await graphService.brandCentricQuery(tenantACtx, tenantABrandScopeId);
    expectTenantScopedSnapshot(brandSnapshot, harness!.tenantAId);
    expect(brandSnapshot.entities.some((entity) => entity.tenantId === harness!.tenantBId)).toBe(
      false,
    );
    expect(
      brandSnapshot.relationships.some((relationship) => relationship.tenantId === harness!.tenantBId),
    ).toBe(false);

    const campaignSnapshot = await graphService.campaignCentricQuery(tenantACtx, tenantACampaignId);
    expectTenantScopedSnapshot(campaignSnapshot, harness!.tenantAId);
    expect(campaignSnapshot.entities.some((entity) => entity.id === tenantBContentId)).toBe(false);
    expect(
      campaignSnapshot.relationships.some(
        (relationship) =>
          relationship.sourceEntityId === tenantBContentId ||
          relationship.targetEntityId === tenantBCampaignId,
      ),
    ).toBe(false);

    const crossDomainSnapshot = await graphService.crossDomainQuery(tenantACtx, {
      domains: ["knowledge.brand", "knowledge.campaign", "knowledge.content"],
      brandId: tenantABrandScopeId,
      validatedOnly: true,
    });
    expectTenantScopedSnapshot(crossDomainSnapshot, harness!.tenantAId);
    expect(
      crossDomainSnapshot.entities.some((entity) => entity.tenantId === harness!.tenantBId),
    ).toBe(false);
    expect(
      crossDomainSnapshot.relationships.some(
        (relationship) => relationship.tenantId === harness!.tenantBId,
      ),
    ).toBe(false);
  });
});
