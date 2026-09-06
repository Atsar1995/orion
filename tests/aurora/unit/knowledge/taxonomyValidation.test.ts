import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import { DefaultTaxonomyManager } from "@/lib/aurora/knowledge/services/TaxonomyManager";

function createEntity(
  overrides: Partial<KnowledgeEntity> & Pick<KnowledgeEntity, "id" | "entityType">,
): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get(overrides.entityType);
  if (!definition?.domain) {
    throw new Error(`Unknown entity type: ${overrides.entityType}`);
  }

  return {
    tenantId: "ten_alpha",
    brandId: "brd_001",
    domain: definition.domain,
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
    ...overrides,
  };
}

describe("taxonomy validation", () => {
  const taxonomy = new DefaultTaxonomyManager();

  it("accepts valid domain/type placement from A-004 Appendix C", () => {
    const entity = createEntity({
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
    });

    expect(taxonomy.validateEntityPlacement(entity)).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects invalid domain/type placement", () => {
    const entity = createEntity({
      id: "knw_550e8400-e29b-41d4-a716-446655440000",
      entityType: "brand.profile",
      domain: "knowledge.campaign",
    });

    const result = taxonomy.validateEntityPlacement(entity);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns domain taxonomy trees", () => {
    const tree = taxonomy.getDomainTaxonomy("knowledge.brand");
    expect(tree.domain).toBe("knowledge.brand");
    expect(tree.root.key).toBe("brand");
    expect(tree.root.children?.some((child) => child.key === "profile")).toBe(true);
  });

  it("suggests entity types from content keywords", async () => {
    const suggestions = await taxonomy.suggestEntityType(
      "brand profile overview",
      "knowledge.brand",
    );
    expect(suggestions[0]?.entityType).toBe("brand.profile");
    expect(suggestions[0]?.score).toBeGreaterThan(0);
  });

  it("returns empty suggestions when content has no taxonomy matches", async () => {
    await expect(
      taxonomy.suggestEntityType("unrelated gibberish xyz", "knowledge.seo"),
    ).resolves.toEqual([]);
  });
});
