import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import {
  PHASE_ONE_ENTITY_TYPES,
  knowledgeEntityRegistry,
} from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  PHASE_ONE_KNOWLEDGE_ENTITY_SCHEMAS,
  knowledgeEntitySchemaRegistry,
} from "@/lib/aurora/knowledge/schemas";

const PHASE_TWO_ENTITY_TYPE = "customer.segment";
const RESERVED_ENTITY_TYPE = "knowledge.meta.schema_version";

function createMinimalEntity(
  entityType: string,
  domain: NonNullable<ReturnType<typeof knowledgeEntityRegistry.get>>["domain"],
): KnowledgeEntity {
  return {
    id: "knw_550e8400-e29b-41d4-a716-446655440000",
    tenantId: "ten_001",
    brandId: "brd_001",
    domain: domain!,
    entityType,
    status: "acquired",
    classification: "internal",
    title: "Test entity",
    content: {},
    sourceType: "source.human.brand_manager",
    sourceTrust: 1,
    version: 1,
    curatorAgent: "knowledge-manager",
    createdAt: "2026-08-27T00:00:00.000Z",
    updatedAt: "2026-08-27T00:00:00.000Z",
  };
}

describe("Phase-1 knowledge entity schemas", () => {
  it("defines a schema for every Phase-1 entity type", () => {
    expect(Object.keys(PHASE_ONE_KNOWLEDGE_ENTITY_SCHEMAS)).toHaveLength(21);
    for (const entityType of PHASE_ONE_ENTITY_TYPES) {
      expect(PHASE_ONE_KNOWLEDGE_ENTITY_SCHEMAS).toHaveProperty(entityType);
      expect(knowledgeEntitySchemaRegistry.has(entityType)).toBe(true);
    }
  });

  it("accepts valid minimal records for every Phase-1 entity type", () => {
    for (const entityType of PHASE_ONE_ENTITY_TYPES) {
      const definition = knowledgeEntityRegistry.get(entityType);
      expect(definition?.domain).toBeDefined();

      const record = createMinimalEntity(entityType, definition!.domain);
      const result = knowledgeEntitySchemaRegistry.safeParse(entityType, record);
      expect(result.success, entityType).toBe(true);
    }
  });

  it("rejects invalid lifecycle values", () => {
    const entityType = "brand.profile";
    const definition = knowledgeEntityRegistry.get(entityType)!;
    const record = {
      ...createMinimalEntity(entityType, definition.domain),
      status: "published",
    };

    const result = knowledgeEntitySchemaRegistry.safeParse(entityType, record);
    expect(result.success).toBe(false);
  });

  it("rejects invalid domain values", () => {
    const entityType = "brand.profile";
    const record = {
      ...createMinimalEntity(entityType, "knowledge.brand"),
      domain: "knowledge.product",
    };

    const result = knowledgeEntitySchemaRegistry.safeParse(entityType, record);
    expect(result.success).toBe(false);
  });

  it("rejects invalid classification values", () => {
    const entityType = "seo.keyword";
    const definition = knowledgeEntityRegistry.get(entityType)!;
    const record = {
      ...createMinimalEntity(entityType, definition.domain),
      classification: "secret",
    };

    const result = knowledgeEntitySchemaRegistry.safeParse(entityType, record);
    expect(result.success).toBe(false);
  });

  it("rejects invalid source type values", () => {
    const entityType = "content.pattern";
    const definition = knowledgeEntityRegistry.get(entityType)!;
    const record = {
      ...createMinimalEntity(entityType, definition.domain),
      sourceType: "source.invalid.type",
    };

    const result = knowledgeEntitySchemaRegistry.safeParse(entityType, record);
    expect(result.success).toBe(false);
  });

  it("rejects sourceTrust values outside the 0.0–1.0 bounds", () => {
    const entityType = "campaign.record";
    const definition = knowledgeEntityRegistry.get(entityType)!;

    for (const sourceTrust of [-0.1, 1.1]) {
      const record = {
        ...createMinimalEntity(entityType, definition.domain),
        sourceTrust,
      };
      const result = knowledgeEntitySchemaRegistry.safeParse(entityType, record);
      expect(result.success).toBe(false);
    }
  });

  it("rejects malformed required fields", () => {
    const entityType = "product.product";
    const definition = knowledgeEntityRegistry.get(entityType)!;
    const record = {
      ...createMinimalEntity(entityType, definition.domain),
      title: "",
    };

    const result = knowledgeEntitySchemaRegistry.safeParse(entityType, record);
    expect(result.success).toBe(false);
  });

  it("rejects entityType and schema mismatches", () => {
    const brandRecord = createMinimalEntity("brand.profile", "knowledge.brand");
    const productResult = knowledgeEntitySchemaRegistry.safeParse("product.product", brandRecord);
    expect(productResult.success).toBe(false);

    const mismatchedRecord = {
      ...createMinimalEntity("brand.profile", "knowledge.brand"),
      entityType: "product.product",
    };
    const brandResult = knowledgeEntitySchemaRegistry.safeParse("brand.profile", mismatchedRecord);
    expect(brandResult.success).toBe(false);
  });

  it("covers all Phase-1 registry entries", () => {
    const phaseOneRegistryTypes = knowledgeEntityRegistry
      .list()
      .filter((definition) => definition.phase === 1)
      .map((definition) => definition.entityType);

    expect(phaseOneRegistryTypes).toHaveLength(21);
    for (const entityType of phaseOneRegistryTypes) {
      expect(knowledgeEntitySchemaRegistry.get(entityType)).toBeDefined();
    }
  });

  it("does not expose schemas for Phase-2 or reserved entity types", () => {
    expect(knowledgeEntitySchemaRegistry.has(PHASE_TWO_ENTITY_TYPE)).toBe(false);
    expect(knowledgeEntitySchemaRegistry.get(PHASE_TWO_ENTITY_TYPE)).toBeUndefined();
    expect(knowledgeEntitySchemaRegistry.has(RESERVED_ENTITY_TYPE)).toBe(false);
    expect(knowledgeEntitySchemaRegistry.get(RESERVED_ENTITY_TYPE)).toBeUndefined();
  });
});
