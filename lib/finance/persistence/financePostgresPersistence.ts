import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";
import {
  StoreProvider,
  isStoreProviderImplemented,
} from "@/lib/platform/store/StoreConfiguration";

/** Returns true when Finance repositories should activate PostgreSQL adapters. */
export function canUsePostgresFinancePersistence(
  platformStore: PlatformStore,
  connection: DatabaseConnection | undefined,
): connection is DatabaseConnection {
  return (
    Boolean(connection) &&
    platformStore.isInitialized() &&
    (platformStore.provider === StoreProvider.PostgreSQL ||
      platformStore.provider === StoreProvider.SQLite) &&
    isStoreProviderImplemented(platformStore.provider)
  );
}
