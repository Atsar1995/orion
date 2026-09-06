import { describe, expect, it } from "vitest";
import {
  EMBEDDING_VECTOR_DIMENSION,
  InMemoryEmbeddingRepository,
  KnowledgeEmbeddingAlreadyExistsError,
  KnowledgeEmbeddingNotFoundError,
  KnowledgeInvalidEmbeddingVectorError,
  KnowledgeTenantBoundaryError,
} from "@/lib/aurora/knowledge/repositories";
import { MIN_EMBEDDING_SIMILARITY } from "@/lib/aurora/knowledge/types/RetrievalTypes";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const TENANT_B = "660e8400-e29b-41d4-a716-446655440002";
const BRAND_A = "770e8400-e29b-41d4-a716-446655440003";
const BRAND_B = "880e8400-e29b-41d4-a716-446655440004";
const ENTITY_A = "knw_550e8400-e29b-41d4-a716-446655440000";
const ENTITY_B = "knw_660e8400-e29b-41d4-a716-446655440001";

function createVector(seed: number): number[] {
  return Array.from({ length: EMBEDDING_VECTOR_DIMENSION }, (_, index) => {
    const value = Math.sin(seed + index * 0.01);
    return Number(value.toFixed(6));
  });
}

function unitVector(dimensionIndex: number): number[] {
  const vector = createVector(0);
  vector[dimensionIndex] = 1;
  return vector;
}

function createInput(
  tenantId: string,
  brandId: string,
  entityId: string,
  chunkIndex: number,
  seed: number,
  contentHash: string,
) {
  return {
    tenantId,
    brandId,
    entityId,
    chunkIndex,
    embedding: createVector(seed),
    contentHash,
  };
}

