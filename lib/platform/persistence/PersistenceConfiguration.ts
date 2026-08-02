/**
 * Platform persistence configuration (Mission P-015.5 · ADR-007 · ADR-010).
 */

import {
  StoreProvider,
  loadStoreConfiguration,
  type StoreConfiguration,
} from "@/lib/platform/store/StoreConfiguration";

/** Connection pool and timeout settings for PostgreSQL. */
export interface DatabasePoolSettings {
  readonly minConnections: number;
  readonly maxConnections: number;
  readonly connectTimeoutMs: number;
  readonly idleTimeoutMs: number;
  readonly queryTimeoutMs: number;
}

/** Retry strategy for transient connection failures. */
export interface DatabaseRetrySettings {
  readonly maxAttempts: number;
  readonly delayMs: number;
}

/** Migration execution settings. */
export interface MigrationSettings {
  readonly autoRun: boolean;
  readonly allowRollback: boolean;
}

/** Full persistence runtime configuration for platform PostgreSQL provider. */
export interface PersistenceConfiguration {
  readonly store: StoreConfiguration;
  readonly pool: DatabasePoolSettings;
  readonly retry: DatabaseRetrySettings;
  readonly migration: MigrationSettings;
}

const POOL_MIN_ENV = "ORION_DB_POOL_MIN";
const POOL_MAX_ENV = "ORION_DB_POOL_MAX";
const CONNECT_TIMEOUT_ENV = "ORION_DB_CONNECT_TIMEOUT_MS";
const IDLE_TIMEOUT_ENV = "ORION_DB_IDLE_TIMEOUT_MS";
const QUERY_TIMEOUT_ENV = "ORION_DB_QUERY_TIMEOUT_MS";
const RETRY_ATTEMPTS_ENV = "ORION_DB_RETRY_ATTEMPTS";
const RETRY_DELAY_ENV = "ORION_DB_RETRY_DELAY_MS";
const MIGRATION_AUTO_ENV = "ORION_MIGRATION_AUTO_RUN";
const MIGRATION_ROLLBACK_ENV = "ORION_MIGRATION_ALLOW_ROLLBACK";

function readEnv(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function readIntEnv(key: string, fallback: number): number {
  const raw = readEnv(key);
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function readBoolEnv(key: string, fallback: boolean): boolean {
  const raw = readEnv(key)?.toLowerCase();
  if (raw === undefined) {
    return fallback;
  }

  return raw === "1" || raw === "true" || raw === "yes";
}

/** Default pool settings for development and CI. */
export const DEFAULT_POOL_SETTINGS: DatabasePoolSettings = {
  minConnections: 1,
  maxConnections: 10,
  connectTimeoutMs: 10_000,
  idleTimeoutMs: 30_000,
  queryTimeoutMs: 30_000,
};

/** Default retry settings. */
export const DEFAULT_RETRY_SETTINGS: DatabaseRetrySettings = {
  maxAttempts: 3,
  delayMs: 250,
};

/** Default migration settings — auto-run enabled outside production test harness. */
export const DEFAULT_MIGRATION_SETTINGS: MigrationSettings = {
  autoRun: true,
  allowRollback: true,
};

/** Loads persistence configuration from environment variables. */
export function loadPersistenceConfiguration(
  storeOverrides: Partial<StoreConfiguration> = {},
): PersistenceConfiguration {
  const store = {
    ...loadStoreConfiguration(),
    ...storeOverrides,
  };

  return {
    store,
    pool: {
      minConnections: readIntEnv(POOL_MIN_ENV, DEFAULT_POOL_SETTINGS.minConnections),
      maxConnections: readIntEnv(POOL_MAX_ENV, DEFAULT_POOL_SETTINGS.maxConnections),
      connectTimeoutMs: readIntEnv(CONNECT_TIMEOUT_ENV, DEFAULT_POOL_SETTINGS.connectTimeoutMs),
      idleTimeoutMs: readIntEnv(IDLE_TIMEOUT_ENV, DEFAULT_POOL_SETTINGS.idleTimeoutMs),
      queryTimeoutMs: readIntEnv(QUERY_TIMEOUT_ENV, DEFAULT_POOL_SETTINGS.queryTimeoutMs),
    },
    retry: {
      maxAttempts: readIntEnv(RETRY_ATTEMPTS_ENV, DEFAULT_RETRY_SETTINGS.maxAttempts),
      delayMs: readIntEnv(RETRY_DELAY_ENV, DEFAULT_RETRY_SETTINGS.delayMs),
    },
    migration: {
      autoRun: readBoolEnv(MIGRATION_AUTO_ENV, DEFAULT_MIGRATION_SETTINGS.autoRun),
      allowRollback: readBoolEnv(MIGRATION_ROLLBACK_ENV, DEFAULT_MIGRATION_SETTINGS.allowRollback),
    },
  };
}

/** Returns true when the configured store provider uses PostgreSQL persistence. */
export function isRelationalPersistenceProvider(provider: StoreProvider): boolean {
  return provider === StoreProvider.PostgreSQL || provider === StoreProvider.SQLite;
}
