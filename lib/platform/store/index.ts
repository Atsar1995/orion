/**
 * ORION Platform Store — public API (Mission P-015.4 · ADR-007).
 *
 * @see docs/Platform/PlatformStore/PlatformStore-Architecture.md
 */

export type { PlatformStore, PlatformStoreMigrationReadiness } from "@/lib/platform/store/PlatformStore";
export { toObservabilityHealthStatus } from "@/lib/platform/store/PlatformStore";

export type { PlatformStoreHealthReport, PlatformStoreHealthStatus } from "@/lib/platform/store/PlatformStoreHealth";
export { createPlatformStoreHealthReport } from "@/lib/platform/store/PlatformStoreHealth";

export {
  DEFAULT_STORE_CONFIGURATION,
  StoreProvider,
  isStoreProviderImplemented,
  loadStoreConfiguration,
} from "@/lib/platform/store/StoreConfiguration";
export type { StoreConfiguration } from "@/lib/platform/store/StoreConfiguration";

export type { HcmStoreBacking } from "@/lib/platform/store/HcmStoreBacking";
export type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";

export { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
export type { InMemoryPlatformStoreOptions } from "@/lib/platform/store/InMemoryPlatformStore";

export {
  PostgresPlatformStore,
  PostgresPlatformStoreError,
  PostgresPlatformStoreNotImplementedError,
  PostgresPlatformStoreNotImplementedError as PlatformStorePostgresNotReadyError,
} from "@/lib/platform/store/PostgresPlatformStore";

export {
  PlatformStoreFactory,
  getDefaultPlatformStore,
  ensureDefaultPlatformStoreInitialized,
  resetDefaultPlatformStoreForTests,
} from "@/lib/platform/store/PlatformStoreFactory";
