/**
 * ORION Persistence — platform configuration types.
 */

/** Supported persistence adapter identifiers. */
export enum PersistenceAdapter {
  InMemory = "in_memory",
  PostgreSQL = "postgresql",
  SQLite = "sqlite",
  SqlServer = "sql_server",
}

/** Optional database connection settings for future adapters. */
export interface DatabaseConnectionOptions {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

/** Environment-independent persistence configuration. */
export interface PersistenceConfiguration {
  adapter: PersistenceAdapter;
  database?: DatabaseConnectionOptions;
}

/** Default development configuration using in-memory adapters. */
export const DEFAULT_PERSISTENCE_CONFIGURATION: PersistenceConfiguration = {
  adapter: PersistenceAdapter.InMemory,
};

/** Creates a persistence configuration with optional overrides. */
export function createPersistenceConfiguration(
  overrides: Partial<PersistenceConfiguration> = {},
): PersistenceConfiguration {
  return {
    ...DEFAULT_PERSISTENCE_CONFIGURATION,
    ...overrides,
    database: overrides.database
      ? {
          ...overrides.database,
        }
      : undefined,
  };
}

/** Returns true when the adapter is currently implemented. */
export function isPersistenceAdapterImplemented(
  adapter: PersistenceAdapter,
): boolean {
  return adapter === PersistenceAdapter.InMemory;
}
