/**
 * Creates PostgreSQL-backed CRM store for platform foundation (P-008.9 · P-008.17 · ADR-007).
 */

import type {
  CrmAggregateRecord,
  CrmEntityRegistryEntry,
  CrmOrganizationFoundationRecord,
  CrmStoreBacking,
} from "@/lib/crm/persistence/CrmStoreBacking";
import { createCrmStore } from "@/lib/crm/persistence/createCrmStore";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import {
  CRM_COLLECTION_ACCOUNT,
  CRM_COLLECTION_ACTIVITY,
  CRM_COLLECTION_ATTACHMENT,
  CRM_COLLECTION_CASE,
  CRM_COLLECTION_CONTACT,
  CRM_COLLECTION_ENTITY_REGISTRY,
  CRM_COLLECTION_IDEMPOTENCY_KEY,
  CRM_COLLECTION_LEAD,
  CRM_COLLECTION_NOTE,
  CRM_COLLECTION_OPPORTUNITY,
  CRM_COLLECTION_ORGANIZATION,
  CRM_COLLECTION_ORGANIZATION_FOUNDATION,
  CRM_COLLECTION_QUOTE,
  CRM_COLLECTION_SALES_ORDER,
  CrmEntityPersister,
  CrmPersistingEntityRegistryMap,
  CrmPersistingIdempotencyMap,
  CrmPersistingMap,
  CrmPersistingOrganizationFoundationMap,
} from "@/lib/platform/persistence/crm/CrmEntityPersister";

function hydrateMap<K, V>(target: Map<K, V>, source: Map<string, V>): void {
  for (const [key, value] of source.entries()) {
    Map.prototype.set.call(target, key as K, value);
  }
}

function createPersistingCrmStore(persister: CrmEntityPersister): CrmStoreBacking {
  const base = createCrmStore();

  return {
    ...base,
    organizationFoundations: new CrmPersistingOrganizationFoundationMap(persister),
    accounts: new CrmPersistingMap<string, CrmAggregateRecord>(CRM_COLLECTION_ACCOUNT, persister),
    contacts: new CrmPersistingMap<string, CrmAggregateRecord>(CRM_COLLECTION_CONTACT, persister),
    organizations: new CrmPersistingMap<string, CrmAggregateRecord>(
      CRM_COLLECTION_ORGANIZATION,
      persister,
    ),
    leads: new CrmPersistingMap<string, CrmAggregateRecord>(CRM_COLLECTION_LEAD, persister),
    opportunities: new CrmPersistingMap<string, CrmAggregateRecord>(
      CRM_COLLECTION_OPPORTUNITY,
      persister,
    ),
    quotes: new CrmPersistingMap<string, CrmAggregateRecord>(CRM_COLLECTION_QUOTE, persister),
    activities: new CrmPersistingMap<string, CrmAggregateRecord>(CRM_COLLECTION_ACTIVITY, persister),
    cases: new CrmPersistingMap<string, CrmAggregateRecord>(CRM_COLLECTION_CASE, persister),
    salesOrders: new CrmPersistingMap<string, CrmAggregateRecord>(
      CRM_COLLECTION_SALES_ORDER,
      persister,
    ),
    notes: new CrmPersistingMap<string, CrmAggregateRecord>(CRM_COLLECTION_NOTE, persister),
    attachments: new CrmPersistingMap<string, CrmAggregateRecord>(
      CRM_COLLECTION_ATTACHMENT,
      persister,
    ),
    idempotencyKeys: new CrmPersistingIdempotencyMap(persister),
    entityRegistry: new CrmPersistingEntityRegistryMap(persister),
  };
}

/** Hydrates and returns a CRM store backed by PostgreSQL entity tables. */
export async function createPostgresCrmStore(
  connection: DatabaseConnection,
): Promise<{ store: CrmStoreBacking; persister: CrmEntityPersister }> {
  const persister = new CrmEntityPersister(connection);
  const store = createPersistingCrmStore(persister);

  const foundations = await persister.loadCollection<CrmOrganizationFoundationRecord>(
    CRM_COLLECTION_ORGANIZATION_FOUNDATION,
  );
  hydrateMap(store.organizationFoundations, foundations);

  const accounts = await persister.loadCollection<CrmAggregateRecord>(CRM_COLLECTION_ACCOUNT);
  hydrateMap(store.accounts, accounts);

  const contacts = await persister.loadCollection<CrmAggregateRecord>(CRM_COLLECTION_CONTACT);
  hydrateMap(store.contacts, contacts);

  const organizations = await persister.loadCollection<CrmAggregateRecord>(
    CRM_COLLECTION_ORGANIZATION,
  );
  hydrateMap(store.organizations, organizations);

  const leads = await persister.loadCollection<CrmAggregateRecord>(CRM_COLLECTION_LEAD);
  hydrateMap(store.leads, leads);

  const opportunities = await persister.loadCollection<CrmAggregateRecord>(
    CRM_COLLECTION_OPPORTUNITY,
  );
  hydrateMap(store.opportunities, opportunities);

  const quotes = await persister.loadCollection<CrmAggregateRecord>(CRM_COLLECTION_QUOTE);
  hydrateMap(store.quotes, quotes);

  const activities = await persister.loadCollection<CrmAggregateRecord>(CRM_COLLECTION_ACTIVITY);
  hydrateMap(store.activities, activities);

  const cases = await persister.loadCollection<CrmAggregateRecord>(CRM_COLLECTION_CASE);
  hydrateMap(store.cases, cases);

  const salesOrders = await persister.loadCollection<CrmAggregateRecord>(
    CRM_COLLECTION_SALES_ORDER,
  );
  hydrateMap(store.salesOrders, salesOrders);

  const notes = await persister.loadCollection<CrmAggregateRecord>(CRM_COLLECTION_NOTE);
  hydrateMap(store.notes, notes);

  const attachments = await persister.loadCollection<CrmAggregateRecord>(CRM_COLLECTION_ATTACHMENT);
  hydrateMap(store.attachments, attachments);

  const idempotencyKeys = await persister.loadCollection<Record<string, string>>(
    CRM_COLLECTION_IDEMPOTENCY_KEY,
  );
  hydrateMap(store.idempotencyKeys, idempotencyKeys);

  const entityRegistry = await persister.loadCollection<CrmEntityRegistryEntry>(
    CRM_COLLECTION_ENTITY_REGISTRY,
  );
  hydrateMap(store.entityRegistry, entityRegistry);

  return { store, persister };
}

export async function flushPostgresCrmStore(persister: CrmEntityPersister): Promise<void> {
  await persister.flushPending();
}
