import type {
  ProcurementAggregateRecord,
  ProcurementPersistenceCollection,
  ProcurementStoreBacking,
} from "@/lib/procurement/persistence/ProcurementStoreBacking";

/**
 * Organization-scoped aggregate collections exposed through repository infrastructure (P-010.4).
 * Backing keys use camelCase; domain catalog names in parentheses.
 */
export const PROCUREMENT_PERSISTENCE_COLLECTIONS = [
  "vendors", // Suppliers
  "vendorContacts",
  "catalogs",
  "catalogItems",
  "items",
  "requisitions", // PurchaseRequisitions
  "purchaseApprovals",
  "rfqs",
  "quotations",
  "purchaseOrders",
  "purchaseContracts",
  "goodsReceipts",
  "receivingLines",
  "supplierInvoices",
  "vendorScorecards",
] as const satisfies readonly ProcurementPersistenceCollection[];

/** Infrastructure collections managed outside aggregate persistence collections. */
export const PROCUREMENT_INFRASTRUCTURE_COLLECTION_KEYS = [
  "organizationFoundations",
  "idempotencyKeys",
  "entityRegistry",
] as const;

export type ProcurementInfrastructureCollectionKey =
  (typeof PROCUREMENT_INFRASTRUCTURE_COLLECTION_KEYS)[number];

/** Returns all registered aggregate collection names. */
export function listProcurementPersistenceCollections(): readonly ProcurementPersistenceCollection[] {
  return PROCUREMENT_PERSISTENCE_COLLECTIONS;
}

/** Type guard for aggregate collection names. */
export function isProcurementPersistenceCollection(
  value: string,
): value is ProcurementPersistenceCollection {
  return (PROCUREMENT_PERSISTENCE_COLLECTIONS as readonly string[]).includes(value);
}

/** Resolves a shared backing collection by aggregate name. */
export function getProcurementBackingCollection(
  backing: ProcurementStoreBacking,
  collection: ProcurementPersistenceCollection,
): Map<string, ProcurementAggregateRecord> {
  switch (collection) {
    case "vendors":
      return backing.vendors;
    case "vendorContacts":
      return backing.vendorContacts;
    case "catalogs":
      return backing.catalogs;
    case "catalogItems":
      return backing.catalogItems;
    case "items":
      return backing.items;
    case "requisitions":
      return backing.requisitions;
    case "purchaseApprovals":
      return backing.purchaseApprovals;
    case "rfqs":
      return backing.rfqs;
    case "quotations":
      return backing.quotations;
    case "purchaseOrders":
      return backing.purchaseOrders;
    case "purchaseContracts":
      return backing.purchaseContracts;
    case "goodsReceipts":
      return backing.goodsReceipts;
    case "receivingLines":
      return backing.receivingLines;
    case "supplierInvoices":
      return backing.supplierInvoices;
    case "vendorScorecards":
      return backing.vendorScorecards;
    default: {
      const exhaustive: never = collection;
      throw new Error(`Unsupported Procurement persistence collection: ${exhaustive}`);
    }
  }
}

/** Validates that a backing instance exposes every repository collection map. */
export function assertProcurementBackingCollections(
  backing: ProcurementStoreBacking,
): void {
  for (const collection of PROCUREMENT_PERSISTENCE_COLLECTIONS) {
    const map = getProcurementBackingCollection(backing, collection);
    if (!(map instanceof Map)) {
      throw new Error(`Procurement backing missing collection map: ${collection}`);
    }
  }

  for (const key of PROCUREMENT_INFRASTRUCTURE_COLLECTION_KEYS) {
    if (!(backing[key] instanceof Map)) {
      throw new Error(`Procurement backing missing infrastructure map: ${key}`);
    }
  }
}
