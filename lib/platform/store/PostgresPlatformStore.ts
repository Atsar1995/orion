import "server-only";

/**
 * PostgreSQL PlatformStore — production persistence provider (Mission P-015.5 · ADR-007).
 */

import type { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import {
  createPostgresFinanceStore,
  flushPostgresFinanceStore,
} from "@/lib/platform/persistence/finance/createPostgresFinanceStore";
import {
  createPostgresCrmStore,
  flushPostgresCrmStore,
} from "@/lib/platform/persistence/crm/createPostgresCrmStore";
import {
  createPostgresProcurementStore,
  flushPostgresProcurementStore,
} from "@/lib/platform/persistence/procurement/createPostgresProcurementStore";
import type { CrmEntityPersister } from "@/lib/platform/persistence/crm/CrmEntityPersister";
import type { ProcurementEntityPersister } from "@/lib/platform/persistence/procurement/ProcurementEntityPersister";
import type { FinanceEntityPersister } from "@/lib/platform/persistence/finance/FinanceEntityPersister";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";
import type { CrmStoreBacking } from "@/lib/crm/persistence/CrmStoreBacking";
import type { ProcurementStoreBacking } from "@/lib/procurement/persistence/ProcurementStoreBacking";
import type { HcmStoreBacking } from "@/lib/platform/store/HcmStoreBacking";
import type {
  PlatformStore,
  PlatformStoreLifecycleState,
  PlatformStoreMigrationReadiness,
} from "@/lib/platform/store/PlatformStore";
import { createPlatformStoreHealthReport } from "@/lib/platform/store/PlatformStoreHealth";
import type { PlatformStoreHealthReport } from "@/lib/platform/store/PlatformStoreHealth";
import {
  StoreProvider,
  type StoreConfiguration,
} from "@/lib/platform/store/StoreConfiguration";
import type { TransactionManager } from "@/lib/persistence/services/shared";
import {
  createDatabaseHealthReport,
  summarizeDatabaseHealth,
} from "@/lib/platform/persistence/DatabaseHealth";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import {
  createPostgresHcmStore,
  flushPostgresHcmStore,
} from "@/lib/platform/persistence/hcm/createPostgresHcmStore";
import type { HcmEntityPersister } from "@/lib/platform/persistence/hcm/HcmEntityPersister";
import type { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import {
  PersistenceFactory,
  type PersistenceRuntime,
} from "@/lib/platform/persistence/PersistenceFactory";
import {
  loadPersistenceConfiguration,
  type PersistenceConfiguration,
} from "@/lib/platform/persistence/PersistenceConfiguration";
import { PostgresTransactionManager } from "@/lib/platform/persistence/PostgresTransactionManager";

/** Raised when PostgreSQL store cannot initialize. */
export class PostgresPlatformStoreError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "PostgresPlatformStoreError";
  }
}

/** @deprecated Use {@link PostgresPlatformStoreError}. Retained for P-015.4 test compatibility. */
export class PostgresPlatformStoreNotImplementedError extends PostgresPlatformStoreError {
  constructor() {
    super("PostgresPlatformStore failed to initialize.");
    this.name = "PostgresPlatformStoreNotImplementedError";
  }
}

export type PostgresPlatformStoreOptions = {
  readonly configuration?: StoreConfiguration;
  readonly persistenceConfiguration?: PersistenceConfiguration;
  readonly persistenceFactory?: PersistenceFactory;
  readonly connection?: DatabaseConnection;
  readonly migrationRunner?: MigrationRunner;
};

/**
 * PostgreSQL platform store with connection pooling, migrations, and HCM persistence.
 */
export class PostgresPlatformStore implements PlatformStore {
  readonly provider: StoreProvider;
  readonly configuration: StoreConfiguration;

