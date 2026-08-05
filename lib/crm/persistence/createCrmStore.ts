import type {
  CrmOrganizationFoundationRecord,
  CrmStoreBacking,
} from "@/lib/crm/persistence/CrmStoreBacking";

export const CRM_SEED_ORG_ID = "org-orania";

export const CRM_FOUNDATION_VERSION = "P-008.9";

/** Creates an empty CRM store backing for PlatformStore integration. */
export function createCrmStore(): CrmStoreBacking {
  return {
    organizationFoundations: new Map(),
    accounts: new Map(),
    contacts: new Map(),
    organizations: new Map(),
    leads: new Map(),
    opportunities: new Map(),
    quotes: new Map(),
    activities: new Map(),
    cases: new Map(),
    salesOrders: new Map(),
    notes: new Map(),
    attachments: new Map(),
    idempotencyKeys: new Map(),
    entityRegistry: new Map(),
  };
}

/** Registers an organization foundation marker (idempotent). */
export function registerOrganizationFoundation(
  store: CrmStoreBacking,
  organizationId: string,
): CrmOrganizationFoundationRecord {
  const existing = store.organizationFoundations.get(organizationId);
  if (existing) {
    return existing;
  }

  const record: CrmOrganizationFoundationRecord = {
    organizationId,
    registeredAt: new Date().toISOString(),
    foundationVersion: CRM_FOUNDATION_VERSION,
  };

  store.organizationFoundations.set(organizationId, record);
  return record;
}

/** Returns true when the organization has a foundation marker in backing. */
export function isOrganizationRegistered(store: CrmStoreBacking, organizationId: string): boolean {
  return store.organizationFoundations.has(organizationId);
}

/** Seeds foundation organization markers into a CRM store backing (idempotent). */
export function seedCrmStore(store: CrmStoreBacking, organizationId = CRM_SEED_ORG_ID): void {
  registerOrganizationFoundation(store, organizationId);
}

/** Returns true when the backing has no registered organization foundations. */
export function isCrmStoreEmpty(store: CrmStoreBacking): boolean {
  return store.organizationFoundations.size === 0;
}

/** Resets legacy singleton backing — retained for test harness compatibility (P-008.18). */
export function resetDefaultCrmBackingForTests(): void {
  // No-op: TD-002 process-wide backing retired; PlatformStore owns CRM backing lifetime.
}
