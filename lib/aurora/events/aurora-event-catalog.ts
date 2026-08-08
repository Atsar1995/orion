export const AURORA_EVENT_TENANT_CREATED = "aurora.tenant.created";
export const AURORA_EVENT_TENANT_UPDATED = "aurora.tenant.updated";
export const AURORA_EVENT_TENANT_PROVISIONED = "aurora.tenant.provisioned";
export const AURORA_EVENT_BRAND_CREATED = "aurora.brand.created";
export const AURORA_EVENT_BRAND_UPDATED = "aurora.brand.updated";
export const AURORA_EVENT_PLATFORM_READY = "aurora.platform.ready";
export const AURORA_EVENT_PLATFORM_DEGRADED = "aurora.platform.degraded";
export const AURORA_EVENT_PLATFORM_SHUTDOWN = "aurora.platform.shutdown";

export const AURORA_EVENT_CATALOG = [
  AURORA_EVENT_TENANT_CREATED,
  AURORA_EVENT_TENANT_UPDATED,
  AURORA_EVENT_TENANT_PROVISIONED,
  AURORA_EVENT_BRAND_CREATED,
  AURORA_EVENT_BRAND_UPDATED,
  AURORA_EVENT_PLATFORM_READY,
  AURORA_EVENT_PLATFORM_DEGRADED,
  AURORA_EVENT_PLATFORM_SHUTDOWN,
] as const;