  private readonly persistenceConfiguration: PersistenceConfiguration;
  private readonly persistenceFactory: PersistenceFactory;
  private connection: DatabaseConnection | null = null;
  private migrationRunner: MigrationRunner | null = null;
  private transactionManager: TransactionManager | null = null;
  private hcmStore: InMemoryHcmStore | null = null;
  private financeStore: FinanceStoreBacking | null = null;
  private crmStore: CrmStoreBacking | null = null;
  private procurementStore: ProcurementStoreBacking | null = null;
  private hcmPersister: HcmEntityPersister | null = null;
  private financePersister: FinanceEntityPersister | null = null;
  private crmPersister: CrmEntityPersister | null = null;
  private procurementPersister: ProcurementEntityPersister | null = null;
  private initialized = false;
  private lifecycle: PlatformStoreLifecycleState = "created";
  private lastHealthReport: PlatformStoreHealthReport | null = null;

  constructor(options: PostgresPlatformStoreOptions = {}) {
    this.persistenceConfiguration =
      options.persistenceConfiguration ??
      loadPersistenceConfiguration(options.configuration ?? {});

    this.configuration = this.persistenceConfiguration.store;
    this.provider = this.configuration.provider;

    if (
      this.provider !== StoreProvider.PostgreSQL &&
      this.provider !== StoreProvider.SQLite
    ) {
      throw new PostgresPlatformStoreError(
        "PostgresPlatformStore requires PostgreSQL or SQLite StoreProvider configuration.",
      );
    }

    this.persistenceFactory =
      options.persistenceFactory ?? new PersistenceFactory(this.persistenceConfiguration);

    if (options.connection) {
      this.connection = options.connection;
      this.migrationRunner =
        options.migrationRunner ??
        this.persistenceFactory.createMigrationRunner(options.connection);
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!this.configuration.databaseUrl) {
      throw new PostgresPlatformStoreError(
        "ORION_DATABASE_URL is required for PostgreSQL platform store initialization.",
      );
    }

    try {
      const runtime = this.bootstrapRuntime();
      await runtime.connection.ping();

      if (this.persistenceConfiguration.migration.autoRun) {
        await runtime.migrationRunner.runPending();
      }

      const { store, persister } = await createPostgresHcmStore(runtime.connection);
      const financeRuntime = await createPostgresFinanceStore(runtime.connection);
      const crmRuntime = await createPostgresCrmStore(runtime.connection);
      const procurementRuntime = await createPostgresProcurementStore(runtime.connection);
      this.hcmStore = store;
      this.hcmPersister = persister;
      this.financeStore = financeRuntime.store;
      this.financePersister = financeRuntime.persister;
      this.crmStore = crmRuntime.store;
      this.crmPersister = crmRuntime.persister;
      this.procurementStore = procurementRuntime.store;
      this.procurementPersister = procurementRuntime.persister;
      this.transactionManager = runtime.createTransactionManager(
        persister,
        financeRuntime.persister,
        crmRuntime.persister,
        procurementRuntime.persister,
      );
      this.initialized = true;
      this.lifecycle = "initialized";
      this.lastHealthReport = await this.buildHealthReport("PostgreSQL platform store initialized.");
    } catch (error) {
      throw new PostgresPlatformStoreError(
        "Failed to initialize PostgreSQL platform store.",
        error,
      );
    }
  }

