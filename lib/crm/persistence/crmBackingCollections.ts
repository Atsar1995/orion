import type {
  CrmAggregateRecord,
  CrmPersistenceCollection,
  CrmStoreBacking,
} from "@/lib/crm/persistence/CrmStoreBacking";

/** Resolves a shared backing collection by aggregate name. */
export function getCrmBackingCollection(
  backing: CrmStoreBacking,
  collection: CrmPersistenceCollection,
): Map<string, CrmAggregateRecord> {
  switch (collection) {
    case "accounts":
      return backing.accounts;
    case "contacts":
      return backing.contacts;
    case "organizations":
      return backing.organizations;
    case "leads":
      return backing.leads;
    case "opportunities":
      return backing.opportunities;
    case "quotes":
      return backing.quotes;
    case "activities":
      return backing.activities;
    case "cases":
      return backing.cases;
    case "salesOrders":
      return backing.salesOrders;
    case "notes":
      return backing.notes;
    case "attachments":
      return backing.attachments;
    default: {
      const exhaustive: never = collection;
      throw new Error(`Unsupported CRM persistence collection: ${exhaustive}`);
    }
  }
}
