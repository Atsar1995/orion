import { InMemoryKnowledgeRepository } from "@/lib/aurora/knowledge/repositories";
import { describe, expect, it } from "vitest";
import {
  ACCURACY_TENANT_B,
  EMBEDDING_INDEX_ENTITY_ID,
  EMBEDDING_INDEX_TENANT_B_ENTITY_ID,
  adminAccuracyCtx,
  createAccuracyStack,
  searchWithRequest,
  tenantBAccuracyCtx,
  uniqueQuery,
} from "@/tests/aurora/helpers/retrievalAccuracyFixtures";
import { createKnowledgeEntity } from "@/tests/aurora/helpers/knowledgeSecurityFixtures";

describe("embeddingIndex — wired integration", () => {
  it("indexes an entity and returns it through semantic retrieval on the wired search path", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const stack = createAccuracyStack(repository);
    const ctx = adminAccuracyCtx();
    const query = uniqueQuery("embedding index retrieval anchor");

    await repository.create(
      ctx.tenantId,
      createKnowledgeEntity(ctx.tenantId, ctx.brandId!, {
        id: EMBEDDING_INDEX_ENTITY_ID,
        entityType: "brand.profile",
        status: "validated",
        title: `${query} indexed brand profile`,
        content: { voice: `${query} indexed semantic anchor` },
      }),
    );

    const firstIndex = await stack.embeddingService.indexEntity(ctx, EMBEDDING_INDEX_ENTITY_ID);
    expect(firstIndex.chunksIndexed).toBeGreaterThan(0);

    const ranked = await searchWithRequest(stack, ctx, {
      taskType: "content_generation",
      query,
    });

    expect(ranked.some((entry) => entry.entity.id === EMBEDDING_INDEX_ENTITY_ID)).toBe(true);
  });

  it("skips unchanged chunks on repeated indexing", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const stack = createAccuracyStack(repository);
    const ctx = adminAccuracyCtx();
    const query = uniqueQuery("embedding index idempotent anchor");

    await repository.create(
      ctx.tenantId,
      createKnowledgeEntity(ctx.tenantId, ctx.brandId!, {
        id: EMBEDDING_INDEX_ENTITY_ID,
        entityType: "brand.profile",
        status: "validated",
        title: `${query} idempotent brand profile`,
        content: { voice: `${query} stable semantic anchor` },
      }),
    );

    const first = await stack.embeddingService.indexEntity(ctx, EMBEDDING_INDEX_ENTITY_ID);
    const second = await stack.embeddingService.indexEntity(ctx, EMBEDDING_INDEX_ENTITY_ID);

    expect(first.chunksIndexed).toBeGreaterThan(0);
    expect(second.chunksIndexed).toBe(0);
    expect(second.chunksSkipped).toBe(first.chunksIndexed);
  });

  it("preserves tenant scope during indexed semantic retrieval", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const stack = createAccuracyStack(repository);
    const tenantAContext = adminAccuracyCtx();
    const tenantBContext = tenantBAccuracyCtx();
    const sharedQuery = uniqueQuery("embedding index tenant scope anchor");

    await repository.create(
      ACCURACY_TENANT_B,
      createKnowledgeEntity(ACCURACY_TENANT_B, tenantBContext.brandId!, {
        id: EMBEDDING_INDEX_TENANT_B_ENTITY_ID,
        entityType: "brand.profile",
        status: "validated",
        title: `${sharedQuery} tenant B indexed profile`,
        content: { voice: `${sharedQuery} tenant B semantic anchor` },
      }),
    );

    await stack.embeddingService.indexEntity(tenantBContext, EMBEDDING_INDEX_TENANT_B_ENTITY_ID);

    const tenantARanked = await searchWithRequest(stack, tenantAContext, {
      taskType: "content_generation",
      query: sharedQuery,
    });
    const tenantBRanked = await searchWithRequest(stack, tenantBContext, {
      taskType: "content_generation",
      query: sharedQuery,
    });

    expect(tenantARanked.some((entry) => entry.entity.id === EMBEDDING_INDEX_TENANT_B_ENTITY_ID)).toBe(
      false,
    );
    expect(tenantBRanked.some((entry) => entry.entity.id === EMBEDDING_INDEX_TENANT_B_ENTITY_ID)).toBe(
      true,
    );
  });
});
