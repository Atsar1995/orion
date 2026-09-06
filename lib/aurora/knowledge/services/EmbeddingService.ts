import { createHash } from "node:crypto";
import {
  EMBEDDING_VECTOR_DIMENSION,
  KnowledgeEntityNotFoundError,
  KnowledgeInvalidEmbeddingVectorError,
  validateEmbeddingVector,
  type EmbeddingRepository,
  type KnowledgeRepository,
  type ScoredEmbeddingMatch,
} from "@/lib/aurora/knowledge/repositories";
import type { KnowledgeEntity } from "@/lib/aurora/knowledge/domain/KnowledgeEntity";
import {
  chunkEmbeddingText,
  extractEntityEmbeddingText,
  hashEmbeddingChunkContent,
} from "@/lib/aurora/knowledge/services/embeddingIndexing";
import {
  EmbeddingProviderUnavailableError,
  type EmbeddingProvider,
} from "@/lib/aurora/knowledge/services/EmbeddingProvider";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import type {
  EmbeddingMetadata,
  ReindexResult,
  VectorSearchOptions,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import type { AuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export class EmbeddingInvalidInputError extends Error {
  readonly name = "EmbeddingInvalidInputError";

  constructor(message: string) {
    super(message);
  }
}

export type IndexEntityResult = {
  readonly entityId: string;
  readonly chunksIndexed: number;
  readonly chunksSkipped: number;
  readonly chunksRemoved: number;
};

export interface EmbeddingService {
  embedQuery(ctx: AuroraRuntimeContext, text: string): Promise<readonly number[]>;
  embed(
    ctx: AuroraRuntimeContext,
    text: string,
    metadata?: EmbeddingMetadata,
  ): Promise<readonly number[]>;
  embedBatch(
    ctx: AuroraRuntimeContext,
    texts: readonly string[],
  ): Promise<readonly (readonly number[])[]>;
  indexEntity(ctx: AuroraRuntimeContext, entityId: string): Promise<IndexEntityResult>;
  removeFromIndex(ctx: AuroraRuntimeContext, entityId: string): Promise<number>;
  semanticSearch(
    ctx: AuroraRuntimeContext,
    vector: readonly number[],
    options?: VectorSearchOptions,
  ): Promise<readonly ScoredEmbeddingMatch[]>;
  reindexTenant(ctx: AuroraRuntimeContext): Promise<ReindexResult>;
}

function assertTenantContext(ctx: AuroraRuntimeContext): void {
  if (!ctx.tenantId) {
    throw new KnowledgeInvalidTenantContextError("Tenant context is required.");
  }
}

function assertEntityTenantScope(entity: KnowledgeEntity, tenantId: string): void {
  if (entity.tenantId !== tenantId) {
    throw new KnowledgeInvalidTenantContextError(
      `Entity tenant ${entity.tenantId} does not match runtime tenant ${tenantId}.`,
    );
  }
}

function assertNonEmptyEmbeddingText(text: string): void {
  if (!text.trim()) {
    throw new EmbeddingInvalidInputError("Embedding text must not be empty.");
  }
}

async function invokeEmbeddingProvider<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof EmbeddingProviderUnavailableError) {
      throw error;
    }
    if (error instanceof KnowledgeInvalidEmbeddingVectorError) {
      throw error;
    }
    throw new EmbeddingProviderUnavailableError(
      error instanceof Error ? error.message : "Embedding provider failed.",
      { cause: error },
    );
  }
}

export class DefaultEmbeddingService implements EmbeddingService {
  constructor(
    private readonly embeddingProvider: EmbeddingProvider,
    private readonly embeddingRepository: EmbeddingRepository,
    private readonly knowledgeRepository: KnowledgeRepository,
    private readonly authorizationService: AuroraAuthorizationService,
  ) {}

