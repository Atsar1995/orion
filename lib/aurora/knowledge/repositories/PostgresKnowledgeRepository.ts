import type { EntityVersionRecord } from "@/lib/aurora/knowledge/domain/EntityVersionRecord";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import type {
  RelationshipDirection,
  RelationshipRecord,
} from "@/lib/aurora/knowledge/domain/KnowledgeRelationship";
import {
  KnowledgeEntityAlreadyExistsError,
  KnowledgeEntityNotFoundError,
  KnowledgeRelationshipAlreadyExistsError,
  KnowledgeTenantBoundaryError,
  KnowledgeVersionConflictError,
  type KnowledgeEntityUpdateInput,
  type KnowledgeRepository,
} from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";
import {
  knowledgeEntitySchemaRegistry,
  type PhaseOneEntityType,
} from "@/lib/aurora/knowledge/schemas/KnowledgeEntitySchemaRegistry";
import { assertAuroraTenantDbScopeId, type AuroraTenantDbScope } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import { toIsoString } from "@/lib/aurora/persistence/postgresRepositoryUtils";
import type { KeywordSearchOptions } from "@/lib/aurora/knowledge/types/RetrievalTypes";
import {
  resolveKeywordSearchDefaults,
  type ScoredKeywordMatch,
} from "@/lib/aurora/knowledge/repositories/keywordSearch";
import { KnowledgeKeywordSearchError } from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";

type KnowledgeEntityRow = {
  id: string;
  tenant_id: string;
  brand_id: string;
  domain: KnowledgeEntity["domain"];
  entity_type: string;
  status: KnowledgeEntity["status"];
  classification: KnowledgeEntity["classification"];
  title: string;
  content: Record<string, unknown>;
  source_type: KnowledgeEntity["sourceType"];
  source_trust: number;
  version: number;
  curator_agent: string;
  validated_at: Date | string | null;
  validated_by: string | null;
  stale_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type EntityVersionRow = {
  entity_id: string;
  version: number;
  snapshot: KnowledgeEntity;
  changed_by: string;
  change_reason: string | null;
  created_at: Date | string;
};

type RelationshipRow = {
  id: string;
  tenant_id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: RelationshipRecord["relationshipType"];
  weight: number;
  metadata: Record<string, unknown>;
  created_at: Date | string;
};

const ENTITY_COLUMNS = `
  id,
  tenant_id,
  brand_id,
  domain,
  entity_type,
  status,
  classification,
  title,
  content,
  source_type,
  source_trust,
  version,
  curator_agent,
  validated_at,
  validated_by,
  stale_at,
  created_at,
  updated_at
`;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
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

function mapKnowledgeEntityRow(row: KnowledgeEntityRow): KnowledgeEntity {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    brandId: row.brand_id,
    domain: row.domain,
    entityType: row.entity_type,
    status: row.status,
    classification: row.classification,
    title: row.title,
    content: row.content,
    sourceType: row.source_type,
    sourceTrust: row.source_trust,
    version: row.version,
    curatorAgent: row.curator_agent,
    validatedAt: row.validated_at ? toIsoString(row.validated_at) : undefined,
    validatedBy: row.validated_by ?? undefined,
    staleAt: row.stale_at ? toIsoString(row.stale_at) : undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapVersionRow(row: EntityVersionRow): EntityVersionRecord {
  return {
    entityId: row.entity_id,
    version: row.version,
    snapshot: row.snapshot,
    changedBy: row.changed_by,
    changeReason: row.change_reason ?? undefined,
    createdAt: toIsoString(row.created_at),
  };
}

function mapRelationshipRow(row: RelationshipRow): RelationshipRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    sourceEntityId: row.source_entity_id,
    targetEntityId: row.target_entity_id,
    relationshipType: row.relationship_type,
    weight: row.weight,
    metadata: row.metadata,
    createdAt: toIsoString(row.created_at),
  };
}

function assertRelationshipTenantScope(relationship: RelationshipRecord, tenantId: string): void {
  if (relationship.tenantId !== tenantId) {
    throw new KnowledgeTenantBoundaryError(
      `Relationship tenant ${relationship.tenantId} does not match scope ${tenantId}.`,
    );
  }
}

/** PostgreSQL knowledge repository with tenant RLS (ES-AURORA-007 Gate 4C). */
export class PostgresKnowledgeRepository implements KnowledgeRepository {
  constructor(private readonly dbScope: AuroraTenantDbScope) {}

