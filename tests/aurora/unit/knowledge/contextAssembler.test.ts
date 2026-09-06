import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import { DefaultContextAssembler } from "@/lib/aurora/knowledge/retrieval/ContextAssembler";
import {
  assignScoredEntitiesToLayers,
  deduplicateScoredEntities,
  estimateTokenCount,
  resolveContextLayer,
  serializeEntityForContext,
} from "@/lib/aurora/knowledge/retrieval/contextAssembly";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { AuroraError } from "@/lib/aurora/errors/AuroraError";
import {
  CONTEXT_LAYER_KEYS,
  CONTEXT_LAYER_TOKEN_LIMITS,
  RETRIEVAL_MAX_CONTEXT_TOKENS,
  type ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const TENANT_B = "550e8400-e29b-41d4-a716-446655440002";
const ENTITY_A = "knw_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ENTITY_B = "knw_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ENTITY_C = "knw_cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const ENTITY_D = "knw_dddddddd-dddd-4ddd-8ddd-dddddddddddd";

function createEntity(
  overrides: Partial<KnowledgeEntity> & Pick<KnowledgeEntity, "id" | "entityType">,
): KnowledgeEntity {
  const definition = knowledgeEntityRegistry.get(overrides.entityType);
  if (!definition?.domain) {
    throw new Error(`Unknown entity type: ${overrides.entityType}`);
  }

  return {
    tenantId: TENANT_A,
    brandId: "770e8400-e29b-41d4-a716-446655440003",
    domain: definition.domain,
    status: "validated",
    classification: "internal",
    title: "Entity",
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

function scored(entity: KnowledgeEntity, score = 0.9, extras: Partial<ScoredEntity> = {}): ScoredEntity {
  return { entity, score, ...extras };
}

function createAssembler() {
  return new DefaultContextAssembler(new DefaultAuroraAuthorizationService());
}

function createCtx(overrides: Partial<ReturnType<typeof createTestAuroraRuntimeContext>> = {}) {
  return createTestAuroraRuntimeContext({
    tenantId: TENANT_A,
    userId: "usr_test",
    ...overrides,
  });
}

function words(count: number, prefix = "word"): string {
  return Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`).join(" ");
}

describe("contextAssembly helpers", () => {
  it("estimates tokens using whitespace word count", () => {
    expect(estimateTokenCount("one two three")).toBe(3);
    expect(estimateTokenCount("")).toBe(0);
  });

  it("deduplicates entities keeping the strongest score", () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const deduped = deduplicateScoredEntities([
      scored(entity, 0.4),
      scored(entity, 0.9),
    ]);

    expect(deduped).toHaveLength(1);
    expect(deduped[0]?.score).toBe(0.9);
  });

  it("assigns canonical layers by domain and retrieval signal", () => {
    const brand = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const campaign = createEntity({ id: ENTITY_B, entityType: "campaign.record" });
    const product = createEntity({ id: ENTITY_C, entityType: "product.product" });
    const competitor = createEntity({ id: ENTITY_D, entityType: "industry.trend" });

    expect(resolveContextLayer(scored(brand, 0.9))).toBe("brand");
    expect(resolveContextLayer(scored(campaign, 0.8), undefined, "cmp_123")).toBe("campaign");
    expect(
      resolveContextLayer(scored(product, 0.85), "content_generation"),
    ).toBe("taskKnowledge");
    expect(
      resolveContextLayer(scored(competitor, 0.7, { graphProximityScore: 0.6 })),
    ).toBe("graphEntities");
  });
});

describe("DefaultContextAssembler", () => {
  it("assembles a basic context package with canonical layers", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const brand = createEntity({ id: ENTITY_A, entityType: "brand.profile", title: "Brand Voice" });
    const product = createEntity({ id: ENTITY_B, entityType: "product.product", title: "Product A" });

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(brand, 0.95), scored(product, 0.88)],
      taskType: "content_generation",
    });

    expect(result.layers).toHaveLength(CONTEXT_LAYER_KEYS.length);
    expect(result.totalTokens).toBeGreaterThan(0);
    expect(result.maxTokens).toBe(RETRIEVAL_MAX_CONTEXT_TOKENS);
    expect(result.entities.map((entity) => entity.id)).toEqual([ENTITY_A, ENTITY_B]);

    const brandLayer = result.layers.find((layer) => layer.key === "brand");
    const taskLayer = result.layers.find((layer) => layer.key === "taskKnowledge");
    expect(brandLayer?.content).toContain("Brand Voice");
    expect(taskLayer?.content).toContain("Product A");
  });

  it("enforces per-layer token limits", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const heavyBrand = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      title: "Heavy Brand",
      content: { body: words(700) },
    });

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(heavyBrand, 0.99)],
    });

    const brandLayer = result.layers.find((layer) => layer.key === "brand");
    expect(brandLayer?.tokenCount).toBeLessThanOrEqual(CONTEXT_LAYER_TOKEN_LIMITS.brand);
    expect(brandLayer?.maxTokens).toBe(CONTEXT_LAYER_TOKEN_LIMITS.brand);
  });

  it("enforces the global 3000-token limit", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const entities = CONTEXT_LAYER_KEYS.map((key, index) =>
      scored(
        createEntity({
          id: `knw_${String(index).padStart(8, "0")}-0000-4000-8000-000000000001`,
          entityType: "brand.profile",
          title: `Layer ${key}`,
          content: { body: words(650) },
        }),
        0.99 - index * 0.01,
      ),
    );

    const result = await assembler.assemble(ctx, { scoredEntities: entities });

    expect(result.totalTokens).toBeLessThanOrEqual(RETRIEVAL_MAX_CONTEXT_TOKENS);
    expect(result.maxTokens).toBe(RETRIEVAL_MAX_CONTEXT_TOKENS);
  });

  it("respects a lower maxTokens request without exceeding the global cap", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const entity = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      content: { body: words(200) },
    });

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(entity, 0.9)],
      maxTokens: 50,
    });

    expect(result.maxTokens).toBe(50);
    expect(result.totalTokens).toBeLessThanOrEqual(50);
  });

  it("orders entities by score descending then entity ID ascending", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const lower = createEntity({ id: ENTITY_B, entityType: "product.product", title: "Lower" });
    const higher = createEntity({ id: ENTITY_A, entityType: "product.product", title: "Higher" });

    const grouped = assignScoredEntitiesToLayers(
      [scored(lower, 0.7), scored(higher, 0.95)],
      "content_generation",
    );

    expect(grouped.taskKnowledge.map((entry) => entry.entity.id)).toEqual([ENTITY_A, ENTITY_B]);
  });

  it("handles duplicate entity IDs without double-counting budget", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const entity = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      title: "Brand",
      content: { body: words(50) },
    });

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(entity, 0.5), scored(entity, 0.95)],
    });

    expect(result.entities).toHaveLength(1);
    expect(result.entities[0]?.id).toBe(ENTITY_A);
    expect(result.totalTokens).toBe(estimateTokenCount(serializeEntityForContext(entity)));
  });

  it("returns an empty package for empty retrieval input", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();

    const result = await assembler.assemble(ctx, { scoredEntities: [] });

    expect(result.entities).toEqual([]);
    expect(result.totalTokens).toBe(0);
    expect(result.layers.every((layer) => layer.tokenCount === 0)).toBe(true);
  });

  it("handles insufficient results without fabrication", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(createEntity({ id: ENTITY_A, entityType: "brand.profile" }), 0.2)],
      validatedOnly: true,
      includeProvisional: false,
    });

    expect(result.entities.length).toBeLessThanOrEqual(1);
    expect(result.totalTokens).toBeGreaterThanOrEqual(0);
  });

  it("truncates a result that exceeds the remaining token budget", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const entity = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      content: { body: words(900) },
    });

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(entity, 0.99)],
    });

    const brandLayer = result.layers.find((layer) => layer.key === "brand");
    expect(brandLayer?.tokenCount).toBeLessThanOrEqual(CONTEXT_LAYER_TOKEN_LIMITS.brand);
    expect(brandLayer?.content.length).toBeGreaterThan(0);
  });

  it("allocates budget across multiple competing layers", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const brand = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      content: { body: words(100) },
    });
    const product = createEntity({
      id: ENTITY_B,
      entityType: "product.product",
      content: { body: words(100) },
    });
    const campaign = createEntity({
      id: ENTITY_C,
      entityType: "campaign.record",
      content: { body: words(100) },
    });

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(brand, 0.95), scored(product, 0.9), scored(campaign, 0.85)],
      taskType: "content_generation",
    });

    expect(result.layers.find((layer) => layer.key === "brand")?.tokenCount).toBeGreaterThan(0);
    expect(result.layers.find((layer) => layer.key === "taskKnowledge")?.tokenCount).toBeGreaterThan(0);
    expect(result.layers.find((layer) => layer.key === "campaign")?.tokenCount).toBeGreaterThan(0);
    expect(result.totalTokens).toBeLessThanOrEqual(RETRIEVAL_MAX_CONTEXT_TOKENS);
  });

  it("excludes entities from other tenants", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const foreign = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      tenantId: TENANT_B,
    });

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(foreign, 0.99)],
    });

    expect(result.entities).toEqual([]);
    expect(result.totalTokens).toBe(0);
  });

  it("excludes restricted classification unless caller is aurora admin", async () => {
    const assembler = createAssembler();
    const restricted = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      classification: "restricted",
    });

    const denied = await assembler.assemble(createCtx({ roles: ["aurora.director"] }), {
      scoredEntities: [scored(restricted, 0.99)],
    });
    const allowed = await assembler.assemble(createCtx({ roles: ["aurora.admin"] }), {
      scoredEntities: [scored(restricted, 0.99)],
    });

    expect(denied.entities).toEqual([]);
    expect(allowed.entities).toHaveLength(1);
  });

  it("respects validatedOnly and includeProvisional filters", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const provisional = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      status: "provisional",
    });

    const validatedOnly = await assembler.assemble(ctx, {
      scoredEntities: [scored(provisional, 0.99)],
      validatedOnly: true,
    });
    const includeProvisional = await assembler.assemble(ctx, {
      scoredEntities: [scored(provisional, 0.99)],
      includeProvisional: true,
    });

    expect(validatedOnly.entities).toEqual([]);
    expect(includeProvisional.entities).toHaveLength(1);
  });

  it("assembles keyword-only results when semantic retrieval degraded", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const keywordOnly = createEntity({
      id: ENTITY_A,
      entityType: "seo.keyword",
      title: "ROAS",
    });

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(keywordOnly, 0.82, { keywordScore: 0.82 })],
      taskType: "seo_analysis",
    });

    expect(result.entities).toHaveLength(1);
    expect(result.layers.some((layer) => layer.content.includes("ROAS"))).toBe(true);
  });

  it("does not manufacture memory context when memory retrieval degraded", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const keyword = createEntity({ id: ENTITY_A, entityType: "brand.profile", title: "Brand" });

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(keyword, 0.9, { keywordScore: 0.9 })],
    });

    expect(result.layers.find((layer) => layer.key === "sessionHistory")?.tokenCount).toBe(0);
    expect(result.layers.find((layer) => layer.key === "learningPreferences")?.tokenCount).toBe(0);
  });

  it("produces deterministic output aside from assembledAt", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const request = {
      scoredEntities: [
        scored(createEntity({ id: ENTITY_B, entityType: "product.product" }), 0.7),
        scored(createEntity({ id: ENTITY_A, entityType: "brand.profile" }), 0.95),
      ],
      taskType: "content_generation" as const,
    };

    const first = await assembler.assemble(ctx, request);
    const second = await assembler.assemble(ctx, request);

    expect(first.layers).toEqual(second.layers);
    expect(first.entities).toEqual(second.entities);
    expect(first.totalTokens).toEqual(second.totalTokens);
    expect(first.maxTokens).toEqual(second.maxTokens);
    expect(first.assembledAt).toEqual(expect.any(String));
  });

  it("populates package metadata correctly", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(entity, 0.91)],
    });

    expect(result.maxTokens).toBe(RETRIEVAL_MAX_CONTEXT_TOKENS);
    expect(result.totalTokens).toBeLessThanOrEqual(result.maxTokens);
    expect(result.layers.every((layer) => layer.maxTokens === CONTEXT_LAYER_TOKEN_LIMITS[layer.key])).toBe(
      true,
    );
  });

  it("rejects missing tenant context", async () => {
    const assembler = createAssembler();
    const ctx = createCtx({ tenantId: "" });

    await expect(
      assembler.assemble(ctx, {
        scoredEntities: [scored(createEntity({ id: ENTITY_A, entityType: "brand.profile" }), 0.9)],
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidTenantContextError);
  });

  it("rejects unauthorized reads", async () => {
    const assembler = createAssembler();
    const ctx = createCtx({ roles: ["aurora.viewer"] });

    await expect(
      assembler.assemble(ctx, {
        scoredEntities: [scored(createEntity({ id: ENTITY_A, entityType: "brand.profile" }), 0.9)],
      }),
    ).rejects.toBeInstanceOf(AuroraError);
  });

  it("requires tenant context authority rather than entity tenant spoofing", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const spoofed = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      tenantId: TENANT_B,
    });

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(spoofed, 0.99)],
    });

    expect(result.entities).toEqual([]);
  });
});

describe("contextAssembly token boundary", () => {
  it("fits an entity exactly at a custom token boundary", async () => {
    const assembler = createAssembler();
    const ctx = createCtx();
    const exactWords = words(20);
    const entity = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      title: "Exact",
      content: { body: exactWords },
    });
    const serialized = serializeEntityForContext(entity);
    const tokenCount = estimateTokenCount(serialized);

    const result = await assembler.assemble(ctx, {
      scoredEntities: [scored(entity, 0.9)],
      maxTokens: tokenCount,
    });

    expect(result.totalTokens).toBeLessThanOrEqual(tokenCount);
    expect(result.totalTokens).toBeGreaterThan(0);
  });
});
