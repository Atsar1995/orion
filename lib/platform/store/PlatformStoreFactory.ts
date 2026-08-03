/**
 * PlatformStore factory and default singleton (Mission P-015.4 · ADR-007).
 */

import { resetDefaultFinanceBackingForTests } from "@/lib/finance/persistence/createFinanceStore";
import { resetFinanceEventPipelineServiceForTests } from "@/lib/finance/services/financeEventPipelineRegistry";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { PostgresPlatformStore } from "@/lib/platform/store/PostgresPlatformStore";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";
import {
  DEFAULT_STORE_CONFIGURATION,
  StoreProvider,
  isStoreProviderImplemented,
  loadStoreConfiguration,
  type StoreConfiguration,
} from "@/lib/platform/store/StoreConfiguration";

/** Constructs a PlatformStore from configuration without initializing it. */
export class PlatformStoreFactory {
  static create(configuration: StoreConfiguration = DEFAULT_STORE_CONFIGURATION): PlatformStore {
    switch (configuration.provider) {
      case StoreProvider.InMemory:
        return new InMemoryPlatformStore({ configuration });
      case StoreProvider.PostgreSQL:
      case StoreProvider.SQLite:
        return PlatformStoreFactory.createRelationalStore(configuration);
      default: {
        const exhaustive: never = configuration.provider;
        throw new Error(`Unsupported store provider: ${exhaustive}`);
      }
    }
  }

  private static createRelationalStore(configuration: StoreConfiguration): PlatformStore {
    return new PostgresPlatformStore({ configuration });
  }

  static createFromEnvironment(): PlatformStore {
    return PlatformStoreFactory.create(loadStoreConfiguration());
  }

  static isImplemented(configuration: StoreConfiguration): boolean {
    return isStoreProviderImplemented(configuration.provider);
  }
}

let defaultPlatformStore: PlatformStore | null = null;
let defaultPlatformStoreInit: Promise<void> | null = null;

/** Returns the process-wide default PlatformStore (lazy singleton). */
export function getDefaultPlatformStore(): PlatformStore {
  if (!defaultPlatformStore) {
    defaultPlatformStore = PlatformStoreFactory.createFromEnvironment();
  }

  return defaultPlatformStore;
}

/** Ensures the default PlatformStore is initialized exactly once. */
export async function ensureDefaultPlatformStoreInitialized(): Promise<PlatformStore> {
  const store = getDefaultPlatformStore();

  if (store.isInitialized()) {
    return store;
  }

  if (!defaultPlatformStoreInit) {
    defaultPlatformStoreInit = store.initialize().catch((error) => {
      defaultPlatformStoreInit = null;
      throw error;
    });
  }

  await defaultPlatformStoreInit;
  return store;
}

/** Resets the default singleton — test isolation only. */
export function resetDefaultPlatformStoreForTests(): void {
  defaultPlatformStore = null;
  defaultPlatformStoreInit = null;
  resetDefaultFinanceBackingForTests();
  resetFinanceEventPipelineServiceForTests();
}
