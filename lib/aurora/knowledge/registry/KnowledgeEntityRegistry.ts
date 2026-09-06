import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";

/** Registry metadata for a canonical knowledge entity type (ES-AURORA-007 §2.2 · Appendix A). */
export interface KnowledgeEntityRegistryDefinition {
  readonly entityType: string;
  readonly domain?: KnowledgeDomain;
  readonly phase: 1 | 2;
  readonly description?: string;
}

type CatalogDomain =
  | "Brand"
  | "Product"
  | "Campaign"
  | "Customer"
  | "Competitor"
  | "Industry"
  | "SEO"
  | "Advertising"
  | "Content"
  | "Market"
  | "Executive";

type CatalogEntry = {
  readonly domain: CatalogDomain;
  readonly entityType: string;
  readonly phase: 1 | 2;
};

const KNOWLEDGE_DOMAIN_BY_CATALOG_DOMAIN: Readonly<Record<CatalogDomain, KnowledgeDomain>> = {
  Brand: "knowledge.brand",
  Product: "knowledge.product",
  Campaign: "knowledge.campaign",
  Customer: "knowledge.customer",
  Competitor: "knowledge.competitor",
  Industry: "knowledge.industry",
  SEO: "knowledge.seo",
  Advertising: "knowledge.ads",
  Content: "knowledge.content",
  Market: "knowledge.market",
  Executive: "knowledge.executive",
};

/** Appendix A catalogue rows 1–44 (ES-AURORA-007). */
const APPENDIX_A_CATALOG: readonly CatalogEntry[] = [
  { domain: "Brand", entityType: "brand.profile", phase: 1 },
  { domain: "Brand", entityType: "brand.guideline", phase: 1 },
  { domain: "Brand", entityType: "brand.visual_identity", phase: 1 },
  { domain: "Brand", entityType: "brand.messaging_pillar", phase: 1 },
  { domain: "Brand", entityType: "brand.approval_policy", phase: 1 },
  { domain: "Product", entityType: "product.product", phase: 1 },
  { domain: "Product", entityType: "product.feature", phase: 1 },
  { domain: "Product", entityType: "product.pricing", phase: 1 },
  { domain: "Product", entityType: "product.audience", phase: 1 },
  { domain: "Campaign", entityType: "campaign.record", phase: 1 },
  { domain: "Campaign", entityType: "campaign.lesson", phase: 1 },
  { domain: "Campaign", entityType: "campaign.channel_performance", phase: 1 },
  { domain: "Campaign", entityType: "campaign.optimization", phase: 1 },
  { domain: "Customer", entityType: "customer.segment", phase: 2 },
  { domain: "Customer", entityType: "customer.persona", phase: 2 },
  { domain: "Customer", entityType: "customer.engagement_pattern", phase: 2 },
  { domain: "Customer", entityType: "customer.retention_insight", phase: 2 },
  { domain: "Competitor", entityType: "competitor.competitor", phase: 2 },
  { domain: "Competitor", entityType: "competitor.campaign", phase: 2 },
  { domain: "Competitor", entityType: "competitor.content", phase: 2 },
  { domain: "Competitor", entityType: "competitor.gap", phase: 2 },
  { domain: "Industry", entityType: "industry.trend", phase: 2 },
  { domain: "Industry", entityType: "industry.regulation", phase: 2 },
  { domain: "Industry", entityType: "industry.seasonal_pattern", phase: 2 },
  { domain: "Industry", entityType: "industry.benchmark", phase: 2 },
  { domain: "SEO", entityType: "seo.keyword", phase: 1 },
  { domain: "SEO", entityType: "seo.audit_finding", phase: 1 },
  { domain: "SEO", entityType: "seo.ranking", phase: 1 },
  { domain: "SEO", entityType: "seo.content_score", phase: 1 },
  { domain: "Advertising", entityType: "ads.audience", phase: 2 },
  { domain: "Advertising", entityType: "ads.creative_pattern", phase: 2 },
  { domain: "Advertising", entityType: "ads.bid_strategy", phase: 2 },
  { domain: "Advertising", entityType: "ads.platform_insight", phase: 2 },
  { domain: "Content", entityType: "content.pattern", phase: 1 },
  { domain: "Content", entityType: "content.topic_cluster", phase: 1 },
  { domain: "Content", entityType: "content.pillar", phase: 1 },
  { domain: "Content", entityType: "content.repurposing_map", phase: 1 },
  { domain: "Market", entityType: "market.signal", phase: 2 },
  { domain: "Market", entityType: "market.opportunity", phase: 2 },
  { domain: "Market", entityType: "market.threat", phase: 2 },
  { domain: "Executive", entityType: "executive.directive", phase: 2 },
  { domain: "Executive", entityType: "executive.decision", phase: 2 },
  { domain: "Executive", entityType: "executive.budget_allocation", phase: 2 },
  { domain: "Executive", entityType: "executive.performance_review", phase: 2 },
] as const;

/** Reserved catalogue entry (ES-AURORA-007 Appendix A footnote). */
const RESERVED_CATALOG_ENTRY: KnowledgeEntityRegistryDefinition = {
  entityType: "knowledge.meta.schema_version",
  phase: 2,
  description: "reserved",
};

function toRegistryDefinition(entry: CatalogEntry): KnowledgeEntityRegistryDefinition {
  return {
    entityType: entry.entityType,
    domain: KNOWLEDGE_DOMAIN_BY_CATALOG_DOMAIN[entry.domain],
    phase: entry.phase,
  };
}

const CANONICAL_DEFINITIONS: readonly KnowledgeEntityRegistryDefinition[] = [
  ...APPENDIX_A_CATALOG.map(toRegistryDefinition),
  RESERVED_CATALOG_ENTRY,
].sort((left, right) => left.entityType.localeCompare(right.entityType));

/** Phase-1 entity type keys from Appendix A (ES-AURORA-007 §2.2). */
export const PHASE_ONE_ENTITY_TYPES: readonly string[] = CANONICAL_DEFINITIONS.filter(
  (definition) => definition.phase === 1,
).map((definition) => definition.entityType);

export class KnowledgeEntityRegistry {
  private readonly definitionsByType = new Map<string, KnowledgeEntityRegistryDefinition>(
    CANONICAL_DEFINITIONS.map((definition) => [definition.entityType, definition]),
  );

  get(entityType: string): KnowledgeEntityRegistryDefinition | undefined {
    return this.definitionsByType.get(entityType);
  }

  has(entityType: string): boolean {
    return this.definitionsByType.has(entityType);
  }

  list(): readonly KnowledgeEntityRegistryDefinition[] {
    return CANONICAL_DEFINITIONS;
  }

  listByDomain(domain: KnowledgeDomain): readonly KnowledgeEntityRegistryDefinition[] {
    return CANONICAL_DEFINITIONS.filter((definition) => definition.domain === domain);
  }

  isPhaseOne(entityType: string): boolean {
    return this.get(entityType)?.phase === 1;
  }
}

export const knowledgeEntityRegistry = new KnowledgeEntityRegistry();
