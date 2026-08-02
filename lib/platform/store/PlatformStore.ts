/**
 * PlatformStore — single persistence abstraction for ORION (Mission P-015.4 · ADR-007).
 */

import type {
  PlatformStoreHealthReport,
  PlatformStoreHealthStatus,
} from "@/lib/platform/store/PlatformStoreHealth";
import type { StoreConfiguration, StoreProvider } from "@/lib/platform/store/StoreConfiguration";
import type { HcmStoreBacking } from "@/lib/platform/store/HcmStoreBacking";
import type {
  PersistenceTransaction,
  TransactionManager,
} from "@/lib/persistence/services/shared";

/** Migration readiness for schema management (P-015.5). */
export type PlatformStoreMigrationReadiness = {
  readonly ready: boolean;
  readonly provider: StoreProvider;
  readonly message: string;
};

/** Domain store accessors — expand per domain in future missions. */
export interface PlatformDomainStores {
  /** HCM persistence backing (InMemory today · PostgreSQL in P-015.5). */
  getHcmBacking(): HcmStoreBacking;
}

/**
 * Platform-wide persistence abstraction: connection lifecycle, transactions, health.
 * Domain repositories receive backing stores via {@link PlatformDomainStores}.
 */
export interface PlatformStore extends PlatformDomainStores {
  readonly provider: StoreProvider;
  readonly configuration: StoreConfiguration;

  /** Idempotent startup — connect pools, validate configuration. */
  initialize(): Promise<void>;

  /** Graceful shutdown — close pools and flush resources. */
  shutdown(): Promise<void>;

  /** Returns true after successful {@link initialize}. */
  isInitialized(): boolean;

  /** Transaction boundary for unit-of-work operations. */
  getTransactionManager(): TransactionManager;

  /** Current health snapshot. */
  getHealth(): PlatformStoreHealthReport;

  /** Async health probe (connectivity ping for PostgreSQL in P-015.5). */
  checkHealth(): Promise<PlatformStoreHealthReport>;

  /** Whether schema migrations can run against this store. */
  getMigrationReadiness(): PlatformStoreMigrationReadiness;
}

export type PlatformStoreLifecycleState = "created" | "initialized" | "shutdown";

/** Maps store health to observability health check status. */
export function toObservabilityHealthStatus(
  status: PlatformStoreHealthStatus,
): "healthy" | "degraded" | "unhealthy" {
  if (status === "not_initialized") {
    return "degraded";
  }

  return status;
}

export type { PersistenceTransaction };
