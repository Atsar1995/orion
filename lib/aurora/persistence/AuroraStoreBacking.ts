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

export type WorkspaceConfigRecord = {
  readonly tenantId: string;
  readonly userId: string;
  readonly activeBrandId: string | null;
  readonly dashboardLayout: Readonly<Record<string, unknown>>;
  readonly notificationPreferences: Readonly<Record<string, unknown>>;
};

export type AuroraStoreBacking = {
  readonly tenants: Map<string, Tenant>;
  readonly businesses: Map<string, BusinessEntity>;
  readonly brands: Map<string, Brand>;
  readonly tenantConfigs: Map<string, TenantConfig>;
  readonly workspaceConfigs: Map<string, WorkspaceConfigRecord>;
  readonly schedules: Map<string, ScheduleEntryRecord>;
  readonly idempotencyKeys: Map<string, string>;
};
