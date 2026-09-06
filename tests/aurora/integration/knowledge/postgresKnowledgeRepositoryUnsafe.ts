import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import type { AuroraTenantDbScope } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import { toIsoString } from "@/lib/aurora/persistence/postgresRepositoryUtils";

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

/** Test-only RLS regression helper — intentionally omits tenant predicate in SQL. */
export class PostgresKnowledgeRepositoryUnsafe {
  constructor(private readonly dbScope: AuroraTenantDbScope) {}

  async getByIdWithoutTenantPredicate(
    tenantScopeId: string,
    entityId: string,
  ): Promise<KnowledgeEntity | null> {
    return this.dbScope.run(tenantScopeId, async (client) => {
      const result = await client.query<KnowledgeEntityRow>(
        `SELECT ${ENTITY_COLUMNS}
         FROM aurora_knowledge_entity
         WHERE id = $1 AND deleted_at IS NULL`,
        [entityId],
      );
      return result.rows[0] ? mapKnowledgeEntityRow(result.rows[0]) : null;
    });
  }

  async countEntitiesForForeignTenantWithoutPredicate(
    tenantScopeId: string,
    foreignTenantId: string,
  ): Promise<number> {
    return this.dbScope.run(tenantScopeId, async (client) => {
      const result = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM aurora_knowledge_entity
         WHERE tenant_id = $1 AND deleted_at IS NULL`,
        [foreignTenantId],
      );
      return Number(result.rows[0]?.count ?? 0);
    });
  }

  async countVersionHistoryForForeignTenantWithoutPredicate(
    tenantScopeId: string,
    foreignTenantId: string,
    entityId: string,
  ): Promise<number> {
    return this.dbScope.run(tenantScopeId, async (client) => {
      const result = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM aurora_knowledge_entity_version
         WHERE tenant_id = $1 AND entity_id = $2`,
        [foreignTenantId, entityId],
      );
      return Number(result.rows[0]?.count ?? 0);
    });
  }
}
