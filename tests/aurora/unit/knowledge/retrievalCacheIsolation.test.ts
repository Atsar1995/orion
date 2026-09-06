import { describe, expect, it } from "vitest";
import {
  InMemoryRetrievalCache,
  RETRIEVAL_CACHE_UNSCOPED_BRAND,
  buildRetrievalCacheKey,
  buildRetrievalQueryHash,
} from "@/lib/aurora/knowledge/cache";
import { buildRetrievalQueryFromRequest } from "@/lib/aurora/knowledge/services/retrievalOrchestration";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";
const TENANT_B = "550e8400-e29b-41d4-a716-446655440002";
const BRAND_A = "770e8400-e29b-41d4-a716-446655440003";
const BRAND_B = "880e8400-e29b-41d4-a716-446655440004";

describe("retrieval cache isolation", () => {
  it("uses tenant-prefixed cache keys", () => {
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_test",
      brandId: BRAND_A,
      auroraPermissions: ["aurora.knowledge.read"],
    });
    const request = { taskType: "content_generation" as const, query: "brand voice" };
    const retrievalQuery = buildRetrievalQueryFromRequest(ctx, request);
    const key = buildRetrievalCacheKey(ctx, request, retrievalQuery);

    expect(key.startsWith(`aurora:retrieval:${TENANT_A}:`)).toBe(true);
  });

  it("does not collide across tenants", () => {
    const request = { taskType: "content_generation" as const, query: "brand voice" };
    const ctxA = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_a",
      brandId: BRAND_A,
      auroraPermissions: ["aurora.knowledge.read"],
    });
    const ctxB = createTestAuroraRuntimeContext({
      tenantId: TENANT_B,
      userId: "usr_b",
      brandId: BRAND_A,
      auroraPermissions: ["aurora.knowledge.read"],
    });

    const keyA = buildRetrievalCacheKey(ctxA, request, buildRetrievalQueryFromRequest(ctxA, request));
    const keyB = buildRetrievalCacheKey(ctxB, request, buildRetrievalQueryFromRequest(ctxB, request));

    expect(keyA).not.toEqual(keyB);
  });

  it("does not collide across brands within the same tenant", () => {
    const request = { taskType: "content_generation" as const, query: "brand voice" };
    const ctxBrandA = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_a",
      brandId: BRAND_A,
      auroraPermissions: ["aurora.knowledge.read"],
    });
    const ctxBrandB = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_b",
      brandId: BRAND_B,
      auroraPermissions: ["aurora.knowledge.read"],
    });

    const keyA = buildRetrievalCacheKey(
      ctxBrandA,
      request,
      buildRetrievalQueryFromRequest(ctxBrandA, request),
    );
    const keyB = buildRetrievalCacheKey(
      ctxBrandB,
      request,
      buildRetrievalQueryFromRequest(ctxBrandB, request),
    );

    expect(keyA).not.toEqual(keyB);
  });

  it("uses the unscoped brand sentinel when brandId is absent", () => {
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_test",
      brandId: "",
      auroraPermissions: ["aurora.knowledge.read"],
    });
    const request = { taskType: "content_generation" as const, query: "brand voice" };
    const key = buildRetrievalCacheKey(ctx, request, buildRetrievalQueryFromRequest(ctx, request));

    expect(key).toContain(`:${RETRIEVAL_CACHE_UNSCOPED_BRAND}:`);
  });

  it("separates viewer and admin access profiles for the same query", () => {
    const request = { taskType: "content_generation" as const, query: "brand voice" };
    const viewerCtx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      brandId: BRAND_A,
      roles: ["aurora.viewer"],
      auroraPermissions: [
        "aurora.content.read",
        "aurora.campaign.read",
        "aurora.seo.read",
        "aurora.analytics.read",
        "aurora.creative.read",
        "aurora.knowledge.read",
      ],
    });
    const adminCtx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_admin",
      brandId: BRAND_A,
      roles: ["aurora.admin"],
      auroraPermissions: ["aurora.knowledge.read", "aurora.knowledge.write"],
    });

    const viewerHash = buildRetrievalQueryHash(
      viewerCtx,
      request,
      buildRetrievalQueryFromRequest(viewerCtx, request),
    );
    const adminHash = buildRetrievalQueryHash(
      adminCtx,
      request,
      buildRetrievalQueryFromRequest(adminCtx, request),
    );

    expect(viewerHash).not.toEqual(adminHash);
  });

  it("does not return a tenant B entry for tenant A cache lookups", async () => {
    const cache = new InMemoryRetrievalCache();
    const tenantAKey = `aurora:retrieval:${TENANT_A}:${BRAND_A}:hash-a`;
    const tenantBKey = `aurora:retrieval:${TENANT_B}:${BRAND_A}:hash-a`;

    await cache.set(tenantAKey, {
      confidence: "high",
      contextPackage: {
        layers: [],
        totalTokens: 0,
        maxTokens: 3_000,
        entities: [],
        assembledAt: "2026-09-04T00:00:00.000Z",
      },
      citations: [],
      gaps: [],
      latencyMs: 1,
    });
    await cache.set(tenantBKey, {
      confidence: "insufficient",
      contextPackage: {
        layers: [],
        totalTokens: 0,
        maxTokens: 3_000,
        entities: [],
        assembledAt: "2026-09-04T00:00:00.000Z",
      },
      citations: [],
      gaps: ["tenant b gap"],
      latencyMs: 1,
    });

    const tenantAValue = await cache.get(tenantAKey);
    expect(tenantAValue?.confidence).toBe("high");
    expect(tenantAValue?.gaps).toEqual([]);
  });
});
