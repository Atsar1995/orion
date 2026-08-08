import type { AuroraStoreBacking } from "@/lib/aurora/persistence/AuroraStoreBacking";
import {
  createAuroraStore,
  isAuroraStoreEmpty,
  seedAuroraStore,
} from "@/lib/aurora/persistence/createAuroraStore";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";

/** Resolves Aurora backing from a PlatformStore accessor. */
export function getAuroraBackingFromPlatformStore(
  platformStore: PlatformStore,
): AuroraStoreBacking {
  return platformStore.getAuroraBacking();
}

/** Ensures Aurora backing is seeded for development, CI, and tests. */
export function ensureAuroraPlatformBacking(
  platformStore: PlatformStore,
): AuroraStoreBacking {
  const backing = getAuroraBackingFromPlatformStore(platformStore);

  if (isAuroraStoreEmpty(backing)) {
    seedAuroraStore(backing);
  }

  return backing;
}

/** Creates an isolated Aurora backing for tests without PlatformStore. */
export function createIsolatedAuroraBacking(seed = true): AuroraStoreBacking {
  const store = createAuroraStore();
  if (seed) {
    seedAuroraStore(store);
  }
  return store;
}

export type { AuroraStoreBacking };
