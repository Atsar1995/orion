import "server-only";

/**
 * Platform persistence factory (Mission P-015.5 · ADR-007).
 */

import {
  DatabaseConnectionError,
  type DatabaseConnection,
} from "@/lib/platform/persistence/DatabaseConnection";
import { PostgresDatabaseConnection } from "@/lib/platform/persistence/PostgresDatabaseConnection";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import {
  loadPersistenceConfiguration,
  type PersistenceConfiguration,
} from "@/lib/platform/persistence/PersistenceConfiguration";
import { PostgresTransactionManager } from "@/lib/platform/persistence/PostgresTransactionManager";
import type { CrmEntityPersister } from "@/lib/platform/persistence/crm/CrmEntityPersister";
import type { ProcurementEntityPersister } from "@/lib/platform/persistence/procurement/ProcurementEntityPersister";
import type { FinanceEntityPersister } from "@/lib/platform/persistence/finance/FinanceEntityPersister";
import type { HcmEntityPersister } from "@/lib/platform/persistence/hcm/HcmEntityPersister";

export type PersistenceRuntime = {
  readonly configuration: PersistenceConfiguration;
  readonly connection: DatabaseConnection;
  readonly migrationRunner: MigrationRunner;
  createTransactionManager(
    hcmPersister?: HcmEntityPersister,
    financePersister?: FinanceEntityPersister,
    crmPersister?: CrmEntityPersister,
    procurementPersister?: ProcurementEntityPersister,
  ): PostgresTransactionManager;
};

/** Constructs persistence runtime components from configuration. */
export class PersistenceFactory {
  private readonly configuration: PersistenceConfiguration;

  constructor(configuration: PersistenceConfiguration = loadPersistenceConfiguration()) {
    this.configuration = configuration;
  }

  getConfiguration(): PersistenceConfiguration {
    return this.configuration;
  }

  createConnection(): DatabaseConnection {
    return PostgresDatabaseConnection.fromConfiguration(this.configuration);
  }

  createMigrationRunner(connection: DatabaseConnection): MigrationRunner {
    return new MigrationRunner(
      connection,
      new MigrationRegistry(),
      this.configuration.migration,
    );
  }

  createRuntime(connection: DatabaseConnection = this.createConnection()): PersistenceRuntime {
    const configuration = this.configuration;
    const migrationRunner = this.createMigrationRunner(connection);

    return {
      configuration,
      connection,
      migrationRunner,
      createTransactionManager: (hcmPersister, financePersister, crmPersister, procurementPersister) =>
        new PostgresTransactionManager(
          connection,
          hcmPersister,
          financePersister,
          crmPersister,
          procurementPersister,
        ),
    };
  }

  static fromEnvironment(): PersistenceFactory {
    return new PersistenceFactory(loadPersistenceConfiguration());
  }
}
