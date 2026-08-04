import type { CrmStoreBacking } from "@/lib/crm/persistence/CrmStoreBacking";
import {
  createCrmStore,
  isCrmStoreEmpty,
  seedCrmStore,
} from "@/lib/crm/persistence/createCrmStore";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** Resolves CRM backing from a PlatformStore accessor. */
export function getCrmBackingFromPlatformStore(platformStore: PlatformStore): CrmStoreBacking {
  return platformStore.getCrmBacking();
}

/**
 * Ensures CRM backing is seeded for development, CI, and tests.
 * Production PostgreSQL hydration occurs during PlatformStore initialization.
 */
export function ensureCrmPlatformBacking(platformStore: PlatformStore): CrmStoreBacking {
  const backing = getCrmBackingFromPlatformStore(platformStore);

  if (isCrmStoreEmpty(backing)) {
    seedCrmStore(backing);
  }

  return backing;
}

/** Creates an isolated CRM backing for tests without PlatformStore. */
export function createIsolatedCrmBacking(seed = true): CrmStoreBacking {
  const store = createCrmStore();
  if (seed) {
    seedCrmStore(store);
  }
  return store;
}
