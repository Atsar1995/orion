import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";
import type {
  RelationshipDomainRule,
  RelationshipType,
} from "@/lib/aurora/knowledge/domain/KnowledgeRelationship";
import { RELATIONSHIP_TYPES } from "@/lib/aurora/knowledge/domain/KnowledgeRelationship";

const BRAND: KnowledgeDomain = "knowledge.brand";
const PRODUCT: KnowledgeDomain = "knowledge.product";
const CAMPAIGN: KnowledgeDomain = "knowledge.campaign";
const CUSTOMER: KnowledgeDomain = "knowledge.customer";
const COMPETITOR: KnowledgeDomain = "knowledge.competitor";
const SEO: KnowledgeDomain = "knowledge.seo";
const ADS: KnowledgeDomain = "knowledge.ads";
const CONTENT: KnowledgeDomain = "knowledge.content";
const EXECUTIVE: KnowledgeDomain = "knowledge.executive";

/** Appendix B relationship catalogue (ES-AURORA-007). */
export const RELATIONSHIP_TYPE_DEFINITIONS: readonly RelationshipDomainRule[] = [
  {
    relationshipType: "belongs_to_brand",
    sourceDomains: "any",
    targetDomains: [BRAND],
    defaultWeight: 1.0,
  },
  {
    relationshipType: "part_of_campaign",
    sourceDomains: [CAMPAIGN, CONTENT, ADS],
    targetDomains: [CAMPAIGN],
    defaultWeight: 0.9,
  },
  {
    relationshipType: "targets_audience",
    sourceDomains: [CAMPAIGN, CONTENT, ADS],
    targetDomains: [PRODUCT, CUSTOMER],
    defaultWeight: 0.8,
  },
  {
    relationshipType: "references_product",
    sourceDomains: [CAMPAIGN, CONTENT, SEO],
    targetDomains: [PRODUCT],
    defaultWeight: 0.85,
  },
  {
    relationshipType: "competes_with",
    sourceDomains: [COMPETITOR],
    targetDomains: [PRODUCT, BRAND],
    defaultWeight: 0.7,
  },
  {
    relationshipType: "informed_by",
    sourceDomains: "any",
    targetDomains: "any",
    defaultWeight: 0.75,
  },
  {
    relationshipType: "supersedes",
    sourceDomains: "any",
    targetDomains: "any",
    defaultWeight: 1.0,
    requiresSameEntityType: true,
  },
  {
    relationshipType: "derived_from",
    sourceDomains: "any",
    targetDomains: "any",
    defaultWeight: 0.6,
  },
  {
    relationshipType: "executive_directs",
    sourceDomains: [EXECUTIVE],
    targetDomains: [CAMPAIGN, BRAND],
    defaultWeight: 1.0,
  },
  {
    relationshipType: "optimizes",
    sourceDomains: [CAMPAIGN],
    targetDomains: [CAMPAIGN],
    defaultWeight: 0.8,
  },
] as const;

const DEFINITIONS_BY_TYPE = new Map<RelationshipType, RelationshipDomainRule>(
  RELATIONSHIP_TYPE_DEFINITIONS.map((definition) => [definition.relationshipType, definition]),
);

export function getRelationshipTypeDefinition(
  relationshipType: RelationshipType,
): RelationshipDomainRule | undefined {
  return DEFINITIONS_BY_TYPE.get(relationshipType);
}

export function isRelationshipType(value: string): value is RelationshipType {
  return (RELATIONSHIP_TYPES as readonly string[]).includes(value);
}

export function listRelationshipTypes(): readonly RelationshipType[] {
  return RELATIONSHIP_TYPES;
}