  async create(tenantId: string, entity: KnowledgeEntity): Promise<KnowledgeEntity> {
    assertAuroraTenantDbScopeId(tenantId);
    assertTenantScope(entity, tenantId);
    const validated = validateKnowledgeEntity(entity);

    try {
      return await this.dbScope.run(tenantId, async (client) => {
        const result = await client.query<KnowledgeEntityRow>(
          `INSERT INTO aurora_knowledge_entity (
             id, tenant_id, brand_id, domain, entity_type, status, classification,
             title, content, source_type, source_trust, version, curator_agent,
             validated_at, validated_by, stale_at, created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7,
             $8, $9, $10, $11, $12, $13,
             $14, $15, $16, $17, $18
           )
           RETURNING ${ENTITY_COLUMNS}`,
          [
            validated.id,
            validated.tenantId,
            validated.brandId,
            validated.domain,
            validated.entityType,
            validated.status,
            validated.classification,
            validated.title,
            validated.content,
            validated.sourceType,
            validated.sourceTrust,
            validated.version,
            validated.curatorAgent,
            validated.validatedAt ?? null,
            validated.validatedBy ?? null,
            validated.staleAt ?? null,
            validated.createdAt,
            validated.updatedAt,
          ],
        );

        await client.query(
          `INSERT INTO aurora_knowledge_entity_version (
             tenant_id, entity_id, version, snapshot, changed_by, change_reason, created_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            validated.tenantId,
            validated.id,
            validated.version,
            validated,
            validated.curatorAgent,
            null,
            validated.createdAt,
          ],
        );

        return mapKnowledgeEntityRow(result.rows[0]);
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new KnowledgeEntityAlreadyExistsError(validated.id, tenantId);
      }
      throw error;
    }
  }

  async getById(tenantId: string, entityId: string): Promise<KnowledgeEntity | null> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) => {
      const result = await client.query<KnowledgeEntityRow>(
        `SELECT ${ENTITY_COLUMNS}
         FROM aurora_knowledge_entity
         WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`,
        [tenantId, entityId],
      );
      return result.rows[0] ? mapKnowledgeEntityRow(result.rows[0]) : null;
    });
  }

  async update(
    tenantId: string,
    entityId: string,
    input: KnowledgeEntityUpdateInput,
  ): Promise<KnowledgeEntity> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) => {
      const existingResult = await client.query<{ version: number; tenant_id: string; id: string }>(
        `SELECT id, tenant_id, version
         FROM aurora_knowledge_entity
         WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`,
        [tenantId, entityId],
      );
      const existing = existingResult.rows[0];
      if (!existing) {
        throw new KnowledgeEntityNotFoundError(entityId, tenantId);
      }

      if (input.entity.id !== entityId) {
        throw new KnowledgeVersionConflictError(
          `Entity id cannot change during update (${existing.id} -> ${input.entity.id}).`,
        );
      }

      if (input.entity.tenantId !== tenantId) {
        throw new KnowledgeTenantBoundaryError(
          `Entity tenantId cannot change during update (${existing.tenant_id} -> ${input.entity.tenantId}).`,
        );
      }

      const expectedVersion = existing.version + 1;
      if (input.entity.version !== expectedVersion) {
        throw new KnowledgeVersionConflictError(
          `Expected version ${expectedVersion}, received ${input.entity.version}.`,
        );
      }

      const validated = validateKnowledgeEntity(input.entity);
      const versionCreatedAt = input.versionCreatedAt ?? validated.updatedAt;

      const result = await client.query<KnowledgeEntityRow>(
        `UPDATE aurora_knowledge_entity
         SET
           brand_id = $3,
           domain = $4,
           entity_type = $5,
           status = $6,
           classification = $7,
           title = $8,
           content = $9,
           source_type = $10,
           source_trust = $11,
           version = $12,
           curator_agent = $13,
           validated_at = $14,
           validated_by = $15,
           stale_at = $16,
           updated_at = $17
         WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL
         RETURNING ${ENTITY_COLUMNS}`,
        [
          tenantId,
          entityId,
          validated.brandId,
          validated.domain,
          validated.entityType,
          validated.status,
          validated.classification,
          validated.title,
          validated.content,
          validated.sourceType,
          validated.sourceTrust,
          validated.version,
          validated.curatorAgent,
          validated.validatedAt ?? null,
          validated.validatedBy ?? null,
          validated.staleAt ?? null,
          validated.updatedAt,
        ],
      );

      await client.query(
        `INSERT INTO aurora_knowledge_entity_version (
           tenant_id, entity_id, version, snapshot, changed_by, change_reason, created_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          tenantId,
          entityId,
          validated.version,
          validated,
          input.changedBy,
          input.changeReason ?? null,
          versionCreatedAt,
        ],
      );

      return mapKnowledgeEntityRow(result.rows[0]);
    });
  }

  async list(tenantId: string): Promise<readonly KnowledgeEntity[]> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) => {
      const result = await client.query<KnowledgeEntityRow>(
        `SELECT ${ENTITY_COLUMNS}
         FROM aurora_knowledge_entity
         WHERE tenant_id = $1 AND deleted_at IS NULL
         ORDER BY id ASC`,
        [tenantId],
      );
      return result.rows.map(mapKnowledgeEntityRow);
    });
  }

  async getVersionHistory(
    tenantId: string,
    entityId: string,
  ): Promise<readonly EntityVersionRecord[]> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) => {
      const entityExists = await client.query<{ id: string }>(
        `SELECT id
         FROM aurora_knowledge_entity
         WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`,
        [tenantId, entityId],
      );
      if (!entityExists.rows[0]) {
        throw new KnowledgeEntityNotFoundError(entityId, tenantId);
      }

      const result = await client.query<EntityVersionRow>(
        `SELECT entity_id, version, snapshot, changed_by, change_reason, created_at
         FROM aurora_knowledge_entity_version
         WHERE tenant_id = $1 AND entity_id = $2
         ORDER BY version ASC`,
        [tenantId, entityId],
      );
      return result.rows.map(mapVersionRow);
    });
  }

  async saveRelationship(
    tenantId: string,
    relationship: RelationshipRecord,
  ): Promise<RelationshipRecord> {
    assertAuroraTenantDbScopeId(tenantId);
    assertRelationshipTenantScope(relationship, tenantId);

    try {
      return await this.dbScope.run(tenantId, async (client) => {
        const result = await client.query<RelationshipRow>(
          `INSERT INTO aurora_knowledge_relationship (
             id, tenant_id, source_entity_id, target_entity_id,
             relationship_type, weight, metadata, created_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING
             id, tenant_id, source_entity_id, target_entity_id,
             relationship_type, weight, metadata, created_at`,
          [
            relationship.id,
            relationship.tenantId,
            relationship.sourceEntityId,
            relationship.targetEntityId,
            relationship.relationshipType,
            relationship.weight,
            relationship.metadata,
            relationship.createdAt,
          ],
        );
        return mapRelationshipRow(result.rows[0]);
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new KnowledgeRelationshipAlreadyExistsError(
          relationship.sourceEntityId,
          relationship.targetEntityId,
          relationship.relationshipType,
        );
      }
      throw error;
    }
  }

  async getRelationships(
    tenantId: string,
    entityId: string,
    direction: RelationshipDirection = "both",
  ): Promise<readonly RelationshipRecord[]> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) => {
      let query = `SELECT id, tenant_id, source_entity_id, target_entity_id,
                          relationship_type, weight, metadata, created_at
                   FROM aurora_knowledge_relationship
                   WHERE tenant_id = $1`;
      const params: string[] = [tenantId];

      if (direction === "out") {
        query += ` AND source_entity_id = $2`;
        params.push(entityId);
      } else if (direction === "in") {
        query += ` AND target_entity_id = $2`;
        params.push(entityId);
      } else {
        query += ` AND (source_entity_id = $2 OR target_entity_id = $2)`;
        params.push(entityId);
      }

      query += ` ORDER BY created_at ASC`;

      const result = await client.query<RelationshipRow>(query, params);
      return result.rows.map(mapRelationshipRow);
    });
  }

  async searchKeyword(
    tenantId: string,
    query: string,
    options?: KeywordSearchOptions,
  ): Promise<readonly ScoredKeywordMatch[]> {
    assertAuroraTenantDbScopeId(tenantId);
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    const { topK } = resolveKeywordSearchDefaults(options);

    try {
      return await this.dbScope.run(tenantId, async (client) => {
        const params: unknown[] = [tenantId, trimmed];
        let paramIndex = 3;

        let sql = `
          SELECT ${ENTITY_COLUMNS},
                 ts_rank_cd(search_fts, plainto_tsquery('english', $2)) AS rank
          FROM aurora_knowledge_entity
          WHERE tenant_id = $1
            AND deleted_at IS NULL
            AND search_fts @@ plainto_tsquery('english', $2)`;

        if (options?.brandId) {
          sql += ` AND brand_id = $${paramIndex}`;
          params.push(options.brandId);
          paramIndex += 1;
        }

        if (options?.domains?.length) {
          sql += ` AND domain = ANY($${paramIndex}::text[])`;
          params.push(options.domains);
          paramIndex += 1;
        }

        if (options?.entityType) {
          sql += ` AND entity_type = $${paramIndex}`;
          params.push(options.entityType);
          paramIndex += 1;
        }

        if (options?.validatedOnly) {
          sql += ` AND status = 'validated'`;
        }

        if (options?.includeProvisional === false) {
          sql += ` AND status <> 'provisional'`;
        }

        sql += ` ORDER BY rank DESC, id ASC LIMIT $${paramIndex}`;
        params.push(topK);

        const result = await client.query<KnowledgeEntityRow & { rank: string | number }>(
          sql,
          params,
        );

        return result.rows.map((row) => ({
          entity: mapKnowledgeEntityRow(row),
          rank: Number(row.rank),
        }));
      });
    } catch (error) {
      throw new KnowledgeKeywordSearchError(
        error instanceof Error ? error.message : "Keyword search failed.",
        { cause: error },
      );
    }
  }
}
