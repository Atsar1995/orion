import type { EmbeddingProvider } from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import {
  DeterministicEmbeddingProvider,
  type EmbeddingService,
} from "@/lib/aurora/knowledge/services";
import { buildRetrievalQueryFromRequest } from "@/lib/aurora/knowledge/services/retrievalOrchestration";
import type {
  RetrievalQuery,
  RetrievalRequest,
  RetrievalResult,
  ScoredEntity,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import {
  createInMemoryKnowledgeRetrievalStack,
  createKnowledgeEntity,
  type InMemoryKnowledgeRetrievalStack,
} from "@/tests/aurora/helpers/knowledgeSecurityFixtures";

export const ACCURACY_TENANT_A = "550e8400-e29b-41d4-a716-446655440001" as const;
export const ACCURACY_TENANT_B = "550e8400-e29b-41d4-a716-446655440002" as const;
export const ACCURACY_BRAND_A = "770e8400-e29b-41d4-a716-446655440003" as const;

export const HYBRID_GUIDELINE_IDS = [
  "knw_10000000-0000-4000-8000-000000000001",
  "knw_20000000-0000-4000-8000-000000000002",
  "knw_30000000-0000-4000-8000-000000000003",
] as const;

export const HYBRID_DISTRACTOR_IDS = [
  "knw_40000000-0000-4000-8000-000000000004",
  "knw_50000000-0000-4000-8000-000000000005",
  "knw_60000000-0000-4000-8000-000000000006",
  "knw_70000000-0000-4000-8000-000000000007",
  "knw_80000000-0000-4000-8000-000000000008",
] as const;

export const SEMANTIC_TARGET_PRODUCT_ID = "knw_a0000000-0000-4000-8000-00000000000a" as const;
export const SEMANTIC_DISTRACTOR_PRODUCT_IDS = [
  "knw_b0000000-0000-4000-8000-00000000000b",
  "knw_c0000000-0000-4000-8000-00000000000c",
  "knw_d0000000-0000-4000-8000-00000000000d",
  "knw_e0000000-0000-4000-8000-00000000000e",
  "knw_f0000000-0000-4000-8000-00000000000f",
  "knw_01000000-0000-4000-8000-000000000010",
  "knw_02000000-0000-4000-8000-000000000011",
] as const;

export const SEMANTIC_PARAPHRASE_CANONICAL_KEY = "gate18-orion-premium-widget-semantic-anchor" as const;
export const SEMANTIC_PARAPHRASE_TARGET_TITLE = "Orion Premium Widget Pro" as const;
export const SEMANTIC_PARAPHRASE_TARGET_CONTENT = {
  description: "Ultra durable aerospace alloy construction for enterprise deployments",
} as const;
export const SEMANTIC_PARAPHRASE_QUERY =
  "durable aerospace alloy enterprise widget from the Orion product line" as const;

export const ROAS_CAMPAIGN_IDS = [
  "knw_11000000-0000-4000-8000-000000000012",
  "knw_12000000-0000-4000-8000-000000000013",
] as const;

export const NON_ROAS_CAMPAIGN_IDS = [
  "knw_13000000-0000-4000-8000-000000000014",
  "knw_14000000-0000-4000-8000-000000000015",
  "knw_15000000-0000-4000-8000-000000000016",
] as const;

export const GRAPH_CAMPAIGN_ID = "knw_16000000-0000-4000-8000-000000000017" as const;
export const GRAPH_PRODUCT_ID = "knw_17000000-0000-4000-8000-000000000018" as const;

export const CONFIDENCE_HIGH_QUERY = "gate18 rich brand voice knowledge anchor" as const;

export const CONFIDENCE_CAMPAIGN_ID = "knw_18000000-0000-4000-8000-000000000019" as const;
export const CONFIDENCE_GUIDELINE_IDS = [
  "knw_19000000-0000-4000-8000-00000000001a",
  "knw_1a000000-0000-4000-8000-00000000001b",
  "knw_1b000000-0000-4000-8000-00000000001c",
  "knw_1c000000-0000-4000-8000-00000000001d",
  "knw_1d000000-0000-4000-8000-00000000001e",
  "knw_1e000000-0000-4000-8000-00000000001f",
] as const;

export const EMBEDDING_INDEX_ENTITY_ID = "knw_1f000000-0000-4000-8000-000000000020" as const;
export const EMBEDDING_INDEX_TENANT_B_ENTITY_ID = "knw_20000000-0000-4000-8000-000000000022" as const;

let uniqueQueryCounter = 0;

export function uniqueQuery(base: string): string {
  uniqueQueryCounter += 1;
  return `${base} gate18-${uniqueQueryCounter.toString(16)}`;
}

export function adminAccuracyCtx(
  overrides: Partial<AuroraRuntimeContext> = {},
): AuroraRuntimeContext {
  return createTestAuroraRuntimeContext({
    tenantId: ACCURACY_TENANT_A,
    userId: "usr_gate18_admin",
    brandId: ACCURACY_BRAND_A,
    roles: ["aurora.admin"],
    auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    ...overrides,
  });
}

export function tenantBAccuracyCtx(
  overrides: Partial<AuroraRuntimeContext> = {},
): AuroraRuntimeContext {
  return createTestAuroraRuntimeContext({
    tenantId: ACCURACY_TENANT_B,
    userId: "usr_gate18_tenant_b",
    brandId: ACCURACY_BRAND_A,
    roles: ["aurora.admin"],
    auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    ...overrides,
  });
}

export function topEntityIds(
  scored: readonly ScoredEntity[],
  count: number,
): readonly string[] {
  return scored.slice(0, count).map((entry) => entry.entity.id);
}

export function topEntityIdsFromPreflight(
  result: RetrievalResult,
  ranked: readonly ScoredEntity[],
  count: number,
): readonly string[] {
  void result;
  return topEntityIds(ranked, count);
}

export function buildAccuracySearchQuery(
  ctx: AuroraRuntimeContext,
  request: RetrievalRequest,
): RetrievalQuery {
  return buildRetrievalQueryFromRequest(ctx, request);
}

export async function searchWithRequest(
  stack: InMemoryKnowledgeRetrievalStack,
  ctx: AuroraRuntimeContext,
  request: RetrievalRequest,
): Promise<readonly ScoredEntity[]> {
  return stack.retrievalService.search(ctx, buildAccuracySearchQuery(ctx, request));
}

/**
 * Maps explicit Gate 18 paraphrase fixture pairs to one deterministic embedding key.
 * Unrelated text passes through unchanged.
 */
/** Maps the rich-brand KB fixture query and indexed content to one embedding key. */
export class RichBrandKbEmbeddingProvider implements EmbeddingProvider {
  private readonly inner = new DeterministicEmbeddingProvider();

  private normalize(text: string): string {
    if (text.includes(CONFIDENCE_HIGH_QUERY)) {
      return CONFIDENCE_HIGH_QUERY;
    }
    return text;
  }

  async embed(text: string, _metadata?: unknown): Promise<readonly number[]> {
    return this.inner.embed(this.normalize(text));
  }

  async embedBatch(texts: readonly string[]): Promise<readonly (readonly number[])[]> {
    return Promise.all(texts.map((text) => this.embed(text)));
  }
}

export class ParaphraseNormalizationEmbeddingProvider implements EmbeddingProvider {
  private readonly inner = new DeterministicEmbeddingProvider();

  constructor(
    private readonly canonicalKey: string = SEMANTIC_PARAPHRASE_CANONICAL_KEY,
    private readonly canonicalMarkers: readonly string[] = [SEMANTIC_PARAPHRASE_TARGET_TITLE],
    private readonly paraphraseMarkers: readonly string[] = [SEMANTIC_PARAPHRASE_QUERY],
  ) {}

  private normalize(text: string): string {
    const trimmed = text.trim();
    if (trimmed === this.canonicalKey) {
      return this.canonicalKey;
    }

    for (const marker of this.canonicalMarkers) {
      if (trimmed.includes(marker)) {
        return this.canonicalKey;
      }
    }

    for (const marker of this.paraphraseMarkers) {
      if (trimmed === marker || trimmed.includes(marker)) {
        return this.canonicalKey;
      }
    }

    return text;
  }

  async embed(text: string, _metadata?: unknown): Promise<readonly number[]> {
    return this.inner.embed(this.normalize(text));
  }

  async embedBatch(texts: readonly string[]): Promise<readonly (readonly number[])[]> {
    return Promise.all(texts.map((text) => this.embed(text)));
  }
}

export function createAccuracyStack(
  repository: InMemoryKnowledgeRepository = new InMemoryKnowledgeRepository(),
  embeddingProvider: EmbeddingProvider = new DeterministicEmbeddingProvider(),
): InMemoryKnowledgeRetrievalStack {
  return createInMemoryKnowledgeRetrievalStack(repository, embeddingProvider);
}

export async function seedBrandGuideline(
  repository: InMemoryKnowledgeRepository,
  id: string,
  title: string,
  content: Record<string, unknown> = { guidance: `${title} brand voice guidance` },
): Promise<void> {
  await repository.create(
    ACCURACY_TENANT_A,
    createKnowledgeEntity(ACCURACY_TENANT_A, ACCURACY_BRAND_A, {
      id,
      entityType: "brand.guideline",
      status: "validated",
      title,
      content,
    }),
  );
}

export async function seedHybridSearchRelevanceDataset(
  repository: InMemoryKnowledgeRepository,
): Promise<void> {
  await seedBrandGuideline(
    repository,
    HYBRID_GUIDELINE_IDS[0]!,
    "Brand voice guidelines — tone and lexicon",
    { guidance: "Defines brand voice guidelines for enterprise messaging" },
  );
  await seedBrandGuideline(
    repository,
    HYBRID_GUIDELINE_IDS[1]!,
    "Brand voice guidelines — editorial standards",
    { guidance: "Editorial brand voice guidelines for campaigns" },
  );
  await seedBrandGuideline(
    repository,
    HYBRID_GUIDELINE_IDS[2]!,
    "Brand voice guidelines — executive communications",
    { guidance: "Executive brand voice guidelines and phrasing" },
  );

  const distractors: Array<{ id: string; entityType: "campaign.record" | "product.product"; title: string }> = [
    { id: HYBRID_DISTRACTOR_IDS[0]!, entityType: "campaign.record", title: "Q4 paid social launch plan" },
    { id: HYBRID_DISTRACTOR_IDS[1]!, entityType: "campaign.record", title: "Retail holiday merchandising calendar" },
    { id: HYBRID_DISTRACTOR_IDS[2]!, entityType: "product.product", title: "Orion analytics dashboard SKU" },
    { id: HYBRID_DISTRACTOR_IDS[3]!, entityType: "product.product", title: "Enterprise onboarding toolkit" },
    { id: HYBRID_DISTRACTOR_IDS[4]!, entityType: "campaign.record", title: "Partner co-marketing brief" },
  ];

  for (const distractor of distractors) {
    await repository.create(
      ACCURACY_TENANT_A,
      createKnowledgeEntity(ACCURACY_TENANT_A, ACCURACY_BRAND_A, {
        id: distractor.id,
        entityType: distractor.entityType,
        status: "validated",
        title: distractor.title,
        content: { note: "Peripheral knowledge without brand voice emphasis" },
      }),
    );
  }
}

export async function seedSemanticParaphraseDataset(
  repository: InMemoryKnowledgeRepository,
): Promise<void> {
  await repository.create(
    ACCURACY_TENANT_A,
    createKnowledgeEntity(ACCURACY_TENANT_A, ACCURACY_BRAND_A, {
      id: SEMANTIC_TARGET_PRODUCT_ID,
      entityType: "product.product",
      status: "validated",
      title: SEMANTIC_PARAPHRASE_TARGET_TITLE,
      content: SEMANTIC_PARAPHRASE_TARGET_CONTENT,
    }),
  );

  const distractorTitles = [
    "Orion analytics suite",
    "Orion logistics tracker",
    "Orion compliance toolkit",
    "Orion customer portal",
    "Orion inventory scanner",
    "Orion billing adapter",
    "Orion support console",
  ];

  for (const [index, id] of SEMANTIC_DISTRACTOR_PRODUCT_IDS.entries()) {
    await repository.create(
      ACCURACY_TENANT_A,
      createKnowledgeEntity(ACCURACY_TENANT_A, ACCURACY_BRAND_A, {
        id,
        entityType: "product.product",
        status: "validated",
        title: distractorTitles[index] ?? `Orion distractor product ${index}`,
        content: { description: "General Orion platform accessory without aerospace alloy focus" },
      }),
    );
  }
}

export async function seedCampaignWithRoas(
  repository: InMemoryKnowledgeRepository,
  id: string,
  title: string,
): Promise<void> {
  await repository.create(
    ACCURACY_TENANT_A,
    createKnowledgeEntity(ACCURACY_TENANT_A, ACCURACY_BRAND_A, {
      id,
      entityType: "campaign.channel_performance",
      status: "validated",
      title,
      content: { metric: "performance summary" },
    }),
  );
}

export async function seedKeywordExactMatchDataset(
  repository: InMemoryKnowledgeRepository,
): Promise<void> {
  await seedCampaignWithRoas(
    repository,
    ROAS_CAMPAIGN_IDS[0]!,
    "Spring prospecting ROAS optimization",
  );
  await seedCampaignWithRoas(
    repository,
    ROAS_CAMPAIGN_IDS[1]!,
    "Retargeting ROAS benchmark report",
  );

  const nonRoasTitles = [
    "Brand awareness lift study",
    "Creative testing velocity report",
    "Audience expansion pilot results",
  ];

  for (const [index, id] of NON_ROAS_CAMPAIGN_IDS.entries()) {
    await repository.create(
      ACCURACY_TENANT_A,
      createKnowledgeEntity(ACCURACY_TENANT_A, ACCURACY_BRAND_A, {
        id,
        entityType: "campaign.record",
        status: "validated",
        title: nonRoasTitles[index] ?? `Campaign record ${index}`,
        content: { note: "Campaign performance without ROAS headline" },
      }),
    );
  }
}

export type CampaignProductGraphSeed = {
  readonly campaignId: string;
  readonly productId: string;
};

export async function seedCampaignProductGraph(
  repository: InMemoryKnowledgeRepository,
  campaignId: string = GRAPH_CAMPAIGN_ID,
  productId: string = GRAPH_PRODUCT_ID,
): Promise<CampaignProductGraphSeed> {
  await repository.create(
    ACCURACY_TENANT_A,
    createKnowledgeEntity(ACCURACY_TENANT_A, ACCURACY_BRAND_A, {
      id: campaignId,
      entityType: "campaign.record",
      status: "validated",
      title: "Gate18 flagship acquisition campaign performance",
      content: { objective: "Drive qualified campaign product demand" },
    }),
  );

  await repository.create(
    ACCURACY_TENANT_A,
    createKnowledgeEntity(ACCURACY_TENANT_A, ACCURACY_BRAND_A, {
      id: productId,
      entityType: "product.product",
      status: "validated",
      title: "Orion flagship campaign product bundle",
      content: { description: "Primary product referenced by the campaign graph edge" },
    }),
  );

  await repository.saveRelationship(ACCURACY_TENANT_A, {
    id: "rel_gate18_campaign_product",
    tenantId: ACCURACY_TENANT_A,
    sourceEntityId: campaignId,
    targetEntityId: productId,
    relationshipType: "references_product",
    weight: 0.85,
    metadata: {},
    createdAt: "2026-08-27T00:00:00.000Z",
  });

  return { campaignId, productId };
}

export type RichBrandKbSeed = {
  readonly campaignId: string;
  readonly guidelineIds: readonly string[];
  readonly query: string;
};

export async function seedRichBrandKb(
  repository: InMemoryKnowledgeRepository,
  embeddingService: EmbeddingService,
  ctx: AuroraRuntimeContext,
): Promise<RichBrandKbSeed> {
  const query = CONFIDENCE_HIGH_QUERY;

  await repository.create(
    ACCURACY_TENANT_A,
    createKnowledgeEntity(ACCURACY_TENANT_A, ACCURACY_BRAND_A, {
      id: CONFIDENCE_CAMPAIGN_ID,
      entityType: "campaign.record",
      status: "validated",
      title: `${query} campaign hub`,
      content: { note: `${query} campaign context hub` },
    }),
  );

  for (const [index, id] of CONFIDENCE_GUIDELINE_IDS.entries()) {
    const title = `${query} brand guideline ${index + 1}`;
    await seedBrandGuideline(repository, id, title, {
      guidance: `${query} validated brand voice guidance block ${index + 1}`,
    });

    await repository.saveRelationship(ACCURACY_TENANT_A, {
      id: `rel_gate18_confidence_${index}`,
      tenantId: ACCURACY_TENANT_A,
      sourceEntityId: CONFIDENCE_CAMPAIGN_ID,
      targetEntityId: id,
      relationshipType: "informed_by",
      weight: 0.9,
      metadata: {},
      createdAt: "2026-08-27T00:00:00.000Z",
    });

    await embeddingService.indexEntity(ctx, id);
  }

  await embeddingService.indexEntity(ctx, CONFIDENCE_CAMPAIGN_ID);

  return {
    campaignId: CONFIDENCE_CAMPAIGN_ID,
    guidelineIds: CONFIDENCE_GUIDELINE_IDS,
    query,
  };
}

export async function indexEntities(
  embeddingService: EmbeddingService,
  ctx: AuroraRuntimeContext,
  entityIds: readonly string[],
): Promise<void> {
  for (const entityId of entityIds) {
    await embeddingService.indexEntity(ctx, entityId);
  }
}
