import type { AuroraStoreBacking } from "@/lib/aurora/persistence/AuroraStoreBacking";
import { AURORA_FOUNDATION_VERSION } from "@/lib/aurora/constants";

export const AURORA_SEED_TENANT_ID = "tenant-orania";

/** Creates an empty Aurora store backing for PlatformStore integration. */
export function createAuroraStore(): AuroraStoreBacking {
  return {
    tenants: new Map(),
    brands: new Map(),
    tenantConfigs: new Map(),
    schedules: new Map(),
    idempotencyKeys: new Map(),
  };
}

/** Returns true when the backing has no registered tenants. */
export function isAuroraStoreEmpty(store: AuroraStoreBacking): boolean {
  return store.tenants.size === 0;
}

/** Seeds default tenant configuration for development and tests (idempotent). */
export function seedAuroraStore(
  store: AuroraStoreBacking,
  tenantId = AURORA_SEED_TENANT_ID,
): void {
  if (store.tenants.has(tenantId)) {
    return;
  }

  const now = new Date().toISOString();
  store.tenants.set(tenantId, {
    id: tenantId,
    name: "Orania Seed Tenant",
    slug: "orania",
    tier: "professional",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  store.tenantConfigs.set(tenantId, {
    tenantId,
    tier: "professional",
    approvalPolicy: {},
    tokenBudget: 50_000,
    featureOverrides: {},
    limits: { maxBrands: 5, maxStorageMb: 1024, dailyAgentTokens: 50_000 },
  });
}

export function getAuroraFoundationVersion(): string {
  return AURORA_FOUNDATION_VERSION;
}
