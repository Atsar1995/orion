import { describe, expect, it } from "vitest";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";
import {
  CITATION_EXCERPT_MAX_TOKENS,
  DefaultCitationBuilder,
} from "@/lib/aurora/knowledge/retrieval/CitationBuilder";
import { estimateTokenCount } from "@/lib/aurora/knowledge/retrieval/contextAssembly";
import {
  CONTEXT_LAYER_TOKEN_LIMITS,
  RETRIEVAL_MAX_CONTEXT_TOKENS,
  type ContextPackage,
  type ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const ENTITY_A = "knw_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const ENTITY_B = "knw_bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ENTITY_C = "knw_cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const ASSEMBLED_AT = "2026-09-04T00:00:00.000Z";

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

function scored(entity: KnowledgeEntity, score: number, extras: Partial<ScoredEntity> = {}): ScoredEntity {
  return { entity, score, ...extras };
}

function createContextPackage(entities: readonly KnowledgeEntity[]): ContextPackage {
  return {
    layers: [],
    totalTokens: 0,
    maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
    entities,
    assembledAt: ASSEMBLED_AT,
  };
}

describe("DefaultCitationBuilder", () => {
  const builder = new DefaultCitationBuilder();

  it("builds a citation from a valid scored context entity", () => {
    const entity = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      title: "Brand Voice",
      content: { note: "tone guidance" },
    });
    const citations = builder.build({
      scoredEntities: [scored(entity, 0.91)],
      contextPackage: createContextPackage([entity]),
    });

    expect(citations).toHaveLength(1);
    expect(citations[0]).toEqual({
      entityId: ENTITY_A,
      domain: entity.domain,
      entityType: "brand.profile",
      title: "Brand Voice",
      excerpt: expect.stringContaining("Brand Voice"),
      confidence: 0.91,
      sourceType: "source.human.brand_manager",
      retrievedAt: ASSEMBLED_AT,
    });
  });

  it("orders multiple citations deterministically by score desc then entity id asc", () => {
    const entityA = createEntity({ id: ENTITY_A, entityType: "brand.profile", title: "A" });
    const entityB = createEntity({ id: ENTITY_B, entityType: "brand.profile", title: "B" });
    const entityC = createEntity({ id: ENTITY_C, entityType: "brand.profile", title: "C" });

    const firstPass = builder.build({
      scoredEntities: [
        scored(entityA, 0.7),
        scored(entityB, 0.9),
        scored(entityC, 0.9),
      ],
      contextPackage: createContextPackage([entityA, entityB, entityC]),
    });
    const secondPass = builder.build({
      scoredEntities: [
        scored(entityC, 0.9),
        scored(entityA, 0.7),
        scored(entityB, 0.9),
      ],
      contextPackage: createContextPackage([entityC, entityA, entityB]),
    });

    expect(firstPass.map((citation) => citation.entityId)).toEqual([ENTITY_B, ENTITY_C, ENTITY_A]);
    expect(secondPass.map((citation) => citation.entityId)).toEqual(firstPass.map((citation) => citation.entityId));
  });

  it("returns an empty array when context assembly produced no entities", () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });

    expect(
      builder.build({
        scoredEntities: [scored(entity, 0.95)],
        contextPackage: createContextPackage([]),
      }),
    ).toEqual([]);
  });

  it("does not fabricate citations for scored entities excluded from context", () => {
    const included = createEntity({ id: ENTITY_A, entityType: "brand.profile", title: "Included" });
    const excluded = createEntity({ id: ENTITY_B, entityType: "brand.profile", title: "Excluded" });

    const citations = builder.build({
      scoredEntities: [scored(included, 0.95), scored(excluded, 0.99)],
      contextPackage: createContextPackage([included]),
    });

    expect(citations).toHaveLength(1);
    expect(citations[0]?.entityId).toBe(ENTITY_A);
  });

  it("uses the existing KnowledgeCitation contract fields only", () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const citation = builder.build({
      scoredEntities: [scored(entity, 0.8)],
      contextPackage: createContextPackage([entity]),
    })[0];

    expect(citation).toBeDefined();
    expect(Object.keys(citation ?? {}).sort()).toEqual([
      "confidence",
      "domain",
      "entityId",
      "entityType",
      "excerpt",
      "retrievedAt",
      "sourceType",
      "title",
    ]);
  });

  it("keeps tenant-scoped entity identifiers without cross-tenant fabrication", () => {
    const tenantEntity = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      tenantId: TENANT_A,
    });

    const citations = builder.build({
      scoredEntities: [scored(tenantEntity, 0.85)],
      contextPackage: createContextPackage([tenantEntity]),
    });

    expect(citations[0]?.entityId).toBe(ENTITY_A);
    expect(citations[0]?.title).toBe(tenantEntity.title);
  });

  it("does not cite provisional entities when they are absent from assembled context", () => {
    const provisional = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      status: "provisional",
      title: "Provisional",
    });

    const citations = builder.build({
      scoredEntities: [scored(provisional, 0.99)],
      contextPackage: createContextPackage([]),
    });

    expect(citations).toEqual([]);
  });

  it("does not expose restricted entities when they are absent from assembled context", () => {
    const restricted = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      classification: "restricted",
      title: "Restricted guidance",
      content: { secret: "restricted payload" },
    });

    const citations = builder.build({
      scoredEntities: [scored(restricted, 0.99)],
      contextPackage: createContextPackage([]),
    });

    expect(citations).toEqual([]);
  });

  it("supports keyword-only scored entities when present in assembled context", () => {
    const entity = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      title: "Keyword match",
    });

    const citations = builder.build({
      scoredEntities: [scored(entity, 0.72, { keywordScore: 0.72, semanticScore: undefined })],
      contextPackage: createContextPackage([entity]),
    });

    expect(citations).toHaveLength(1);
    expect(citations[0]?.confidence).toBe(0.72);
  });

  it("does not fabricate citations for memory-only signals without assembled entities", () => {
    const memoryEntity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });

    const citations = builder.build({
      scoredEntities: [scored(memoryEntity, 0.6, { memoryRelevanceScore: 0.6 })],
      contextPackage: createContextPackage([]),
    });

    expect(citations).toEqual([]);
  });

  it("does not change retrieval scores when building citations", () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const scoredEntities = [scored(entity, 0.88)];

    builder.build({
      scoredEntities,
      contextPackage: createContextPackage([entity]),
    });

    expect(scoredEntities[0]?.score).toBe(0.88);
  });

  it("does not mutate context package entities during citation building", () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile", title: "Stable" });
    const contextPackage = createContextPackage([entity]);
    const snapshot = structuredClone(contextPackage);

    builder.build({
      scoredEntities: [scored(entity, 0.9)],
      contextPackage,
    });

    expect(contextPackage).toEqual(snapshot);
  });

  it("bounds excerpt size using the citation token budget", () => {
    const longContent = {
      note: Array.from({ length: 200 }, (_, index) => `word${index + 1}`).join(" "),
    };
    const entity = createEntity({
      id: ENTITY_A,
      entityType: "brand.profile",
      title: "Long entity",
      content: longContent,
    });

    const citation = builder.build({
      scoredEntities: [scored(entity, 0.9)],
      contextPackage: createContextPackage([entity]),
    })[0];

    expect(citation).toBeDefined();
    expect(estimateTokenCount(citation?.excerpt ?? "")).toBeLessThanOrEqual(
      CITATION_EXCERPT_MAX_TOKENS,
    );
  });

  it("ignores context layer metadata when building citations", () => {
    const entity = createEntity({ id: ENTITY_A, entityType: "brand.profile" });
    const contextPackage: ContextPackage = {
      layers: [
        {
          key: "brand",
          content: "layer content should not become citation",
          tokenCount: 5,
          maxTokens: CONTEXT_LAYER_TOKEN_LIMITS.brand,
        },
      ],
      totalTokens: 5,
      maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
      entities: [entity],
      assembledAt: ASSEMBLED_AT,
    };

    const citation = builder.build({
      scoredEntities: [scored(entity, 0.75)],
      contextPackage,
    })[0];

    expect(citation?.excerpt).not.toContain("layer content should not become citation");
    expect(citation?.excerpt).toContain(entity.title);
  });
});
