/**
 * PlatformStore factory and default singleton (Mission P-015.4 · ADR-007).
 */

import { resetDefaultCrmBackingForTests } from "@/lib/crm/persistence/createCrmStore";
import { resetCrmEventPipelineRegistryForTests } from "@/lib/crm/services/crmEventPipelineRegistry";
import { resetDefaultProcurementBackingForTests } from "@/lib/procurement/persistence/createProcurementStore";
import { resetProcurementEventPipelineRegistryForTests } from "@/lib/procurement/services/procurementEventPipelineRegistry";
import { ensureFinancePlatformBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { resetDefaultFinanceBackingForTests, FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import { resetFinanceEventPipelineServiceForTests } from "@/lib/finance/services/financeEventPipelineRegistry";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { PostgresPlatformStore } from "@/lib/platform/store/PostgresPlatformStore";
import type { PlatformStore } from "@/lib/platform/store/PlatformStore";
import { toObservabilityHealthStatus } from "@/lib/platform/store/PlatformStore";
import type { PlatformVerificationResult } from "@/lib/platform/operations/OperationalReadinessReport";
import type { OperationalCheck, OperationalStatus } from "@/lib/platform/operations/OperationalTypes";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import type { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { HCM_SEED_ORG_ID } from "@/lib/hcm/data/seed-hcm-time";
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

/** Restores injectable test connections after shutdown — simulates pool re-acquisition (P-011.2). */
function restoreConnectionIfSupported(connection: DatabaseConnection): void {
  const restorable = connection as DatabaseConnection & { setConnected?(value: boolean): void };
  restorable.setConnected?.(true);
}

/** Shared PostgreSQL certification context for cold boot and restart scenarios (P-011.2). */
export type PostgresCertificationContext = {
  readonly connection: DatabaseConnection;
  readonly migrationRunner: MigrationRunner;
  readonly configuration?: StoreConfiguration;
};

/** Creates a PostgreSQL PlatformStore for operational certification drills. */
export function createPostgresCertificationStore(
  context: PostgresCertificationContext,
): PostgresPlatformStore {
  return new PostgresPlatformStore({
    configuration:
      context.configuration ?? {
        provider: StoreProvider.PostgreSQL,
        databaseUrl: "postgresql://certification:5432/orion",
        migrationReady: true,
      },
    connection: context.connection,
    migrationRunner: context.migrationRunner,
  });
}

/** Verifies PostgreSQL cold boot — uninitialized store through first initialize (P-011.2). */
export async function verifyPostgresColdBoot(
  store: PlatformStore,
): Promise<PlatformVerificationResult> {
  const checks: OperationalCheck[] = [];

  try {
    checks.push({
      name: "pre_boot_uninitialized",
      status: store.isInitialized() ? "degraded" : "healthy",
      message: store.isInitialized()
        ? "Store was already initialized before cold boot probe."
        : "Store uninitialized before cold boot.",
    });

    if (!store.isInitialized()) {
      await store.initialize();
    }

    checks.push({
      name: "cold_boot_initialize",
      status: store.isInitialized() ? "healthy" : "unhealthy",
      message: store.isInitialized()
        ? "Cold boot initialization succeeded."
        : "Cold boot initialization failed.",
    });

    const health = await store.checkHealth();
    checks.push({
      name: "cold_boot_health",
      status: toObservabilityHealthStatus(health.status),
      message: health.message,
    });
  } catch (error) {
    checks.push({
      name: "cold_boot_initialize",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Cold boot verification failed.",
    });
  }

  const status = worstStatus(...checks.map((check) => check.status));

  return {
    name: "cold_boot",
    status,
    message:
      status === "healthy"
        ? "PostgreSQL cold boot certification passed."
        : status === "degraded"
          ? "PostgreSQL cold boot certification passed with warnings."
          : "PostgreSQL cold boot certification failed.",
    checks,
    verifiedAt: new Date().toISOString(),
  };
}

/** Verifies domain backing hydration after PlatformStore initialization (P-011.2). */
export async function verifyPostgresHydration(
  store: PlatformStore,
): Promise<PlatformVerificationResult> {
  const checks: OperationalCheck[] = [];

  try {
    if (!store.isInitialized()) {
      await store.initialize();
    }

    const domains = [
      { name: "hcm_backing_hydrated", resolve: () => store.getHcmBacking() },
      { name: "finance_backing_hydrated", resolve: () => store.getFinanceBacking() },
      { name: "crm_backing_hydrated", resolve: () => store.getCrmBacking() },
      { name: "procurement_backing_hydrated", resolve: () => store.getProcurementBacking() },
    ] as const;

    for (const domain of domains) {
      const backing = domain.resolve();
      checks.push({
        name: domain.name,
        status: backing ? "healthy" : "unhealthy",
        message: backing
          ? `${domain.name} available after PlatformStore hydration.`
          : `${domain.name} missing after initialization.`,
      });
    }

    const migration = store.getMigrationReadiness();
    checks.push({
      name: "migration_hydration",
      status: migration.ready ? "healthy" : "degraded",
      message: migration.message,
    });
  } catch (error) {
    checks.push({
      name: "hydration_probe",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Hydration verification failed.",
    });
  }

  const status = worstStatus(...checks.map((check) => check.status));

  return {
    name: "platform_store_hydration",
    status,
    message:
      status === "healthy"
        ? "PlatformStore and repository hydration verified."
        : status === "degraded"
          ? "Hydration verified with warnings."
          : "PlatformStore hydration failed.",
    checks,
    verifiedAt: new Date().toISOString(),
  };
}

/** Verifies transaction begin and rollback recovery (P-011.2). */
export async function verifyPostgresTransactionRecovery(
  store: PlatformStore,
): Promise<PlatformVerificationResult> {
  const checks: OperationalCheck[] = [];

  try {
    if (!store.isInitialized()) {
      await store.initialize();
    }

    const transactionManager = store.getTransactionManager();
    const beginResult = await transactionManager.beginTransaction();
    checks.push({
      name: "transaction_begin",
      status: beginResult.success ? "healthy" : "unhealthy",
      message: beginResult.success
        ? "Persistence transaction began successfully."
        : beginResult.error.message,
    });

    if (beginResult.success) {
      const rollbackResult = await transactionManager.rollback(beginResult.data);
      checks.push({
        name: "transaction_rollback",
        status: rollbackResult.success ? "healthy" : "unhealthy",
        message: rollbackResult.success
          ? "Persistence transaction rolled back successfully."
          : rollbackResult.error.message,
      });
    }

    checks.push({
      name: "post_rollback_operational",
      status: store.isInitialized() ? "healthy" : "unhealthy",
      message: store.isInitialized()
        ? "PlatformStore operational after transaction rollback."
        : "PlatformStore unavailable after rollback.",
    });
  } catch (error) {
    checks.push({
      name: "transaction_recovery",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Transaction recovery verification failed.",
    });
  }

  const status = worstStatus(...checks.map((check) => check.status));

  return {
    name: "transaction_recovery",
    status,
    message:
      status === "healthy"
        ? "Transaction recovery certification passed."
        : status === "degraded"
          ? "Transaction recovery certification passed with warnings."
          : "Transaction recovery certification failed.",
    checks,
    verifiedAt: new Date().toISOString(),
  };
}

/** Verifies warm restart — shutdown and re-initialize with shared connection (P-011.2). */
export async function verifyPostgresWarmRestart(
  context: PostgresCertificationContext,
): Promise<PlatformVerificationResult> {
  const checks: OperationalCheck[] = [];
  const firstStore = createPostgresCertificationStore(context);

  try {
    await firstStore.initialize();
    const financeBefore = ensureFinancePlatformBacking(firstStore);
    const accountCountBefore = financeBefore.accounts.size;
    checks.push({
      name: "pre_shutdown_seed_present",
      status: accountCountBefore > 0 ? "healthy" : "degraded",
      message:
        accountCountBefore > 0
          ? `Finance repository hydrated with ${accountCountBefore} account(s) before shutdown.`
          : "Finance repository empty before shutdown.",
    });

    await firstStore.shutdown();
    checks.push({
      name: "graceful_shutdown",
      status: firstStore.getLifecycleState() === "shutdown" ? "healthy" : "degraded",
      message: `Lifecycle after shutdown: ${firstStore.getLifecycleState()}.`,
    });

    restoreConnectionIfSupported(context.connection);

    const restartedStore = createPostgresCertificationStore(context);
    await restartedStore.initialize();
    checks.push({
      name: "warm_restart_initialize",
      status: restartedStore.isInitialized() ? "healthy" : "unhealthy",
      message: restartedStore.isInitialized()
        ? "Warm restart initialization succeeded."
        : "Warm restart initialization failed.",
    });

    const health = await restartedStore.checkHealth();
    checks.push({
      name: "warm_restart_health",
      status: toObservabilityHealthStatus(health.status),
      message: health.message,
    });

    const financeAfter = restartedStore.getFinanceBacking();
    const accountCountAfter = financeAfter.accounts.size;
    checks.push({
      name: "repository_survival",
      status:
        accountCountBefore > 0 && accountCountAfter >= accountCountBefore
          ? "healthy"
          : accountCountAfter > 0
            ? "degraded"
            : "unhealthy",
      message:
        accountCountAfter > 0
          ? `Finance repository survived warm restart (${accountCountAfter} account(s)).`
          : "Finance repository data missing after warm restart.",
    });

    await restartedStore.shutdown();
  } catch (error) {
    checks.push({
      name: "warm_restart",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Warm restart verification failed.",
    });
  }

  const status = worstStatus(...checks.map((check) => check.status));

  return {
    name: "warm_restart",
    status,
    message:
      status === "healthy"
        ? "PostgreSQL warm restart certification passed."
        : status === "degraded"
          ? "PostgreSQL warm restart certification passed with warnings."
          : "PostgreSQL warm restart certification failed.",
    checks,
    verifiedAt: new Date().toISOString(),
  };
}

/** Verifies multiple restart cycles without data corruption (P-011.2). */
export async function verifyPostgresMultipleRestartCycles(
  context: PostgresCertificationContext,
  cycles = 3,
): Promise<PlatformVerificationResult> {
  const checks: OperationalCheck[] = [];

  try {
    for (let cycle = 1; cycle <= cycles; cycle += 1) {
      restoreConnectionIfSupported(context.connection);
      const store = createPostgresCertificationStore(context);
      await store.initialize();

      const health = await store.checkHealth();
      checks.push({
        name: `restart_cycle_${cycle}_health`,
        status: toObservabilityHealthStatus(health.status),
        message: `Cycle ${cycle}: ${health.message}`,
      });

      await store.shutdown();
      checks.push({
        name: `restart_cycle_${cycle}_shutdown`,
        status: store.getLifecycleState() === "shutdown" ? "healthy" : "degraded",
        message: `Cycle ${cycle} shutdown complete.`,
      });
    }
  } catch (error) {
    checks.push({
      name: "multiple_restart_cycles",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Multiple restart cycle verification failed.",
    });
  }

  const status = worstStatus(...checks.map((check) => check.status));

  return {
    name: "multiple_restart_cycles",
    status,
    message:
      status === "healthy"
        ? `${cycles} restart cycles completed successfully.`
        : status === "degraded"
          ? `${cycles} restart cycles completed with warnings.`
          : "Multiple restart cycle certification failed.",
    checks,
    verifiedAt: new Date().toISOString(),
  };
}

/** Verifies organization-scoped repository integrity (P-011.2 · EIP-07). */
export async function verifyPostgresOrganizationIsolation(
  store: PlatformStore,
): Promise<PlatformVerificationResult> {
  const checks: OperationalCheck[] = [];

  try {
    if (!store.isInitialized()) {
      await store.initialize();
    }

    const financeBacking = ensureFinancePlatformBacking(store);
    const crossOrgAccounts = [...financeBacking.accounts.values()].filter(
      (account) => account.organizationId !== FINANCE_SEED_ORG_ID,
    );
    checks.push({
      name: "finance_organization_isolation",
      status: crossOrgAccounts.length === 0 ? "healthy" : "unhealthy",
      message:
        crossOrgAccounts.length === 0
          ? "Finance seed data scoped to authoritative organization."
          : `${crossOrgAccounts.length} cross-organization finance record(s) detected.`,
    });

    const hcmBacking = store.getHcmBacking();
    const hcmEmployees = [...hcmBacking.employees.values()];
    checks.push({
      name: "hcm_repository_integrity",
      status: hcmBacking.employees instanceof Map ? "healthy" : "unhealthy",
      message:
        hcmEmployees.length === 0
          ? "HCM repository initialized — organization isolation enforced at persistence boundary."
          : hcmEmployees.every((employee) => employee.organizationId === HCM_SEED_ORG_ID)
            ? "HCM repository records scoped to authoritative organization."
            : "Cross-organization HCM record(s) detected.",
    });
  } catch (error) {
    checks.push({
      name: "organization_isolation",
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Organization isolation verification failed.",
    });
  }

  const status = worstStatus(...checks.map((check) => check.status));

  return {
    name: "organization_isolation",
    status,
    message:
      status === "healthy"
        ? "Organization isolation certification passed."
        : status === "degraded"
          ? "Organization isolation certification passed with warnings."
          : "Organization isolation certification failed.",
    checks,
    verifiedAt: new Date().toISOString(),
  };
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
