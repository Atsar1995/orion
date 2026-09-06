import type { EntityVersionRecord } from "@/lib/aurora/knowledge/domain/EntityVersionRecord";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import {
  KnowledgeEntityAlreadyExistsError,
  KnowledgeEntityNotFoundError,
  KnowledgeRelationshipAlreadyExistsError,
  KnowledgeTenantBoundaryError,
  KnowledgeVersionConflictError,
  type KnowledgeEntityUpdateInput,
  type KnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";
import type {
  RelationshipDirection,
  RelationshipRecord,
} from "@/lib/aurora/knowledge/domain/KnowledgeRelationship";
import {
  knowledgeEntitySchemaRegistry,
  type PhaseOneEntityType,
} from "@/lib/aurora/knowledge/schemas/KnowledgeEntitySchemaRegistry";
import type { KeywordSearchOptions } from "@/lib/aurora/knowledge/types/RetrievalTypes";
import {
  searchEntitiesByKeyword,
  type ScoredKeywordMatch,
} from "@/lib/aurora/knowledge/repositories/keywordSearch";

type TenantEntityStore = {
  readonly entities: Map<string, KnowledgeEntity>;
  readonly versions: Map<string, EntityVersionRecord[]>;
  readonly relationships: Map<string, RelationshipRecord>;
};

function relationshipKey(relationship: RelationshipRecord): string {
  return `${relationship.sourceEntityId}:${relationship.targetEntityId}:${relationship.relationshipType}`;
}

function assertTenantScope(entity: KnowledgeEntity, tenantId: string): void {
  if (entity.tenantId !== tenantId) {
    throw new KnowledgeTenantBoundaryError(
      `Entity ${entity.id} belongs to tenant ${entity.tenantId}, not ${tenantId}.`,
    );
  }
}

function validateKnowledgeEntity(entity: KnowledgeEntity): KnowledgeEntity {
  if (knowledgeEntitySchemaRegistry.isPhaseOne(entity.entityType)) {
    return knowledgeEntitySchemaRegistry.parse(
      entity.entityType as PhaseOneEntityType,
      entity,
    );
  }
  return entity;
}

function sortEntities(entities: readonly KnowledgeEntity[]): readonly KnowledgeEntity[] {
  return [...entities].sort((left, right) => left.id.localeCompare(right.id));
}

function sortVersionHistory(
  history: readonly EntityVersionRecord[],
): readonly EntityVersionRecord[] {
  return [...history].sort((left, right) => left.version - right.version);
}

export class InMemoryKnowledgeRepository implements KnowledgeRepository {
  private readonly stores = new Map<string, TenantEntityStore>();

  private getOrCreateTenantStore(tenantId: string): TenantEntityStore {
    let store = this.stores.get(tenantId);
    if (!store) {
      store = {
        entities: new Map<string, KnowledgeEntity>(),
        versions: new Map<string, EntityVersionRecord[]>(),
        relationships: new Map<string, RelationshipRecord>(),
      };
      this.stores.set(tenantId, store);
    }
    return store;
  }

  async create(tenantId: string, entity: KnowledgeEntity): Promise<KnowledgeEntity> {
    assertTenantScope(entity, tenantId);
    const validated = validateKnowledgeEntity(entity);
    const store = this.getOrCreateTenantStore(tenantId);

    if (store.entities.has(validated.id)) {
      throw new KnowledgeEntityAlreadyExistsError(validated.id, tenantId);
    }

    store.entities.set(validated.id, validated);
    store.versions.set(validated.id, [
      {
        entityId: validated.id,
        version: validated.version,
        snapshot: validated,
        changedBy: validated.curatorAgent,
        createdAt: validated.createdAt,
      },
    ]);

    return validated;
  }

  async getById(tenantId: string, entityId: string): Promise<KnowledgeEntity | null> {
    const store = this.stores.get(tenantId);
    if (!store) {
      return null;
    }

    const entity = store.entities.get(entityId);
    if (!entity || entity.tenantId !== tenantId) {
      return null;
    }

    return entity;
  }

  async update(
    tenantId: string,
    entityId: string,
    input: KnowledgeEntityUpdateInput,
  ): Promise<KnowledgeEntity> {
    const store = this.getOrCreateTenantStore(tenantId);
    const existing = store.entities.get(entityId);

    if (!existing || existing.tenantId !== tenantId) {
      throw new KnowledgeEntityNotFoundError(entityId, tenantId);
    }

    if (input.entity.id !== entityId) {
      throw new KnowledgeVersionConflictError(
        `Entity id cannot change during update (${existing.id} -> ${input.entity.id}).`,
      );
    }

    if (input.entity.tenantId !== tenantId) {
      throw new KnowledgeTenantBoundaryError(
        `Entity tenantId cannot change during update (${existing.tenantId} -> ${input.entity.tenantId}).`,
      );
    }

    const expectedVersion = existing.version + 1;
    if (input.entity.version !== expectedVersion) {
      throw new KnowledgeVersionConflictError(
        `Expected version ${expectedVersion}, received ${input.entity.version}.`,
      );
    }

    const validated = validateKnowledgeEntity(input.entity);
    const versionRecord: EntityVersionRecord = {
      entityId: validated.id,
      version: validated.version,
      snapshot: validated,
      changedBy: input.changedBy,
      changeReason: input.changeReason,
      createdAt: input.versionCreatedAt ?? validated.updatedAt,
    };

    const history = store.versions.get(entityId) ?? [];
    store.entities.set(entityId, validated);
    store.versions.set(entityId, [...sortVersionHistory([...history, versionRecord])]);

    return validated;
  }

  async list(tenantId: string): Promise<readonly KnowledgeEntity[]> {
    const store = this.stores.get(tenantId);
    if (!store) {
      return [];
    }

    return sortEntities(
      [...store.entities.values()].filter((entity) => entity.tenantId === tenantId),
    );
  }

  async getVersionHistory(
    tenantId: string,
    entityId: string,
  ): Promise<readonly EntityVersionRecord[]> {
    const store = this.stores.get(tenantId);
    if (!store || !store.entities.has(entityId)) {
      throw new KnowledgeEntityNotFoundError(entityId, tenantId);
    }

    const entity = store.entities.get(entityId);
    if (!entity || entity.tenantId !== tenantId) {
      throw new KnowledgeEntityNotFoundError(entityId, tenantId);
    }

    return sortVersionHistory(store.versions.get(entityId) ?? []);
  }

  async saveRelationship(
    tenantId: string,
    relationship: RelationshipRecord,
  ): Promise<RelationshipRecord> {
    if (relationship.tenantId !== tenantId) {
      throw new KnowledgeTenantBoundaryError(
        `Relationship tenant ${relationship.tenantId} does not match scope ${tenantId}.`,
      );
    }

    const store = this.getOrCreateTenantStore(tenantId);
    const source = store.entities.get(relationship.sourceEntityId);
    const target = store.entities.get(relationship.targetEntityId);

    if (!source || source.tenantId !== tenantId) {
      throw new KnowledgeEntityNotFoundError(relationship.sourceEntityId, tenantId);
    }
    if (!target || target.tenantId !== tenantId) {
      throw new KnowledgeEntityNotFoundError(relationship.targetEntityId, tenantId);
    }

    const key = relationshipKey(relationship);
    if (store.relationships.has(key)) {
      throw new KnowledgeRelationshipAlreadyExistsError(
        relationship.sourceEntityId,
        relationship.targetEntityId,
        relationship.relationshipType,
      );
    }

    store.relationships.set(key, relationship);
    return relationship;
  }

  async getRelationships(
    tenantId: string,
    entityId: string,
    direction: RelationshipDirection = "both",
  ): Promise<readonly RelationshipRecord[]> {
    const store = this.stores.get(tenantId);
    if (!store) {
      return [];
    }

    const matches = [...store.relationships.values()].filter((relationship) => {
      if (relationship.tenantId !== tenantId) {
        return false;
      }
      if (direction === "out") {
        return relationship.sourceEntityId === entityId;
      }
      if (direction === "in") {
        return relationship.targetEntityId === entityId;
      }
      return relationship.sourceEntityId === entityId || relationship.targetEntityId === entityId;
    });

    return matches.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }

  async searchKeyword(
    tenantId: string,
    query: string,
    options?: KeywordSearchOptions,
  ): Promise<readonly ScoredKeywordMatch[]> {
    const store = this.stores.get(tenantId);
    if (!store) {
      return [];
    }

    return searchEntitiesByKeyword(
      [...store.entities.values()],
      tenantId,
      query,
      options,
    );
  }
}