  private assertReadAccess(ctx: AuroraRuntimeContext, resource: string): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "readKnowledgeEmbedding",
      resource,
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.read", {
      operation: "readKnowledgeEmbedding",
      resource,
    });
  }

  private assertWriteAccess(ctx: AuroraRuntimeContext, resource: string): void {
    this.authorizationService.assertTenantAccess(ctx, ctx.tenantId, {
      operation: "writeKnowledgeEmbedding",
      resource,
    });
    this.authorizationService.assertPermission(ctx, "aurora.knowledge.write", {
      operation: "writeKnowledgeEmbedding",
      resource,
    });
  }

  async embedQuery(ctx: AuroraRuntimeContext, text: string): Promise<readonly number[]> {
    assertTenantContext(ctx);
    this.assertReadAccess(ctx, "query-embed");
    assertNonEmptyEmbeddingText(text);

    const vector = await invokeEmbeddingProvider(() => this.embeddingProvider.embed(text));
    validateEmbeddingVector(vector);
    return vector;
  }

  async embed(
    ctx: AuroraRuntimeContext,
    text: string,
    metadata?: EmbeddingMetadata,
  ): Promise<readonly number[]> {
    assertTenantContext(ctx);
    this.assertWriteAccess(ctx, metadata?.entityId ?? "embed");
    assertNonEmptyEmbeddingText(text);

    const vector = await invokeEmbeddingProvider(() =>
      this.embeddingProvider.embed(text, metadata),
    );
    validateEmbeddingVector(vector);
    return vector;
  }

  async embedBatch(
    ctx: AuroraRuntimeContext,
    texts: readonly string[],
  ): Promise<readonly (readonly number[])[]> {
    assertTenantContext(ctx);
    this.assertWriteAccess(ctx, "embed-batch");

    if (texts.length === 0) {
      return [];
    }

    for (const text of texts) {
      assertNonEmptyEmbeddingText(text);
    }

    const vectors = await invokeEmbeddingProvider(() => this.embeddingProvider.embedBatch(texts));
    if (vectors.length !== texts.length) {
      throw new EmbeddingProviderUnavailableError(
        `Embedding provider returned ${vectors.length} vectors for ${texts.length} inputs.`,
      );
    }

    for (const vector of vectors) {
      validateEmbeddingVector(vector);
    }

    return vectors;
  }

  async indexEntity(ctx: AuroraRuntimeContext, entityId: string): Promise<IndexEntityResult> {
    assertTenantContext(ctx);
    this.assertWriteAccess(ctx, entityId);

    const entity = await this.knowledgeRepository.getById(ctx.tenantId, entityId);
    if (!entity) {
      throw new KnowledgeEntityNotFoundError(entityId, ctx.tenantId);
    }
    assertEntityTenantScope(entity, ctx.tenantId);

    const chunks = chunkEmbeddingText(extractEntityEmbeddingText(entity));
    const existing = await this.embeddingRepository.listByEntity(ctx.tenantId, entityId);
    const existingByIndex = new Map(existing.map((record) => [record.chunkIndex, record]));

    let chunksIndexed = 0;
    let chunksSkipped = 0;
    const retainedIndexes = new Set<number>();

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
      const chunkText = chunks[chunkIndex]!;
      const contentHash = hashEmbeddingChunkContent(chunkText);
      const existingChunk = existingByIndex.get(chunkIndex);

      if (existingChunk?.contentHash === contentHash) {
        chunksSkipped += 1;
        retainedIndexes.add(chunkIndex);
        continue;
      }

      if (existingChunk) {
        await this.embeddingRepository.deleteById(ctx.tenantId, existingChunk.id);
      }

      const vector = await invokeEmbeddingProvider(() =>
        this.embeddingProvider.embed(chunkText, {
          entityId: entity.id,
          entityType: entity.entityType,
          domain: entity.domain,
          chunkIndex,
          contentHash,
        }),
      );
      validateEmbeddingVector(vector);

      await this.embeddingRepository.save(ctx.tenantId, {
        tenantId: ctx.tenantId,
        brandId: entity.brandId,
        entityId: entity.id,
        chunkIndex,
        embedding: vector,
        contentHash,
      });

      chunksIndexed += 1;
      retainedIndexes.add(chunkIndex);
    }

    let chunksRemoved = 0;
    for (const record of existing) {
      if (!retainedIndexes.has(record.chunkIndex)) {
        await this.embeddingRepository.deleteById(ctx.tenantId, record.id);
        chunksRemoved += 1;
      }
    }

    return {
      entityId,
      chunksIndexed,
      chunksSkipped,
      chunksRemoved,
    };
  }

  async removeFromIndex(ctx: AuroraRuntimeContext, entityId: string): Promise<number> {
    assertTenantContext(ctx);
    this.assertWriteAccess(ctx, entityId);

    const entity = await this.knowledgeRepository.getById(ctx.tenantId, entityId);
    if (!entity) {
      throw new KnowledgeEntityNotFoundError(entityId, ctx.tenantId);
    }
    assertEntityTenantScope(entity, ctx.tenantId);

    return this.embeddingRepository.deleteByEntity(ctx.tenantId, entityId);
  }

  async semanticSearch(
    ctx: AuroraRuntimeContext,
    vector: readonly number[],
    options?: VectorSearchOptions,
  ): Promise<readonly ScoredEmbeddingMatch[]> {
    assertTenantContext(ctx);
    this.assertReadAccess(ctx, options?.brandId ?? ctx.tenantId);
    validateEmbeddingVector(vector);

    return this.embeddingRepository.searchSimilar(ctx.tenantId, vector, options);
  }

  async reindexTenant(ctx: AuroraRuntimeContext): Promise<ReindexResult> {
    assertTenantContext(ctx);
    this.assertWriteAccess(ctx, ctx.tenantId);

    const entities = await this.knowledgeRepository.list(ctx.tenantId);
    let indexed = 0;
    let removed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const entity of entities) {
      try {
        const result = await this.indexEntity(ctx, entity.id);
        indexed += result.chunksIndexed;
        removed += result.chunksRemoved;
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : "Unknown indexing failure.";
        errors.push(`${entity.id}: ${message}`);
      }
    }

    return {
      indexed,
      removed,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

/** Deterministic test provider — maps text to a stable 1536-dimensional vector. */
export class DeterministicEmbeddingProvider implements EmbeddingProvider {
  async embed(text: string): Promise<readonly number[]> {
    const digest = createHash("sha256").update(text, "utf8").digest();
    const vector = Array.from({ length: EMBEDDING_VECTOR_DIMENSION }, (_, index) => {
      const byte = digest[index % digest.length]!;
      return Number(((byte / 255) * 2 - 1).toFixed(6));
    });
    validateEmbeddingVector(vector);
    return vector;
  }

  async embedBatch(texts: readonly string[]): Promise<readonly (readonly number[])[]> {
    return Promise.all(texts.map((text) => this.embed(text)));
  }
}
