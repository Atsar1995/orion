/**
 * Creates PostgreSQL-backed Procurement store for platform foundation (P-010.3 · ADR-007).
 */

import type {
  ProcurementAggregateRecord,
  ProcurementEntityRegistryEntry,
  ProcurementOrganizationFoundationRecord,
  ProcurementStoreBacking,
} from "@/lib/procurement/persistence/ProcurementStoreBacking";
import { createProcurementStore } from "@/lib/procurement/persistence/createProcurementStore";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import {
  PROCUREMENT_COLLECTION_CATALOG,
  PROCUREMENT_COLLECTION_CATALOG_ITEM,
  PROCUREMENT_COLLECTION_ENTITY_REGISTRY,
  PROCUREMENT_COLLECTION_GOODS_RECEIPT,
  PROCUREMENT_COLLECTION_IDEMPOTENCY_KEY,
  PROCUREMENT_COLLECTION_ITEM,
  PROCUREMENT_COLLECTION_ORGANIZATION_FOUNDATION,
  PROCUREMENT_COLLECTION_PURCHASE_APPROVAL,
  PROCUREMENT_COLLECTION_PURCHASE_CONTRACT,
  PROCUREMENT_COLLECTION_PURCHASE_ORDER,
  PROCUREMENT_COLLECTION_QUOTATION,
  PROCUREMENT_COLLECTION_RECEIVING_LINE,
  PROCUREMENT_COLLECTION_REQUISITION,
  PROCUREMENT_COLLECTION_RFQ,
  PROCUREMENT_COLLECTION_SUPPLIER_INVOICE,
  PROCUREMENT_COLLECTION_VENDOR,
  PROCUREMENT_COLLECTION_VENDOR_CONTACT,
  PROCUREMENT_COLLECTION_VENDOR_SCORECARD,
  ProcurementEntityPersister,
  ProcurementPersistingEntityRegistryMap,
  ProcurementPersistingIdempotencyMap,
  ProcurementPersistingMap,
  ProcurementPersistingOrganizationFoundationMap,
} from "@/lib/platform/persistence/procurement/ProcurementEntityPersister";

function hydrateMap<K, V>(target: Map<K, V>, source: Map<string, V>): void {
  for (const [key, value] of source.entries()) {
    Map.prototype.set.call(target, key as K, value);
  }
}

function createPersistingProcurementStore(
  persister: ProcurementEntityPersister,
): ProcurementStoreBacking {
  const base = createProcurementStore();

  return {
    ...base,
    organizationFoundations: new ProcurementPersistingOrganizationFoundationMap(persister),
    vendors: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_VENDOR,
      persister,
    ),
    vendorContacts: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_VENDOR_CONTACT,
      persister,
    ),
    catalogs: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_CATALOG,
      persister,
    ),
    catalogItems: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_CATALOG_ITEM,
      persister,
    ),
    items: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_ITEM,
      persister,
    ),
    requisitions: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_REQUISITION,
      persister,
    ),
    purchaseApprovals: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_PURCHASE_APPROVAL,
      persister,
    ),
    rfqs: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_RFQ,
      persister,
    ),
    quotations: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_QUOTATION,
      persister,
    ),
    purchaseOrders: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_PURCHASE_ORDER,
      persister,
    ),
    purchaseContracts: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_PURCHASE_CONTRACT,
      persister,
    ),
    goodsReceipts: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_GOODS_RECEIPT,
      persister,
    ),
    receivingLines: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_RECEIVING_LINE,
      persister,
    ),
    supplierInvoices: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_SUPPLIER_INVOICE,
      persister,
    ),
    vendorScorecards: new ProcurementPersistingMap<string, ProcurementAggregateRecord>(
      PROCUREMENT_COLLECTION_VENDOR_SCORECARD,
      persister,
    ),
    idempotencyKeys: new ProcurementPersistingIdempotencyMap(persister),
    entityRegistry: new ProcurementPersistingEntityRegistryMap(persister),
  };
}

/** Hydrates and returns a Procurement store backed by PostgreSQL entity tables. */
export async function createPostgresProcurementStore(
  connection: DatabaseConnection,
): Promise<{ store: ProcurementStoreBacking; persister: ProcurementEntityPersister }> {
  const persister = new ProcurementEntityPersister(connection);
  const store = createPersistingProcurementStore(persister);

  const foundations = await persister.loadCollection<ProcurementOrganizationFoundationRecord>(
    PROCUREMENT_COLLECTION_ORGANIZATION_FOUNDATION,
  );
  hydrateMap(store.organizationFoundations, foundations);

  const vendors = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_VENDOR,
  );
  hydrateMap(store.vendors, vendors);

  const vendorContacts = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_VENDOR_CONTACT,
  );
  hydrateMap(store.vendorContacts, vendorContacts);

  const catalogs = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_CATALOG,
  );
  hydrateMap(store.catalogs, catalogs);

  const catalogItems = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_CATALOG_ITEM,
  );
  hydrateMap(store.catalogItems, catalogItems);

  const items = await persister.loadCollection<ProcurementAggregateRecord>(PROCUREMENT_COLLECTION_ITEM);
  hydrateMap(store.items, items);

  const requisitions = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_REQUISITION,
  );
  hydrateMap(store.requisitions, requisitions);

  const purchaseApprovals = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_PURCHASE_APPROVAL,
  );
  hydrateMap(store.purchaseApprovals, purchaseApprovals);

  const rfqs = await persister.loadCollection<ProcurementAggregateRecord>(PROCUREMENT_COLLECTION_RFQ);
  hydrateMap(store.rfqs, rfqs);

  const quotations = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_QUOTATION,
  );
  hydrateMap(store.quotations, quotations);

  const purchaseOrders = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_PURCHASE_ORDER,
  );
  hydrateMap(store.purchaseOrders, purchaseOrders);

  const purchaseContracts = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_PURCHASE_CONTRACT,
  );
  hydrateMap(store.purchaseContracts, purchaseContracts);

  const goodsReceipts = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_GOODS_RECEIPT,
  );
  hydrateMap(store.goodsReceipts, goodsReceipts);

  const receivingLines = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_RECEIVING_LINE,
  );
  hydrateMap(store.receivingLines, receivingLines);

  const supplierInvoices = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_SUPPLIER_INVOICE,
  );
  hydrateMap(store.supplierInvoices, supplierInvoices);

  const vendorScorecards = await persister.loadCollection<ProcurementAggregateRecord>(
    PROCUREMENT_COLLECTION_VENDOR_SCORECARD,
  );
  hydrateMap(store.vendorScorecards, vendorScorecards);

  const idempotencyKeys = await persister.loadCollection<Record<string, string>>(
    PROCUREMENT_COLLECTION_IDEMPOTENCY_KEY,
  );
  hydrateMap(store.idempotencyKeys, idempotencyKeys);

  const entityRegistry = await persister.loadCollection<ProcurementEntityRegistryEntry>(
    PROCUREMENT_COLLECTION_ENTITY_REGISTRY,
  );
  hydrateMap(store.entityRegistry, entityRegistry);

  return { store, persister };
}

export async function flushPostgresProcurementStore(
  persister: ProcurementEntityPersister,
): Promise<void> {
  await persister.flushPending();
}
