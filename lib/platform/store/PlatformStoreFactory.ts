/**
 * PlatformStore factory and default singleton (Mission P-015.4 · ADR-007).
 */

import { resetDefaultCrmBackingForTests } from "@/lib/crm/persistence/createCrmStore";
import { resetCrmEventPipelineRegistryForTests } from "@/lib/crm/services/crmEventPipelineRegistry";
import { resetDefaultProcurementBackingForTests } from "@/lib/procurement/persistence/createProcurementStore";
import { resetProcurementEventPipelineRegistryForTests } from "@/lib/procurement/services/procurementEventPipelineRegistry";
import { resetDefaultFinanceBackingForTests } from "@/lib/finance/persistence/createFinanceStore";
import { resetFinanceEventPipelineServiceForTests } from "@/lib/finance/services/financeEventPipelineRegistry";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { PostgresPlatformStore } from "@/lib/platform/store/PostgresPlatformStore";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";
import { toObservabilityHealthStatus } from "@/lib/platform/store/PlatformStore";
import type { PlatformVerificationResult } from "@/lib/platform/operations/OperationalReadinessReport";
import type { OperationalCheck, OperationalStatus } from "@/lib/platform/operations/OperationalTypes";
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
  resetDefaultCrmBackingForTests();
  resetDefaultProcurementBackingForTests();
  resetFinanceEventPipelineServiceForTests();
  resetCrmEventPipelineRegistryForTests();
  resetProcurementEventPipelineRegistryForTests();
}

function worstStatus(...statuses: OperationalStatus[]): OperationalStatus {
  if (statuses.some((status) => status === "unhealthy")) {
    return "unhealthy";
  }

  if (statuses.some((status) => status === "degraded")) {
    return "degraded";
  }

  return "healthy";
}

/** Verifies platform startup sequence — initialize store and confirm health (P-011.1). */
export async function verifyPlatformStartup(
  store: PlatformStore = PlatformStoreFactory.createFromEnvironment(),
): Promise<PlatformVerificationResult> {
  const checks: OperationalCheck[] = [];

  try {
    await store.initialize();
    checks.push({
      name: "initialize_complete",
      status: store.isInitialized() ? "healthy" : "unhealthy",
      message: store.isInitialized()
        ? "PlatformStore initialized successfully."
        : "PlatformStore failed to initialize.",
    });

    const health = await store.checkHealth();
    checks.push({
      name: "startup_health_probe",
      status: toObservabilityHealthStatus(health.status),
      message: health.message,
    });

    checks.push({
      name: "lifecycle_initialized",
      status: store.getLifecycleState() === "initialized" ? "healthy" : "degraded",
      message: `Lifecycle state after startup: ${store.getLifecycleState()}.`,
    });
  } catch (error) {
    checks.push({
      name: "initialize_complete",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Platform startup verification failed.",
    });
  }

  const status = worstStatus(...checks.map((check) => check.status));

  return {
    name: "platform_startup",
    status,
    message:
      status === "healthy"
        ? "Platform startup verification passed."
        : status === "degraded"
          ? "Platform startup verification passed with warnings."
          : "Platform startup verification failed.",
    checks,
    verifiedAt: new Date().toISOString(),
  };
}

/** Verifies platform shutdown sequence — graceful close and lifecycle transition (P-011.1). */
export async function verifyPlatformShutdown(
  store: PlatformStore = PlatformStoreFactory.createFromEnvironment(),
): Promise<PlatformVerificationResult> {
  const checks: OperationalCheck[] = [];

  try {
    if (!store.isInitialized()) {
      await store.initialize();
    }

    await store.shutdown();
    checks.push({
      name: "shutdown_complete",
      status: "healthy",
      message: "PlatformStore shutdown completed without error.",
    });

    checks.push({
      name: "lifecycle_shutdown",
      status: store.getLifecycleState() === "shutdown" ? "healthy" : "degraded",
      message: `Lifecycle state after shutdown: ${store.getLifecycleState()}.`,
    });

    const health = store.getHealth();
    checks.push({
      name: "post_shutdown_health",
      status: store.getLifecycleState() === "shutdown" ? "healthy" : "degraded",
      message: health.message,
    });
  } catch (error) {
    checks.push({
      name: "shutdown_complete",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Platform shutdown verification failed.",
    });
  }

  const status = worstStatus(...checks.map((check) => check.status));

  return {
    name: "platform_shutdown",
    status,
    message:
      status === "healthy"
        ? "Platform shutdown verification passed."
        : status === "degraded"
          ? "Platform shutdown verification passed with warnings."
          : "Platform shutdown verification failed.",
    checks,
    verifiedAt: new Date().toISOString(),
  };
}
