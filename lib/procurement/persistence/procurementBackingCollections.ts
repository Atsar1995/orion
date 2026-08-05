import type {
  ProcurementAggregateRecord,
  ProcurementPersistenceCollection,
  ProcurementStoreBacking,
} from "@/lib/procurement/persistence/ProcurementStoreBacking";

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
