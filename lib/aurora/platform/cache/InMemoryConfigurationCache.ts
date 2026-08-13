import type { ConfigurationCache } from "@/lib/aurora/platform/cache/ConfigurationCache";

type CacheEntry = {
  readonly value: unknown;
  readonly expiresAt: number;
};

export class InMemoryConfigurationCache implements ConfigurationCache {
  private readonly entries = new Map<string, CacheEntry>();

  async get(cacheKey: string): Promise<unknown | undefined> {
    const entry = this.entries.get(cacheKey);

    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(cacheKey);
      return undefined;
    }

    return entry.value;
  }

  async set(
    cacheKey: string,
    value: unknown,
    ttlSeconds: number,
  ): Promise<void> {
    this.entries.set(cacheKey, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async invalidate(pattern: string): Promise<number> {
    const regex = this.patternToRegex(pattern);
    let removed = 0;

    for (const key of this.entries.keys()) {
      if (regex.test(key)) {
        this.entries.delete(key);
        removed += 1;
      }
    }

    return removed;
  }

  async invalidateTenant(tenantId: string): Promise<void> {
    await this.invalidate(`tenant:${tenantId}:*`);
  }

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^${escaped.replace(/\\\*/g, ".*")}$`);
  }
}