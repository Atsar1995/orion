import { describe, expect, it, vi } from "vitest";
import type { ScoredEntity } from "@/lib/aurora/knowledge/types/RetrievalTypes";
import {
  DefaultMemorySearchEngine,
  MEMORY_SEARCH_UNAVAILABLE_REASON,
  MemoryTierUnavailableError,
  createUnavailableMemorySearchResult,
} from "@/lib/aurora/knowledge/retrieval/MemorySearchEngine";
import { KnowledgeInvalidTenantContextError } from "@/lib/aurora/knowledge/services/KnowledgeService";
import { DefaultAuroraAuthorizationService } from "@/lib/aurora/identity/AuroraAuthorizationService";
import { AuroraError } from "@/lib/aurora/errors/AuroraError";
import { createTestAuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraContextFactory";

const TENANT_A = "550e8400-e29b-41d4-a716-446655440001";

function createContext(tenantId: string) {
  return createTestAuroraRuntimeContext({
    tenantId,
    userId: "usr_test",
  });
}

describe("MemorySearchEngine", () => {
  it("returns no fabricated memory entities", async () => {
    const engine = new DefaultMemorySearchEngine(new DefaultAuroraAuthorizationService());
    const result = await engine.search(createContext(TENANT_A), { query: "memory lookup" });

    expect(result.entities).toEqual([]);
  });

  it("returns an empty result on normal calls", async () => {
    const engine = new DefaultMemorySearchEngine(new DefaultAuroraAuthorizationService());
    const result = await engine.search(createContext(TENANT_A), { query: "brand preferences" });

    expect(result.entities).toHaveLength(0);
  });

  it("represents memory degradation explicitly for HybridSearchEngine", async () => {
    const engine = new DefaultMemorySearchEngine(new DefaultAuroraAuthorizationService());
    const result = await engine.search(createContext(TENANT_A), { query: "session history" });

    expect(result.degraded).toBe(true);
    expect(result.excludeMemoryScore).toBe(true);
    expect(result.degradationReason).toContain("Sprint 4");
  });

  it("models ERR-3 by excluding memory contribution", async () => {
    const result = createUnavailableMemorySearchResult();

    expect(result.entities).toEqual([]);
    expect(result.excludeMemoryScore).toBe(true);
    expect(result.degraded).toBe(true);
  });

  it("uses ctx.tenantId as tenant authority", async () => {
    const authorization = new DefaultAuroraAuthorizationService();
    const assertTenantAccess = vi.spyOn(authorization, "assertTenantAccess");
    const engine = new DefaultMemorySearchEngine(authorization);
    const ctx = createContext(TENANT_A);

    await engine.search(ctx, { query: "memory" });

    expect(assertTenantAccess).toHaveBeenCalledWith(ctx, TENANT_A, expect.any(Object));
  });

  it("rejects unauthorized memory reads", async () => {
    const engine = new DefaultMemorySearchEngine(new DefaultAuroraAuthorizationService());
    const ctx = createTestAuroraRuntimeContext({
      tenantId: TENANT_A,
      userId: "usr_viewer",
      roles: ["aurora.viewer"],
      auroraPermissions: ["aurora.knowledge.write"],
    });

    await expect(engine.search(ctx, { query: "memory" })).rejects.toBeInstanceOf(AuroraError);
  });

  it("does not fabricate or filter memory entities when validatedOnly is set", async () => {
    const engine = new DefaultMemorySearchEngine(new DefaultAuroraAuthorizationService());
    const result = await engine.search(createContext(TENANT_A), {
      query: "memory",
      validatedOnly: true,
    });

    expect(result.entities).toEqual([]);
  });

  it("does not import semantic retrieval engines", async () => {
    const module = await import("@/lib/aurora/knowledge/retrieval/MemorySearchEngine");
    expect(module).not.toHaveProperty("DefaultSemanticSearchEngine");
  });

  it("does not import keyword retrieval engines", async () => {
    const module = await import("@/lib/aurora/knowledge/retrieval/MemorySearchEngine");
    expect(module).not.toHaveProperty("DefaultKeywordSearchEngine");
  });

  it("does not import graph retrieval engines", async () => {
    const module = await import("@/lib/aurora/knowledge/retrieval/MemorySearchEngine");
    expect(module).not.toHaveProperty("DefaultGraphSearchEngine");
  });

  it("returns deterministic empty results across repeated calls", async () => {
    const engine = new DefaultMemorySearchEngine(new DefaultAuroraAuthorizationService());
    const ctx = createContext(TENANT_A);
    const query = { query: "deterministic memory" };

    const first = await engine.search(ctx, query);
    const second = await engine.search(ctx, query);

    expect(first).toEqual(second);
  });

  it("remains compatible with the canonical ScoredEntity type", () => {
    const entities: readonly ScoredEntity[] = createUnavailableMemorySearchResult().entities;
    expect(Array.isArray(entities)).toBe(true);
    expect(entities).toEqual([]);
  });

  it("requires tenant context", async () => {
    const engine = new DefaultMemorySearchEngine(new DefaultAuroraAuthorizationService());

    await expect(
      engine.search(createTestAuroraRuntimeContext({ tenantId: "", userId: "usr_test" }), {
        query: "memory",
      }),
    ).rejects.toBeInstanceOf(KnowledgeInvalidTenantContextError);
  });

  it("exposes MemoryTierUnavailableError for ERR-3 consumers", () => {
    const error = new MemoryTierUnavailableError(MEMORY_SEARCH_UNAVAILABLE_REASON);
    expect(error.excludeMemoryScore).toBe(true);
    expect(error.name).toBe("MemoryTierUnavailableError");
  });
});
