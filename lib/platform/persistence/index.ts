/**
 * ORION Platform Persistence — public API (Mission P-015.5 · ADR-007).
 *
 * @see docs/Platform/Persistence/Enterprise-PostgreSQL-Persistence.md
 */

export type { Migration, MigrationContext, MigrationExecutionRecord, AppliedMigrationVersion } from "@/lib/platform/persistence/Migration";
export { createMigrationContext } from "@/lib/platform/persistence/Migration";

export { MigrationRegistry, DEFAULT_PLATFORM_MIGRATIONS } from "@/lib/platform/persistence/MigrationRegistry";
export { MigrationRunner, MigrationRunnerError } from "@/lib/platform/persistence/MigrationRunner";
export type { MigrationRunnerStatus } from "@/lib/platform/persistence/MigrationRunner";

export {
  DEFAULT_MIGRATION_SETTINGS,
  DEFAULT_POOL_SETTINGS,
  DEFAULT_RETRY_SETTINGS,
  isRelationalPersistenceProvider,
  loadPersistenceConfiguration,
} from "@/lib/platform/persistence/PersistenceConfiguration";
export type {
  DatabasePoolSettings,
  DatabaseRetrySettings,
  MigrationSettings,
  PersistenceConfiguration,
} from "@/lib/platform/persistence/PersistenceConfiguration";

export {
  DatabaseConnectionError,
} from "@/lib/platform/persistence/DatabaseConnection";
export type {
  DatabaseConnection,
  DatabasePoolStats,
  DatabaseQueryResult,
} from "@/lib/platform/persistence/DatabaseConnection";
export { PostgresDatabaseConnection } from "@/lib/platform/persistence/PostgresDatabaseConnection";

export {
  createDatabaseHealthReport,
  summarizeDatabaseHealth,
} from "@/lib/platform/persistence/DatabaseHealth";
export type { DatabaseHealthReport, DatabaseHealthStatus } from "@/lib/platform/persistence/DatabaseHealth";

export { PersistenceFactory } from "@/lib/platform/persistence/PersistenceFactory";
export type { PersistenceRuntime } from "@/lib/platform/persistence/PersistenceFactory";

export { PostgresTransactionManager } from "@/lib/platform/persistence/PostgresTransactionManager";
export type { PostgresPersistenceTransaction } from "@/lib/platform/persistence/PostgresTransactionManager";

export {
  HCM_PERSISTENT_COLLECTIONS,
  HcmEntityPersister,
  PersistingArray,
  PersistingMap,
} from "@/lib/platform/persistence/hcm/HcmEntityPersister";
export type { HcmPersistentCollection } from "@/lib/platform/persistence/hcm/HcmEntityPersister";

export {
  createPostgresHcmStore,
  flushPostgresHcmStore,
} from "@/lib/platform/persistence/hcm/createPostgresHcmStore";

export { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
