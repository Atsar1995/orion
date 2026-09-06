import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { listRelationshipTypes } from "@/lib/aurora/knowledge/registry/relationshipTypeDefinitions";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  InMemoryKnowledgeRepository,
  KnowledgeEntityNotFoundError,
  KnowledgeInvalidRelationshipError,
  KnowledgeRelationshipAlreadyExistsError,
  KnowledgeTenantBoundaryError,
} from "@/lib/aurora/knowledge/repositories";
import { RelationshipEngine } from "@/lib/aurora/knowledge/services/RelationshipEngine";

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

describe("relationship integrity", () => {
  it("registers all ten canonical relationship types", () => {
    expect(listRelationshipTypes()).toEqual([
      "belongs_to_brand",
      "part_of_campaign",
      "targets_audience",
      "references_product",
      "competes_with",
      "informed_by",
      "supersedes",
      "derived_from",
      "executive_directs",
      "optimizes",
    ]);
  });

  it("creates a valid belongs_to_brand relationship", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const engine = new RelationshipEngine(repository);
    const brand = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const campaign = createEntity(TENANT_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "campaign.record",
    });

    await repository.create(TENANT_A, brand);
    await repository.create(TENANT_A, campaign);

    const relationship = await engine.createRelationship(TENANT_A, {
      sourceEntityId: campaign.id,
      targetEntityId: brand.id,
      relationshipType: "belongs_to_brand",
    });

    expect(relationship.weight).toBe(1);
    await expect(repository.getRelationships(TENANT_A, campaign.id, "out")).resolves.toHaveLength(1);
  });

  it("rejects invalid relationship types", async () => {
    const engine = new RelationshipEngine(new InMemoryKnowledgeRepository());
    await expect(
      engine.createRelationship(TENANT_A, {
        sourceEntityId: "knw_550e8400-e29b-41d4-a716-446655440000",
        targetEntityId: "knw_660e8400-e29b-41d4-a716-446655440001",
        relationshipType: "invalid_type" as "belongs_to_brand",
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidRelationshipError);
  });

  it("rejects missing source entities", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const engine = new RelationshipEngine(repository);
    const target = createEntity(TENANT_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "brand.profile",
    });
    await repository.create(TENANT_A, target);

    await expect(
      engine.createRelationship(TENANT_A, {
        sourceEntityId: "knw_550e8400-e29b-41d4-a716-446655440000",
        targetEntityId: target.id,
        relationshipType: "belongs_to_brand",
      }),
    ).rejects.toBeInstanceOf(KnowledgeEntityNotFoundError);
  });

  it("rejects missing target entities", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const engine = new RelationshipEngine(repository);
    const source = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "campaign.record",
    });
    await repository.create(TENANT_A, source);

    await expect(
      engine.createRelationship(TENANT_A, {
        sourceEntityId: source.id,
        targetEntityId: "knw_660e8400-e29b-41d4-a716-446655440001",
        relationshipType: "belongs_to_brand",
      }),
    ).rejects.toBeInstanceOf(KnowledgeEntityNotFoundError);
  });

  it("rejects cross-tenant relationship endpoints at persistence layer", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const source = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "campaign.record",
    });
    const target = createEntity(TENANT_B, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "brand.profile",
    });
    await repository.create(TENANT_A, source);
    await repository.create(TENANT_B, target);

    await expect(
      repository.saveRelationship(TENANT_A, {
        id: "rel_001",
        tenantId: TENANT_A,
        sourceEntityId: source.id,
        targetEntityId: target.id,
        relationshipType: "belongs_to_brand",
        weight: 1,
        metadata: {},
        createdAt: "2026-08-27T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(KnowledgeEntityNotFoundError);
  });

  it("rejects invalid relationship weight", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const engine = new RelationshipEngine(repository);
    const brand = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const campaign = createEntity(TENANT_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "campaign.record",
    });
    await repository.create(TENANT_A, brand);
    await repository.create(TENANT_A, campaign);

    await expect(
      engine.createRelationship(TENANT_A, {
        sourceEntityId: campaign.id,
        targetEntityId: brand.id,
        relationshipType: "belongs_to_brand",
        weight: 1.5,
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidRelationshipError);
  });

  it("rejects duplicate relationships", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const engine = new RelationshipEngine(repository);
    const brand = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const campaign = createEntity(TENANT_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "campaign.record",
    });
    await repository.create(TENANT_A, brand);
    await repository.create(TENANT_A, campaign);

    const input = {
      sourceEntityId: campaign.id,
      targetEntityId: brand.id,
      relationshipType: "belongs_to_brand" as const,
    };
    await engine.createRelationship(TENANT_A, input);
    await expect(engine.createRelationship(TENANT_A, input)).rejects.toBeInstanceOf(
      KnowledgeRelationshipAlreadyExistsError,
    );
  });

  it("rejects domain mismatches defined by Appendix B", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const engine = new RelationshipEngine(repository);
    const competitor = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "competitor.competitor",
    });
    const seo = createEntity(TENANT_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "seo.keyword",
    });
    await repository.create(TENANT_A, competitor);
    await repository.create(TENANT_A, seo);

    await expect(
      engine.createRelationship(TENANT_A, {
        sourceEntityId: seo.id,
        targetEntityId: competitor.id,
        relationshipType: "competes_with",
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidRelationshipError);
  });

  it("rejects supersedes when entity types differ", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const engine = new RelationshipEngine(repository);
    const brand = createEntity(TENANT_A, {
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });
    const campaign = createEntity(TENANT_A, {
      id: "knw_660e8400-e29b-41d4-a716-446655440001",
      entityType: "campaign.record",
    });
    await repository.create(TENANT_A, brand);
    await repository.create(TENANT_A, campaign);

    await expect(
      engine.createRelationship(TENANT_A, {
        sourceEntityId: brand.id,
        targetEntityId: campaign.id,
        relationshipType: "supersedes",
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidRelationshipError);
  });

  it("rejects tenant boundary violations on saveRelationship", async () => {
    const repository = new InMemoryKnowledgeRepository();
    await expect(
      repository.saveRelationship(TENANT_A, {
        id: "rel_001",
        tenantId: TENANT_B,
        sourceEntityId: "knw_550e8400-e29b-41d4-a716-446655440000",
        targetEntityId: "knw_660e8400-e29b-41d4-a716-446655440001",
        relationshipType: "informed_by",
        weight: 0.5,
        metadata: {},
        createdAt: "2026-08-27T00:00:00.000Z",
      }),
    ).rejects.toBeInstanceOf(KnowledgeTenantBoundaryError);
  });
});
