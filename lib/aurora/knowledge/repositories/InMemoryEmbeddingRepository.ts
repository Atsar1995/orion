import {
  assertCreateEmbeddingTenantScope,
  compareScoredEmbeddingMatches,
  cosineSimilarity,
  KnowledgeEmbeddingAlreadyExistsError,
  KnowledgeEmbeddingNotFoundError,
  resolveEmbeddingSearchDefaults,
  validateEmbeddingVector,
  type CreateKnowledgeEmbeddingInput,
  type EmbeddingRepository,
  type KnowledgeEmbeddingRecord,
  type ScoredEmbeddingMatch,
} from "@/lib/aurora/knowledge/repositories/EmbeddingRepository";
import type { VectorSearchOptions } from "@/lib/aurora/knowledge/types/RetrievalTypes";

function chunkKey(entityId: string, chunkIndex: number): string {
  return `${entityId}:${chunkIndex}`;
}

function sortEmbeddingsByEntity(
  embeddings: readonly KnowledgeEmbeddingRecord[],
): readonly KnowledgeEmbeddingRecord[] {
  return [...embeddings].sort((left, right) => {
    const entityCompare = left.entityId.localeCompare(right.entityId);
    if (entityCompare !== 0) {
      return entityCompare;
    }
    return left.chunkIndex - right.chunkIndex;
  });
}

type TenantEmbeddingStore = {
  readonly byId: Map<string, KnowledgeEmbeddingRecord>;
  readonly byChunk: Map<string, KnowledgeEmbeddingRecord>;
};

/** In-memory embedding repository for unit tests (ES-AURORA-007 Sprint 3 Gate 3). */
export class InMemoryEmbeddingRepository implements EmbeddingRepository {
  private readonly stores = new Map<string, TenantEmbeddingStore>();

  private getOrCreateTenantStore(tenantId: string): TenantEmbeddingStore {
    let store = this.stores.get(tenantId);
    if (!store) {
      store = {
        byId: new Map<string, KnowledgeEmbeddingRecord>(),
        byChunk: new Map<string, KnowledgeEmbeddingRecord>(),
      };
      this.stores.set(tenantId, store);
    }
    return store;
  }

  async save(
    tenantId: string,
    input: CreateKnowledgeEmbeddingInput,
  ): Promise<KnowledgeEmbeddingRecord> {
    assertCreateEmbeddingTenantScope(input, tenantId);
    validateEmbeddingVector(input.embedding);
    const store = this.getOrCreateTenantStore(tenantId);
    const key = chunkKey(input.entityId, input.chunkIndex);

    if (store.byChunk.has(key)) {
      throw new KnowledgeEmbeddingAlreadyExistsError(
        input.entityId,
        input.chunkIndex,
        tenantId,
      );
    }

    const record: KnowledgeEmbeddingRecord = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      brandId: input.brandId,
      entityId: input.entityId,
      chunkIndex: input.chunkIndex,
      embedding: [...input.embedding],
      contentHash: input.contentHash,
      createdAt: input.createdAt ?? new Date().toISOString(),
    };

    store.byId.set(record.id, record);
    store.byChunk.set(key, record);
    return record;
  }

  async getById(tenantId: string, embeddingId: string): Promise<KnowledgeEmbeddingRecord | null> {
    const store = this.stores.get(tenantId);
    if (!store) {
      return null;
    }

    const record = store.byId.get(embeddingId);
    if (!record || record.tenantId !== tenantId) {
      return null;
    }

    return record;
  }

  async listByEntity(
    tenantId: string,
    entityId: string,
  ): Promise<readonly KnowledgeEmbeddingRecord[]> {
    const store = this.stores.get(tenantId);
    if (!store) {
      return [];
    }

    return sortEmbeddingsByEntity(
      [...store.byId.values()].filter(
        (record) => record.tenantId === tenantId && record.entityId === entityId,
      ),
    );
  }

  async deleteByEntity(tenantId: string, entityId: string): Promise<number> {
    const store = this.stores.get(tenantId);
    if (!store) {
      return 0;
    }

    const toDelete = [...store.byId.values()].filter(
      (record) => record.tenantId === tenantId && record.entityId === entityId,
    );

    for (const record of toDelete) {
      store.byId.delete(record.id);
      store.byChunk.delete(chunkKey(record.entityId, record.chunkIndex));
    }

    return toDelete.length;
  }

  async deleteById(tenantId: string, embeddingId: string): Promise<void> {
    const store = this.stores.get(tenantId);
    if (!store) {
      throw new KnowledgeEmbeddingNotFoundError(embeddingId, tenantId);
    }

    const record = store.byId.get(embeddingId);
    if (!record || record.tenantId !== tenantId) {
      throw new KnowledgeEmbeddingNotFoundError(embeddingId, tenantId);
    }

    store.byId.delete(record.id);
    store.byChunk.delete(chunkKey(record.entityId, record.chunkIndex));
  }

  async searchSimilar(
    tenantId: string,
    vector: readonly number[],
    options?: VectorSearchOptions,
  ): Promise<readonly ScoredEmbeddingMatch[]> {
    validateEmbeddingVector(vector);
    const store = this.stores.get(tenantId);
    if (!store) {
      return [];
    }

    const { topK, minSimilarity } = resolveEmbeddingSearchDefaults(options);
    const matches: ScoredEmbeddingMatch[] = [];

    for (const record of store.byId.values()) {
      if (record.tenantId !== tenantId) {
        continue;
      }
      if (options?.brandId && record.brandId !== options.brandId) {
        continue;
      }

      const similarity = cosineSimilarity(vector, record.embedding);
      if (similarity < minSimilarity) {
        continue;
      }

      matches.push({ embedding: record, similarity });
    }

    return matches.sort(compareScoredEmbeddingMatches).slice(0, topK);
  }
}
