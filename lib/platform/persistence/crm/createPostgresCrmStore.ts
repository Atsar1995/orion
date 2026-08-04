/**
 * Creates PostgreSQL-backed CRM store for platform foundation (P-008.9 · ADR-007).
 */

import type { CrmOrganizationFoundationRecord } from "@/lib/crm/persistence/CrmStoreBacking";
import type { CrmEntityRegistryEntry } from "@/lib/crm/persistence/CrmStoreBacking";
import type { CrmStoreBacking } from "@/lib/crm/persistence/CrmStoreBacking";
import { createCrmStore } from "@/lib/crm/persistence/createCrmStore";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import {
  CRM_COLLECTION_ENTITY_REGISTRY,
  CRM_COLLECTION_IDEMPOTENCY_KEY,
  CRM_COLLECTION_ORGANIZATION_FOUNDATION,
  CrmEntityPersister,
} from "@/lib/platform/persistence/crm/CrmEntityPersister";

function hydrateMap<K, V>(target: Map<K, V>, source: Map<string, V>): void {
  for (const [key, value] of source.entries()) {
    Map.prototype.set.call(target, key as K, value);
  }
}

/** Hydrates and returns a CRM store backed by PostgreSQL entity tables. */
export async function createPostgresCrmStore(
  connection: DatabaseConnection,
): Promise<{ store: CrmStoreBacking; persister: CrmEntityPersister }> {
  const persister = new CrmEntityPersister(connection);
  const store = createCrmStore();

  const foundations = await persister.loadCollection<CrmOrganizationFoundationRecord>(
    CRM_COLLECTION_ORGANIZATION_FOUNDATION,
  );
  hydrateMap(store.organizationFoundations, foundations);

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
