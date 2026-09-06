import {
  assertCreateEmbeddingTenantScope,
  formatEmbeddingVectorForPostgres,
  KnowledgeEmbeddingAlreadyExistsError,
  KnowledgeEmbeddingNotFoundError,
  resolveEmbeddingSearchDefaults,
  type CreateKnowledgeEmbeddingInput,
  type EmbeddingRepository,
  type KnowledgeEmbeddingRecord,
  type ScoredEmbeddingMatch,
} from "@/lib/aurora/knowledge/repositories/EmbeddingRepository";
import type { VectorSearchOptions } from "@/lib/aurora/knowledge/types/RetrievalTypes";
import { assertAuroraTenantDbScopeId, type AuroraTenantDbScope } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import { toIsoString } from "@/lib/aurora/persistence/postgresRepositoryUtils";

type EmbeddingRow = {
  id: string;
  tenant_id: string;
  brand_id: string;
  entity_id: string;
  chunk_index: number;
  embedding: string;
  content_hash: string;
  created_at: Date | string;
};

type SimilarityRow = EmbeddingRow & {
  similarity: number;
};

const EMBEDDING_COLUMNS = `
  id,
  tenant_id,
  brand_id,
  entity_id,
  chunk_index,
  embedding,
  content_hash,
  created_at
`;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function parseEmbeddingVector(value: string): readonly number[] {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    throw new Error("Invalid pgvector literal.");
  }

  const body = trimmed.slice(1, -1).trim();
  if (body.length === 0) {
    return [];
  }

  return body.split(",").map((part) => Number(part.trim()));
}

function mapEmbeddingRow(row: EmbeddingRow): KnowledgeEmbeddingRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    brandId: row.brand_id,
    entityId: row.entity_id,
    chunkIndex: row.chunk_index,
    embedding: parseEmbeddingVector(row.embedding),
    contentHash: row.content_hash,
    createdAt: toIsoString(row.created_at),
  };
}

/** PostgreSQL embedding repository with tenant RLS (ES-AURORA-007 Sprint 3 Gate 3). */
export class PostgresEmbeddingRepository implements EmbeddingRepository {
  constructor(private readonly dbScope: AuroraTenantDbScope) {}

  async save(
    tenantId: string,
    input: CreateKnowledgeEmbeddingInput,
  ): Promise<KnowledgeEmbeddingRecord> {
    assertAuroraTenantDbScopeId(tenantId);
    assertCreateEmbeddingTenantScope(input, tenantId);

    const createdAt = input.createdAt ?? new Date().toISOString();
    const vectorLiteral = formatEmbeddingVectorForPostgres(input.embedding);

    try {
      return await this.dbScope.run(tenantId, async (client) => {
        const result = await client.query<EmbeddingRow>(
          `INSERT INTO aurora_knowledge_embedding (
             tenant_id, brand_id, entity_id, chunk_index, embedding, content_hash, created_at
           ) VALUES ($1, $2, $3, $4, $5::vector, $6, $7)
           RETURNING ${EMBEDDING_COLUMNS}`,
          [
            input.tenantId,
            input.brandId,
            input.entityId,
            input.chunkIndex,
            vectorLiteral,
            input.contentHash,
            createdAt,
          ],
        );

        return mapEmbeddingRow(result.rows[0]);
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new KnowledgeEmbeddingAlreadyExistsError(
          input.entityId,
          input.chunkIndex,
          tenantId,
        );
      }
      throw error;
    }
  }

  async getById(tenantId: string, embeddingId: string): Promise<KnowledgeEmbeddingRecord | null> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) => {
      const result = await client.query<EmbeddingRow>(
        `SELECT ${EMBEDDING_COLUMNS}
         FROM aurora_knowledge_embedding
         WHERE tenant_id = $1 AND id = $2`,
        [tenantId, embeddingId],
      );
      return result.rows[0] ? mapEmbeddingRow(result.rows[0]) : null;
    });
  }

  async listByEntity(
    tenantId: string,
    entityId: string,
  ): Promise<readonly KnowledgeEmbeddingRecord[]> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) => {
      const result = await client.query<EmbeddingRow>(
        `SELECT ${EMBEDDING_COLUMNS}
         FROM aurora_knowledge_embedding
         WHERE tenant_id = $1 AND entity_id = $2
         ORDER BY chunk_index ASC`,
        [tenantId, entityId],
      );
      return result.rows.map(mapEmbeddingRow);
    });
  }

  async deleteByEntity(tenantId: string, entityId: string): Promise<number> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) => {
      const result = await client.query<{ id: string }>(
        `DELETE FROM aurora_knowledge_embedding
         WHERE tenant_id = $1 AND entity_id = $2
         RETURNING id`,
        [tenantId, entityId],
      );
      return result.rows.length;
    });
  }

  async deleteById(tenantId: string, embeddingId: string): Promise<void> {
    assertAuroraTenantDbScopeId(tenantId);
    await this.dbScope.run(tenantId, async (client) => {
      const result = await client.query<{ id: string }>(
        `DELETE FROM aurora_knowledge_embedding
         WHERE tenant_id = $1 AND id = $2
         RETURNING id`,
        [tenantId, embeddingId],
      );

      if (!result.rows[0]) {
        throw new KnowledgeEmbeddingNotFoundError(embeddingId, tenantId);
      }
    });
  }

  async searchSimilar(
    tenantId: string,
    vector: readonly number[],
    options?: VectorSearchOptions,
  ): Promise<readonly ScoredEmbeddingMatch[]> {
    assertAuroraTenantDbScopeId(tenantId);
    const { topK, minSimilarity } = resolveEmbeddingSearchDefaults(options);
    const vectorLiteral = formatEmbeddingVectorForPostgres(vector);

    return this.dbScope.run(tenantId, async (client) => {
      const params: unknown[] = [tenantId, vectorLiteral, minSimilarity, topK];
      let paramIndex = 5;

      let query = `
        SELECT
          e.id,
          e.tenant_id,
          e.brand_id,
          e.entity_id,
          e.chunk_index,
          e.embedding::text AS embedding,
          e.content_hash,
          e.created_at,
          1 - (e.embedding <=> $2::vector) AS similarity
        FROM aurora_knowledge_embedding e
      `;

      const joins: string[] = [];
      const filters: string[] = ["e.tenant_id = $1"];

      if (options?.brandId) {
        filters.push(`e.brand_id = $${paramIndex}`);
        params.push(options.brandId);
        paramIndex += 1;
      }

      if (options?.domains?.length || options?.validatedOnly) {
        joins.push(
          `INNER JOIN aurora_knowledge_entity ke
             ON ke.tenant_id = e.tenant_id
            AND ke.id = e.entity_id
            AND ke.deleted_at IS NULL`,
        );

        if (options.domains?.length) {
          filters.push(`ke.domain = ANY($${paramIndex})`);
          params.push(options.domains);
          paramIndex += 1;
        }

        if (options.validatedOnly) {
          filters.push(`ke.status = 'validated'`);
        }
      }

      if (joins.length > 0) {
        query += joins.join("\n");
      }

      query += `
        WHERE ${filters.join(" AND ")}
          AND (1 - (e.embedding <=> $2::vector)) >= $3
        ORDER BY e.embedding <=> $2::vector ASC, e.entity_id ASC, e.chunk_index ASC
        LIMIT $4
      `;

      const result = await client.query<SimilarityRow>(query, params);
      return result.rows.map((row) => ({
        embedding: mapEmbeddingRow(row),
        similarity: row.similarity,
      }));
    });
  }
}
