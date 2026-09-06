import { describe, expect, it, vi } from "vitest";
import {
  InMemoryRetrievalCache,
  RETRIEVAL_CACHE_TTL_SECONDS,
  buildRetrievalCacheKey,
  buildRetrievalQueryHash,
} from "@/lib/aurora/knowledge/cache";
import {
  RETRIEVAL_MAX_CONTEXT_TOKENS,
  type RetrievalResult,
} from "@/lib/aurora/knowledge/types/RetrievalTypes";
import { buildRetrievalQueryFromRequest } from "@/lib/aurora/knowledge/services/retrievalOrchestration";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const BRAND_A = "770e8400-e29b-41d4-a716-446655440003";

function createResult(overrides: Partial<RetrievalResult> = {}): RetrievalResult {
  return {
    confidence: "high",
    contextPackage: {
      layers: [],
      totalTokens: 0,
      maxTokens: RETRIEVAL_MAX_CONTEXT_TOKENS,
      entities: [],
      assembledAt: "2026-09-04T00:00:00.000Z",
    },
    citations: [],
    gaps: [],
    latencyMs: 42,
    ...overrides,
  };
}

describe("InMemoryRetrievalCache", () => {
  it("stores and retrieves a result within TTL", async () => {
    const cache = new InMemoryRetrievalCache();
    const key = "aurora:retrieval:tenant-a:brand-a:hash-a";
    const result = createResult({ confidence: "medium" });

    await cache.set(key, result, RETRIEVAL_CACHE_TTL_SECONDS);
    await expect(cache.get(key)).resolves.toEqual(result);
  });

  it("expires entries lazily after TTL", async () => {
    vi.useFakeTimers();
    try {
      const cache = new InMemoryRetrievalCache();
      const key = "aurora:retrieval:tenant-a:brand-a:hash-a";

      await cache.set(key, createResult(), 1);
      vi.advanceTimersByTime(1_500);

      await expect(cache.get(key)).resolves.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("builds deterministic identical cache keys", () => {
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_test",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.knowledge.read"],
    });
    const request = {
      taskType: "content_generation" as const,
      query: "brand voice",
      campaignId: "cmp_123",
      maxTokens: 2_000,
    };
    const retrievalQuery = buildRetrievalQueryFromRequest(ctx, request);

    expect(buildRetrievalCacheKey(ctx, request, retrievalQuery)).toEqual(
      buildRetrievalCacheKey(ctx, request, retrievalQuery),
    );
    expect(buildRetrievalQueryHash(ctx, request, retrievalQuery)).toEqual(
      buildRetrievalQueryHash(ctx, request, retrievalQuery),
    );
  });

  it("invalidates all entries for a tenant", async () => {
    const cache = new InMemoryRetrievalCache();
    await cache.set("aurora:retrieval:tenant-a:brand-a:hash-a", createResult());
    await cache.set("aurora:retrieval:tenant-a:brand-b:hash-b", createResult());
    await cache.set("aurora:retrieval:tenant-b:brand-a:hash-c", createResult());

    const removed = await cache.invalidate({ tenantId: "tenant-a" });

    expect(removed).toBe(2);
    await expect(cache.get("aurora:retrieval:tenant-a:brand-a:hash-a")).resolves.toBeUndefined();
    await expect(cache.get("aurora:retrieval:tenant-b:brand-a:hash-c")).resolves.toEqual(createResult());
  });

  it("invalidates only the requested tenant and brand", async () => {
    const cache = new InMemoryRetrievalCache();
    await cache.set("aurora:retrieval:tenant-a:brand-a:hash-a", createResult());
    await cache.set("aurora:retrieval:tenant-a:brand-b:hash-b", createResult());

    const removed = await cache.invalidate({ tenantId: "tenant-a", brandId: "brand-a" });

    expect(removed).toBe(1);
    await expect(cache.get("aurora:retrieval:tenant-a:brand-a:hash-a")).resolves.toBeUndefined();
    await expect(cache.get("aurora:retrieval:tenant-a:brand-b:hash-b")).resolves.toEqual(createResult());
  });

  it("invalidates only the requested tenant and query hash", async () => {
    const cache = new InMemoryRetrievalCache();
    await cache.set("aurora:retrieval:tenant-a:brand-a:hash-a", createResult());
    await cache.set("aurora:retrieval:tenant-a:brand-b:hash-a", createResult());
    await cache.set("aurora:retrieval:tenant-a:brand-a:hash-b", createResult());

    const removed = await cache.invalidate({ tenantId: "tenant-a", queryHash: "hash-a" });

    expect(removed).toBe(2);
    await expect(cache.get("aurora:retrieval:tenant-a:brand-a:hash-b")).resolves.toEqual(createResult());
  });

  it("invalidates entries matching tenant, brand, and query hash together", async () => {
    const cache = new InMemoryRetrievalCache();
    await cache.set("aurora:retrieval:tenant-a:brand-a:hash-a", createResult());
    await cache.set("aurora:retrieval:tenant-a:brand-b:hash-a", createResult());

    const removed = await cache.invalidate({
      tenantId: "tenant-a",
      brandId: "brand-a",
      queryHash: "hash-a",
    });

    expect(removed).toBe(1);
    await expect(cache.get("aurora:retrieval:tenant-a:brand-b:hash-a")).resolves.toEqual(createResult());
  });

  it("does not mutate stored results on get", async () => {
    const cache = new InMemoryRetrievalCache();
    const key = "aurora:retrieval:tenant-a:brand-a:hash-a";
    const result = createResult({ gaps: ["initial gap"] });

    await cache.set(key, result);
    const cached = await cache.get(key);
    if (cached) {
      (cached.gaps as string[]).push("mutated gap");
    }

    await expect(cache.get(key)).resolves.toEqual(createResult({ gaps: ["initial gap"] }));
  });
});
