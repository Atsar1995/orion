import type { GA4MetricsSnapshot } from "@/types/google-analytics";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

/** In-memory TTL cache for GA4 API responses. */
export class GA4Cache {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly defaultTtlMs: number) {}

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidate(key?: string): void {
    if (key) {
      this.store.delete(key);
      return;
    }

    this.store.clear();
  }

  snapshotKey(propertyId: string): string {
    return `ga4:snapshot:${propertyId}`;
  }

  getSnapshot(propertyId: string): GA4MetricsSnapshot | undefined {
    return this.get<GA4MetricsSnapshot>(this.snapshotKey(propertyId));
  }

  setSnapshot(propertyId: string, snapshot: GA4MetricsSnapshot, ttlMs?: number): void {
    this.set(this.snapshotKey(propertyId), snapshot, ttlMs);
  }
}
