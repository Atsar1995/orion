import type { KnowledgeDomain } from "@/lib/aurora/knowledge/domain/KnowledgeDomain";

/** Canonical relationship types (ES-AURORA-007 §2.3 · Appendix B). */
export type RelationshipType =
  | "belongs_to_brand"
  | "part_of_campaign"
  | "targets_audience"
  | "references_product"
  | "competes_with"
  | "informed_by"
  | "supersedes"
  | "derived_from"
  | "executive_directs"
  | "optimizes";

export const RELATIONSHIP_TYPES: readonly RelationshipType[] = [
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
] as const;

export type RelationshipDirection = "in" | "out" | "both";

/** Knowledge graph edge (ES-AURORA-007 §2.3). */
export interface KnowledgeRelationship {
  readonly id: string;
  readonly tenantId: string;
  readonly sourceEntityId: string;
  readonly targetEntityId: string;
  readonly relationshipType: RelationshipType;
  /** Bounded 0.0–1.0; decays with entity age per Appendix B. */
  readonly weight: number;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

/** Repository persistence shape for graph relationships. */
export type RelationshipRecord = KnowledgeRelationship;

export type RelationshipDomainRule = {
  readonly relationshipType: RelationshipType;
  readonly sourceDomains: readonly KnowledgeDomain[] | "any";
  readonly targetDomains: readonly KnowledgeDomain[] | "any";
  readonly defaultWeight: number;
  readonly requiresSameEntityType?: boolean;
};
