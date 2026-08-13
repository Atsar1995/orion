import type { TenantConfig } from "@/types/aurora-admin";

export interface ConfigurationCache {
  get(tenantId: string): TenantConfig | null;
  set(tenantId: string, config: TenantConfig): void;
  invalidate(tenantId: string): void;
  clear(): void;
}