describe("InMemoryEmbeddingRepository", () => {
  it("creates an embedding chunk", async () => {
    const repository = new InMemoryEmbeddingRepository();
    const saved = await repository.save(
      TENANT_A,
      createInput(TENANT_A, BRAND_A, ENTITY_A, 0, 1, "hash-a-0"),
    );

    expect(saved.tenantId).toBe(TENANT_A);
    expect(saved.entityId).toBe(ENTITY_A);
    expect(saved.chunkIndex).toBe(0);
    expect(saved.embedding).toHaveLength(EMBEDDING_VECTOR_DIMENSION);
  });

  it("gets an embedding by id", async () => {
    const repository = new InMemoryEmbeddingRepository();
    const saved = await repository.save(
      TENANT_A,
      createInput(TENANT_A, BRAND_A, ENTITY_A, 0, 2, "hash-a-0"),
    );

    await expect(repository.getById(TENANT_A, saved.id)).resolves.toEqual(saved);
    await expect(repository.getById(TENANT_A, "missing-id")).resolves.toBeNull();
  });

  it("lists embeddings by entity in deterministic chunk order", async () => {
    const repository = new InMemoryEmbeddingRepository();
    await repository.save(TENANT_A, createInput(TENANT_A, BRAND_A, ENTITY_A, 1, 3, "hash-a-1"));
    await repository.save(TENANT_A, createInput(TENANT_A, BRAND_A, ENTITY_A, 0, 4, "hash-a-0"));

    const listed = await repository.listByEntity(TENANT_A, ENTITY_A);
    expect(listed.map((record) => record.chunkIndex)).toEqual([0, 1]);
  });

  it("deletes embeddings by entity and by id", async () => {
    const repository = new InMemoryEmbeddingRepository();
    const first = await repository.save(
      TENANT_A,
      createInput(TENANT_A, BRAND_A, ENTITY_A, 0, 5, "hash-a-0"),
    );
    await repository.save(TENANT_A, createInput(TENANT_A, BRAND_A, ENTITY_A, 1, 6, "hash-a-1"));

    await expect(repository.deleteByEntity(TENANT_A, ENTITY_A)).resolves.toBe(2);
    await expect(repository.listByEntity(TENANT_A, ENTITY_A)).resolves.toEqual([]);

    const second = await repository.save(
      TENANT_A,
      createInput(TENANT_A, BRAND_A, ENTITY_B, 0, 7, "hash-b-0"),
    );
    await repository.deleteById(TENANT_A, second.id);
    await expect(repository.getById(TENANT_A, second.id)).resolves.toBeNull();
    await expect(repository.deleteById(TENANT_A, first.id)).rejects.toBeInstanceOf(
      KnowledgeEmbeddingNotFoundError,
    );
  });

  it("rejects duplicate chunk identity", async () => {
    const repository = new InMemoryEmbeddingRepository();
    await repository.save(TENANT_A, createInput(TENANT_A, BRAND_A, ENTITY_A, 0, 8, "hash-a-0"));

    await expect(
      repository.save(TENANT_A, createInput(TENANT_A, BRAND_A, ENTITY_A, 0, 9, "hash-a-0-different")),
    ).rejects.toBeInstanceOf(KnowledgeEmbeddingAlreadyExistsError);
  });

  it("enforces tenant isolation on read and write", async () => {
    const repository = new InMemoryEmbeddingRepository();
    const saved = await repository.save(
      TENANT_A,
      createInput(TENANT_A, BRAND_A, ENTITY_A, 0, 10, "hash-a-0"),
    );

    await expect(repository.getById(TENANT_B, saved.id)).resolves.toBeNull();
    await expect(repository.listByEntity(TENANT_B, ENTITY_A)).resolves.toEqual([]);
    await expect(
      repository.save(TENANT_A, createInput(TENANT_B, BRAND_B, ENTITY_B, 0, 11, "hash-b-0")),
    ).rejects.toBeInstanceOf(KnowledgeTenantBoundaryError);
  });

  it("filters vector search by brand", async () => {
    const repository = new InMemoryEmbeddingRepository();
    await repository.save(TENANT_A, createInput(TENANT_A, BRAND_A, ENTITY_A, 0, 12, "hash-a-0"));
    await repository.save(TENANT_A, createInput(TENANT_A, BRAND_B, ENTITY_B, 0, 12, "hash-b-0"));

    const query = unitVector(0);
    const brandMatches = await repository.searchSimilar(TENANT_A, query, { brandId: BRAND_A });
    expect(brandMatches).toHaveLength(1);
    expect(brandMatches[0]?.embedding.brandId).toBe(BRAND_A);
  });

  it("validates embedding vector dimensionality", async () => {
    const repository = new InMemoryEmbeddingRepository();

    await expect(
      repository.save(TENANT_A, {
        tenantId: TENANT_A,
        brandId: BRAND_A,
        entityId: ENTITY_A,
        chunkIndex: 0,
        embedding: [0.1, 0.2],
        contentHash: "invalid-dim",
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidEmbeddingVectorError);

    await expect(repository.searchSimilar(TENANT_A, [0.1, 0.2])).rejects.toBeInstanceOf(
      KnowledgeInvalidEmbeddingVectorError,
    );
  });

  it("orders similarity results by score descending", async () => {
    const repository = new InMemoryEmbeddingRepository();
    const query = unitVector(0);

    await repository.save(TENANT_A, createInput(TENANT_A, BRAND_A, ENTITY_A, 0, 20, "low"));
    await repository.save(
      TENANT_A,
      {
        ...createInput(TENANT_A, BRAND_A, ENTITY_B, 0, 21, "high"),
        embedding: query,
      },
    );

    const matches = await repository.searchSimilar(TENANT_A, query, {
      minSimilarity: 0,
      topK: 2,
    });
    expect(matches[0]?.similarity).toBeGreaterThanOrEqual(matches[1]?.similarity ?? 0);
    expect(matches[0]?.embedding.entityId).toBe(ENTITY_B);
  });

  it("applies minimum similarity threshold", async () => {
    const repository = new InMemoryEmbeddingRepository();
    const query = unitVector(0);
    await repository.save(TENANT_A, createInput(TENANT_A, BRAND_A, ENTITY_A, 0, 30, "low-match"));

    await expect(
      repository.searchSimilar(TENANT_A, query, { minSimilarity: 0.99 }),
    ).resolves.toEqual([]);
    await expect(
      repository.searchSimilar(TENANT_A, query, { minSimilarity: MIN_EMBEDDING_SIMILARITY }),
    ).resolves.toEqual([]);
  });

  it("uses deterministic tie ordering for equal similarity", async () => {
    const repository = new InMemoryEmbeddingRepository();
    const query = unitVector(0);
    const sharedEmbedding = query;

    await repository.save(
      TENANT_A,
      {
        ...createInput(TENANT_A, BRAND_A, ENTITY_B, 0, 40, "tie-b"),
        embedding: sharedEmbedding,
      },
    );
    await repository.save(
      TENANT_A,
      {
        ...createInput(TENANT_A, BRAND_A, ENTITY_A, 0, 41, "tie-a"),
        embedding: sharedEmbedding,
      },
    );

    const matches = await repository.searchSimilar(TENANT_A, query, {
      minSimilarity: 0,
      topK: 2,
    });

    expect(matches.map((match) => match.embedding.entityId)).toEqual([ENTITY_A, ENTITY_B]);
  });
});
