/** Shared Aurora persistence collections (ES-AURORA-005). */

import type { Brand, BusinessEntity, Tenant, TenantConfig } from "@/types/aurora-admin";

export type ScheduleEntryRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly brandId?: string;
  readonly scheduledAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly status: "pending" | "dispatched" | "cancelled";
  readonly createdAt: string;
};

export type AuroraStoreBacking = {
  readonly tenants: Map<string, Tenant>;
  readonly businesses: Map<string, BusinessEntity>;
  readonly brands: Map<string, Brand>;
  readonly tenantConfigs: Map<string, TenantConfig>;
  readonly schedules: Map<string, ScheduleEntryRecord>;
  readonly idempotencyKeys: Map<string, string>;
};
