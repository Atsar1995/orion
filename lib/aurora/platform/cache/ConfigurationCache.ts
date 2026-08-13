export interface ConfigurationCache {
  get(cacheKey: string): Promise<unknown | undefined>;
  set(cacheKey: string, value: unknown, ttlSeconds: number): Promise<void>;
  invalidate(pattern: string): Promise<number>;
  invalidateTenant(tenantId: string): Promise<void>;
}