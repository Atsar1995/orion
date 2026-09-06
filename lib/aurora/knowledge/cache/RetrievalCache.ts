import { RETRIEVAL_CACHE_TTL_SECONDS } from "@/lib/aurora/knowledge/cache/retrievalCacheKeys";
import type { RetrievalResult } from "@/lib/aurora/knowledge/types/RetrievalTypes";

export type RetrievalCacheInvalidationScope = {
  readonly tenantId: string;
  readonly brandId?: string;
  readonly queryHash?: string;
};

export interface RetrievalCache {
  get(key: string): Promise<RetrievalResult | undefined>;
  set(key: string, value: RetrievalResult, ttlSeconds?: number): Promise<void>;
  invalidate(scope: RetrievalCacheInvalidationScope): Promise<number>;
}

type CacheEntry = {
  readonly value: RetrievalResult;
  readonly expiresAt: number;
};

function matchesInvalidationScope(
  key: string,
  scope: RetrievalCacheInvalidationScope,
): boolean {
  const segments = key.split(":");

  if (segments.length !== 5 || segments[0] !== "aurora" || segments[1] !== "retrieval") {
    return false;
  }

  const [, , tenantId, brandId, queryHash] = segments;

  if (tenantId !== scope.tenantId) {
    return false;
  }

  if (scope.brandId !== undefined && brandId !== scope.brandId) {
    return false;
  }

  if (scope.queryHash !== undefined && queryHash !== scope.queryHash) {
    return false;
  }

  return true;
}

export class InMemoryRetrievalCache implements RetrievalCache {
  private readonly entries = new Map<string, CacheEntry>();

  async get(key: string): Promise<RetrievalResult | undefined> {
    const entry = this.entries.get(key);

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }

    return structuredClone(entry.value);
  }

  async set(
    key: string,
    value: RetrievalResult,
    ttlSeconds: number = RETRIEVAL_CACHE_TTL_SECONDS,
  ): Promise<void> {
    this.entries.set(key, {
      value: structuredClone(value),
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async invalidate(scope: RetrievalCacheInvalidationScope): Promise<number> {
    let removed = 0;

    for (const key of [...this.entries.keys()]) {
      if (matchesInvalidationScope(key, scope)) {
        this.entries.delete(key);
        removed += 1;
      }
    }

    return removed;
  }
}
