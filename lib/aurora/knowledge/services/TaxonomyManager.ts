import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import { KNOWLEDGE_DOMAINS } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import { knowledgeEntityRegistry } from "@/lib/aurora/knowledge/registry/KnowledgeEntityRegistry";

/** Hierarchical taxonomy node (A-004 Appendix C). */
export type TaxonomyNode = {
  readonly key: string;
  readonly children?: readonly TaxonomyNode[];
};

export type TaxonomyTree = {
  readonly domain: KnowledgeDomain;
  readonly root: TaxonomyNode;
};

export type ValidationResult = {
  readonly valid: boolean;
  readonly errors: readonly string[];
};

export type EntityTypeSuggestion = {
  readonly entityType: string;
  readonly score: number;
};

/**
 * Domain taxonomy derived from A-004 Appendix C entity-type suffixes.
 * Full hierarchical semantics beyond domain → entityType are not machine-validated.
 */
const DOMAIN_TAXONOMY: Readonly<Record<KnowledgeDomain, readonly string[]>> = {
  "knowledge.brand": [
    "brand.profile",
    "brand.guideline",
    "brand.visual_identity",
    "brand.messaging_pillar",
    "brand.approval_policy",
  ],
  "knowledge.product": [
    "product.product",
    "product.feature",
    "product.pricing",
    "product.audience",
  ],
  "knowledge.campaign": [
    "campaign.record",
    "campaign.lesson",
    "campaign.channel_performance",
    "campaign.optimization",
  ],
  "knowledge.customer": [
    "customer.segment",
    "customer.persona",
    "customer.engagement_pattern",
    "customer.retention_insight",
  ],
  "knowledge.competitor": [
    "competitor.competitor",
    "competitor.campaign",
    "competitor.content",
    "competitor.gap",
  ],
  "knowledge.industry": [
    "industry.trend",
    "industry.regulation",
    "industry.seasonal_pattern",
    "industry.benchmark",
  ],
  "knowledge.seo": [
    "seo.keyword",
    "seo.audit_finding",
    "seo.ranking",
    "seo.content_score",
  ],
  "knowledge.ads": [
    "ads.audience",
    "ads.creative_pattern",
    "ads.bid_strategy",
    "ads.platform_insight",
  ],
  "knowledge.content": [
    "content.pattern",
    "content.topic_cluster",
    "content.pillar",
    "content.repurposing_map",
  ],
  "knowledge.market": ["market.signal", "market.opportunity", "market.threat"],
  "knowledge.executive": [
    "executive.directive",
    "executive.decision",
    "executive.budget_allocation",
    "executive.performance_review",
  ],
};

function buildTaxonomyTree(domain: KnowledgeDomain): TaxonomyTree {
  const entityTypes = DOMAIN_TAXONOMY[domain];
  const domainKey = domain.replace("knowledge.", "");
  return {
    domain,
    root: {
      key: domainKey,
      children: entityTypes.map((entityType) => ({
        key: entityType.split(".")[1] ?? entityType,
      })),
    },
  };
}

function tokenize(value: string): readonly string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export interface TaxonomyManager {
  validateEntityPlacement(entity: KnowledgeEntity): ValidationResult;
  getDomainTaxonomy(domain: KnowledgeDomain): TaxonomyTree;
  suggestEntityType(content: string, domain: KnowledgeDomain): Promise<EntityTypeSuggestion[]>;
}

export class DefaultTaxonomyManager implements TaxonomyManager {
  validateEntityPlacement(entity: KnowledgeEntity): ValidationResult {
    const errors: string[] = [];
    const definition = knowledgeEntityRegistry.get(entity.entityType);

    if (!definition) {
      errors.push(`Unknown entity type: ${entity.entityType}.`);
    } else if (definition.domain && definition.domain !== entity.domain) {
      errors.push(
        `Entity type ${entity.entityType} belongs to domain ${definition.domain}, not ${entity.domain}.`,
      );
    }

    const allowedTypes = DOMAIN_TAXONOMY[entity.domain];
    if (!allowedTypes?.includes(entity.entityType)) {
      errors.push(
        `Entity type ${entity.entityType} is not listed in taxonomy for domain ${entity.domain}.`,
      );
    }

    return { valid: errors.length === 0, errors };
  }

  getDomainTaxonomy(domain: KnowledgeDomain): TaxonomyTree {
    if (!KNOWLEDGE_DOMAINS.includes(domain)) {
      throw new Error(`Unknown knowledge domain: ${domain}.`);
    }
    return buildTaxonomyTree(domain);
  }

  async suggestEntityType(
    content: string,
    domain: KnowledgeDomain,
  ): Promise<EntityTypeSuggestion[]> {
    const tokens = new Set(tokenize(content));
    const suggestions: EntityTypeSuggestion[] = [];

    for (const entityType of DOMAIN_TAXONOMY[domain] ?? []) {
      const suffix = entityType.split(".")[1] ?? entityType;
      const suffixTokens = tokenize(suffix.replace(/_/g, " "));
      const overlap = suffixTokens.filter((token) => tokens.has(token)).length;
      if (overlap > 0) {
        suggestions.push({
          entityType,
          score: overlap / suffixTokens.length,
        });
      }
    }

    return suggestions.sort((left, right) => right.score - left.score);
  }
}
