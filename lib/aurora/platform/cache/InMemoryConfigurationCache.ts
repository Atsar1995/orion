import type { TenantConfig } from "@/types/aurora-admin";
import type { ConfigurationCache } from "@/lib/aurora/platform/cache/ConfigurationCache";

export class InMemoryConfigurationCache implements ConfigurationCache {
  private readonly entries = new Map<string, TenantConfig>();

  get(tenantId: string): TenantConfig | null {
    return this.entries.get(tenantId) ?? null;
  }

  set(tenantId: string, config: TenantConfig): void {
    this.entries.set(tenantId, config);
  }

  invalidate(tenantId: string): void {
    this.entries.delete(tenantId);
  }

  clear(): void {
    this.entries.clear();
  }
}