  async shutdown(): Promise<void> {
    if (this.hcmPersister) {
      await flushPostgresHcmStore(this.hcmPersister);
    }

    if (this.financePersister) {
      await flushPostgresFinanceStore(this.financePersister);
    }

    if (this.crmPersister) {
      await flushPostgresCrmStore(this.crmPersister);
    }

    if (this.procurementPersister) {
      await flushPostgresProcurementStore(this.procurementPersister);
    }

    if (this.connection) {
      await this.connection.shutdown();
    }

    this.initialized = false;
    this.hcmStore = null;
    this.financeStore = null;
    this.crmStore = null;
    this.procurementStore = null;
    this.hcmPersister = null;
    this.financePersister = null;
    this.crmPersister = null;
    this.procurementPersister = null;
    this.transactionManager = null;
    this.connection = null;
    this.migrationRunner = null;
    this.lifecycle = "shutdown";
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getLifecycleState(): PlatformStoreLifecycleState {
    return this.lifecycle;
  }

  getTransactionManager(): TransactionManager {
    if (!this.transactionManager) {
      throw new PostgresPlatformStoreError("Platform store is not initialized.");
    }

    return this.transactionManager;
  }

  getFinanceBacking(): FinanceStoreBacking {
    if (!this.financeStore) {
      throw new PostgresPlatformStoreError("Platform store is not initialized.");
    }

    return this.financeStore;
  }

  getCrmBacking(): CrmStoreBacking {
    if (!this.crmStore) {
      throw new PostgresPlatformStoreError("Platform store is not initialized.");
    }

    return this.crmStore;
  }

  getProcurementBacking(): ProcurementStoreBacking {
    if (!this.procurementStore) {
      throw new PostgresPlatformStoreError("Platform store is not initialized.");
    }

    return this.procurementStore;
  }

  getDatabaseConnection(): DatabaseConnection | null {
    return this.connection;
  }

  getHcmBacking(): HcmStoreBacking {
    if (!this.hcmStore) {
      throw new PostgresPlatformStoreError("Platform store is not initialized.");
    }

    return this.hcmStore;
  }

  getHealth(): PlatformStoreHealthReport {
    if (this.lastHealthReport) {
      return this.lastHealthReport;
    }

    return createPlatformStoreHealthReport({
      provider: this.provider,
      status: this.initialized ? "healthy" : "not_initialized",
      initialized: this.initialized,
      message: this.initialized
        ? "PostgreSQL platform store operational."
        : "PostgreSQL platform store not initialized.",
      migrationReady: false,
      details: {
        databaseUrlConfigured: this.configuration.databaseUrl ? "true" : "false",
      },
    });
  }

  async checkHealth(): Promise<PlatformStoreHealthReport> {
    this.lastHealthReport = await this.buildHealthReport();
    return this.lastHealthReport;
  }

  getMigrationReadiness(): PlatformStoreMigrationReadiness {
    if (!this.migrationRunner) {
      return {
        ready: false,
        provider: this.provider,
        message: "Migration runner unavailable until store initialization.",
      };
    }

    return {
      ready: true,
      provider: this.provider,
      message: "PostgreSQL migrations available.",
    };
  }

  private bootstrapRuntime(): PersistenceRuntime {
    if (this.connection && this.migrationRunner) {
      return {
        configuration: this.persistenceConfiguration,
        connection: this.connection,
        migrationRunner: this.migrationRunner,
        createTransactionManager: (hcmPersister, financePersister, crmPersister, procurementPersister) =>
          new PostgresTransactionManager(
            this.connection!,
            hcmPersister,
            financePersister,
            crmPersister,
            procurementPersister,
          ),
      };
    }

    const runtime = this.persistenceFactory.createRuntime();
    this.connection = runtime.connection;
    this.migrationRunner = runtime.migrationRunner;
    return runtime;
  }

  private async buildHealthReport(message?: string): Promise<PlatformStoreHealthReport> {
    if (!this.connection || !this.migrationRunner) {
      return createPlatformStoreHealthReport({
        provider: this.provider,
        status: "not_initialized",
        initialized: false,
        message: message ?? "PostgreSQL platform store not initialized.",
        migrationReady: false,
      });
    }

    const migrationStatus = await this.migrationRunner.getStatus();
    const databaseHealth = await createDatabaseHealthReport({
      provider: this.provider,
      connection: this.connection,
      migrationStatus,
      message,
    });

    const status =
      databaseHealth.status === "healthy"
        ? "healthy"
        : databaseHealth.status === "degraded"
          ? "degraded"
          : "unhealthy";

    return createPlatformStoreHealthReport({
      provider: this.provider,
      status,
      initialized: this.initialized,
      message: databaseHealth.message,
      migrationReady: migrationStatus.upToDate,
      details: summarizeDatabaseHealth(databaseHealth),
    });
  }
}
