import type { EntityVersionRecord } from "@/lib/aurora/knowledge/domain/EntityVersionRecord";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import type {
  RelationshipDirection,
  RelationshipRecord,
} from "@/lib/aurora/knowledge/domain/KnowledgeRelationship";
import type { KeywordSearchOptions } from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { ScoredKeywordMatch } from "@/lib/aurora/knowledge/repositories/keywordSearch";

export class KnowledgeEntityNotFoundError extends Error {
  readonly name = "KnowledgeEntityNotFoundError";

  constructor(entityId: string, tenantId: string) {
    super(`Knowledge entity not found: ${entityId} (tenant ${tenantId}).`);
  }
}

export class KnowledgeEntityAlreadyExistsError extends Error {
  readonly name = "KnowledgeEntityAlreadyExistsError";

  constructor(entityId: string, tenantId: string) {
    super(`Knowledge entity already exists: ${entityId} (tenant ${tenantId}).`);
  }
}

export class KnowledgeTenantBoundaryError extends Error {
  readonly name = "KnowledgeTenantBoundaryError";

  constructor(message: string) {
    super(message);
  }
}

export class KnowledgeVersionConflictError extends Error {
  readonly name = "KnowledgeVersionConflictError";

  constructor(message: string) {
    super(message);
  }
}

export class KnowledgeRelationshipAlreadyExistsError extends Error {
  readonly name = "KnowledgeRelationshipAlreadyExistsError";

  constructor(sourceEntityId: string, targetEntityId: string, relationshipType: string) {
    super(
      `Knowledge relationship already exists: ${sourceEntityId} -> ${targetEntityId} (${relationshipType}).`,
    );
  }
}

export class KnowledgeInvalidRelationshipError extends Error {
  readonly name = "KnowledgeInvalidRelationshipError";

  constructor(message: string) {
    super(message);
  }
}

export class KnowledgeKeywordSearchError extends Error {
  readonly name = "KnowledgeKeywordSearchError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export type KnowledgeEntityUpdateInput = {
  readonly entity: KnowledgeEntity;
  readonly changedBy: string;
  readonly changeReason?: string;
  readonly versionCreatedAt?: string;
};

/** Tenant-scoped knowledge entity repository (ES-AURORA-007 §2.5 · Gate 4B). */
export interface KnowledgeRepository {
  create(tenantId: string, entity: KnowledgeEntity): Promise<KnowledgeEntity>;
  getById(tenantId: string, entityId: string): Promise<KnowledgeEntity | null>;
  update(
    tenantId: string,
    entityId: string,
    input: KnowledgeEntityUpdateInput,
  ): Promise<KnowledgeEntity>;
  list(tenantId: string): Promise<readonly KnowledgeEntity[]>;
  getVersionHistory(
    tenantId: string,
    entityId: string,
  ): Promise<readonly EntityVersionRecord[]>;
  saveRelationship(tenantId: string, relationship: RelationshipRecord): Promise<RelationshipRecord>;
  getRelationships(
    tenantId: string,
    entityId: string,
    direction?: RelationshipDirection,
  ): Promise<readonly RelationshipRecord[]>;
  searchKeyword(
    tenantId: string,
    query: string,
    options?: KeywordSearchOptions,
  ): Promise<readonly ScoredKeywordMatch[]>;
}
