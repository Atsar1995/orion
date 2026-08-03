import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import {
  createFinanceStore,
  isFinanceStoreEmpty,
  seedFinanceStore,
} from "@/lib/finance/persistence/createFinanceStore";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** Resolves Finance backing from a PlatformStore accessor. */
export function getFinanceBackingFromPlatformStore(platformStore: PlatformStore): FinanceStoreBacking {
  return platformStore.getFinanceBacking();
}

/**
 * Ensures Finance backing is seeded for development, CI, and tests.
 * Production PostgreSQL hydration occurs during PlatformStore initialization.
 */
export function ensureFinancePlatformBacking(platformStore: PlatformStore): FinanceStoreBacking {
  const backing = getFinanceBackingFromPlatformStore(platformStore);

  if (isFinanceStoreEmpty(backing)) {
    seedFinanceStore(backing);
  }

  return backing;
}

/** Creates an isolated Finance backing for tests without PlatformStore. */
export function createIsolatedFinanceBacking(seed = true): FinanceStoreBacking {
  const store = createFinanceStore();
  if (seed) {
    seedFinanceStore(store);
  }
  return store;
}
