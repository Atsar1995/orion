import {
  DEFAULT_RETRIEVAL_TOP_K,
  MIN_EMBEDDING_SIMILARITY,
  type VectorSearchOptions,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import { KnowledgeTenantBoundaryError } from "@/lib/aurora/knowledge/repositories/KnowledgeRepository";

/** pgvector dimension for knowledge embeddings (ES-AURORA-007 §9.5). */
export const EMBEDDING_VECTOR_DIMENSION = 1536 as const;

export class KnowledgeEmbeddingAlreadyExistsError extends Error {
  readonly name = "KnowledgeEmbeddingAlreadyExistsError";

  constructor(entityId: string, chunkIndex: number, tenantId: string) {
    super(
      `Knowledge embedding already exists for entity ${entityId} chunk ${chunkIndex} (tenant ${tenantId}).`,
    );
  }
}

export class KnowledgeEmbeddingNotFoundError extends Error {
  readonly name = "KnowledgeEmbeddingNotFoundError";

  constructor(identifier: string, tenantId: string) {
    super(`Knowledge embedding not found: ${identifier} (tenant ${tenantId}).`);
  }
}

export class KnowledgeInvalidEmbeddingVectorError extends Error {
  readonly name = "KnowledgeInvalidEmbeddingVectorError";

  constructor(message: string) {
    super(message);
  }
}

/** Persisted knowledge embedding chunk (migration 009). */
export type KnowledgeEmbeddingRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly brandId: string;
  readonly entityId: string;
  readonly chunkIndex: number;
  readonly embedding: readonly number[];
  readonly contentHash: string;
  readonly createdAt: string;
};

export type CreateKnowledgeEmbeddingInput = {
  readonly tenantId: string;
  readonly brandId: string;
  readonly entityId: string;
  readonly chunkIndex: number;
  readonly embedding: readonly number[];
  readonly contentHash: string;
  readonly createdAt?: string;
};

/** Vector similarity search result at the persistence layer. */
export type ScoredEmbeddingMatch = {
  readonly embedding: KnowledgeEmbeddingRecord;
  readonly similarity: number;
};

export interface EmbeddingRepository {
  save(tenantId: string, input: CreateKnowledgeEmbeddingInput): Promise<KnowledgeEmbeddingRecord>;
  getById(tenantId: string, embeddingId: string): Promise<KnowledgeEmbeddingRecord | null>;
  listByEntity(tenantId: string, entityId: string): Promise<readonly KnowledgeEmbeddingRecord[]>;
  deleteByEntity(tenantId: string, entityId: string): Promise<number>;
  deleteById(tenantId: string, embeddingId: string): Promise<void>;
  searchSimilar(
    tenantId: string,
    vector: readonly number[],
    options?: VectorSearchOptions,
  ): Promise<readonly ScoredEmbeddingMatch[]>;
}

export function validateEmbeddingVector(vector: readonly number[]): void {
  if (vector.length !== EMBEDDING_VECTOR_DIMENSION) {
    throw new KnowledgeInvalidEmbeddingVectorError(
      `Embedding vector must have ${EMBEDDING_VECTOR_DIMENSION} dimensions, received ${vector.length}.`,
    );
  }

  for (let index = 0; index < vector.length; index += 1) {
    const value = vector[index];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new KnowledgeInvalidEmbeddingVectorError(
        `Embedding vector contains a non-finite value at index ${index}.`,
      );
    }
  }
}

export function formatEmbeddingVectorForPostgres(vector: readonly number[]): string {
  validateEmbeddingVector(vector);
  return `[${vector.join(",")}]`;
}

export function cosineSimilarity(
  left: readonly number[],
  right: readonly number[],
): number {
  validateEmbeddingVector(left);
  validateEmbeddingVector(right);

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;

  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index]!;
    const rightValue = right[index]!;
    dot += leftValue * rightValue;
    leftNorm += leftValue * leftValue;
    rightNorm += rightValue * rightValue;
  }

  if (leftNorm === 0 || rightNorm === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

export function assertEmbeddingTenantScope(
  record: Pick<KnowledgeEmbeddingRecord, "tenantId">,
  tenantId: string,
): void {
  if (record.tenantId !== tenantId) {
    throw new KnowledgeTenantBoundaryError(
      `Embedding tenant ${record.tenantId} does not match scope ${tenantId}.`,
    );
  }
}

export function assertCreateEmbeddingTenantScope(
  input: CreateKnowledgeEmbeddingInput,
  tenantId: string,
): void {
  if (input.tenantId !== tenantId) {
    throw new KnowledgeTenantBoundaryError(
      `Embedding input tenant ${input.tenantId} does not match scope ${tenantId}.`,
    );
  }
}

export function resolveEmbeddingSearchDefaults(options?: VectorSearchOptions): {
  readonly topK: number;
  readonly minSimilarity: number;
} {
  return {
    topK: options?.topK ?? DEFAULT_RETRIEVAL_TOP_K,
    minSimilarity: options?.minSimilarity ?? MIN_EMBEDDING_SIMILARITY,
  };
}

export function compareScoredEmbeddingMatches(
  left: ScoredEmbeddingMatch,
  right: ScoredEmbeddingMatch,
): number {
  if (right.similarity !== left.similarity) {
    return right.similarity - left.similarity;
  }

  const entityCompare = left.embedding.entityId.localeCompare(right.embedding.entityId);
  if (entityCompare !== 0) {
    return entityCompare;
  }

  return left.embedding.chunkIndex - right.embedding.chunkIndex;
}
