import type { ProcurementStoreBacking } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import {
  createProcurementStore,
  isProcurementStoreEmpty,
  seedProcurementStore,
} from "@/lib/procurement/persistence/createProcurementStore";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** Resolves Procurement backing from a PlatformStore accessor. */
export function getProcurementBackingFromPlatformStore(
  platformStore: PlatformStore,
): ProcurementStoreBacking {
  return platformStore.getProcurementBacking();
}

/**
 * Ensures Procurement backing is seeded for development, CI, and tests.
 * Production PostgreSQL hydration occurs during PlatformStore initialization.
 */
export function ensureProcurementPlatformBacking(
  platformStore: PlatformStore,
): ProcurementStoreBacking {
  const backing = getProcurementBackingFromPlatformStore(platformStore);

  if (isProcurementStoreEmpty(backing)) {
    seedProcurementStore(backing);
  }

  return backing;
}

/** Creates an isolated Procurement backing for tests without PlatformStore. */
export function createIsolatedProcurementBacking(seed = true): ProcurementStoreBacking {
  const store = createProcurementStore();
  if (seed) {
    seedProcurementStore(store);
  }
  return store;
}
