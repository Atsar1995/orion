import type {
  ProcurementOrganizationFoundationRecord,
  ProcurementStoreBacking,
} from "@/lib/procurement/persistence/ProcurementStoreBacking";

export const PROCUREMENT_SEED_ORG_ID = "org-orania";

export const PROCUREMENT_FOUNDATION_VERSION = "P-010.3";

/** Creates an empty Procurement store backing for PlatformStore integration. */
export function createProcurementStore(): ProcurementStoreBacking {
  return {
    organizationFoundations: new Map(),
    vendors: new Map(),
    vendorContacts: new Map(),
    catalogs: new Map(),
    catalogItems: new Map(),
    items: new Map(),
    requisitions: new Map(),
    purchaseApprovals: new Map(),
    rfqs: new Map(),
    quotations: new Map(),
    purchaseOrders: new Map(),
    purchaseContracts: new Map(),
    goodsReceipts: new Map(),
    receivingLines: new Map(),
    supplierInvoices: new Map(),
    vendorScorecards: new Map(),
    idempotencyKeys: new Map(),
    entityRegistry: new Map(),
  };
}

/** Registers an organization foundation marker (idempotent). */
export function registerOrganizationFoundation(
  store: ProcurementStoreBacking,
  organizationId: string,
): ProcurementOrganizationFoundationRecord {
  const existing = store.organizationFoundations.get(organizationId);
  if (existing) {
    return existing;
  }

  const record: ProcurementOrganizationFoundationRecord = {
    organizationId,
    registeredAt: new Date().toISOString(),
    foundationVersion: PROCUREMENT_FOUNDATION_VERSION,
  };

  store.organizationFoundations.set(organizationId, record);
  return record;
}

/** Returns true when the organization has a foundation marker in backing. */
export function isOrganizationRegistered(
  store: ProcurementStoreBacking,
  organizationId: string,
): boolean {
  return store.organizationFoundations.has(organizationId);
}

/** Seeds foundation organization markers into a Procurement store backing (idempotent). */
export function seedProcurementStore(
  store: ProcurementStoreBacking,
  organizationId = PROCUREMENT_SEED_ORG_ID,
): void {
  registerOrganizationFoundation(store, organizationId);
}

/** Returns true when the backing has no registered organization foundations. */
export function isProcurementStoreEmpty(store: ProcurementStoreBacking): boolean {
  return store.organizationFoundations.size === 0;
}

/** Resets legacy singleton backing — retained for test harness compatibility. */
export function resetDefaultProcurementBackingForTests(): void {
  // No-op: PlatformStore owns Procurement backing lifetime.
}
