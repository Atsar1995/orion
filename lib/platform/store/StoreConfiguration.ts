/**
 * Platform store configuration (Mission P-015.4 · ADR-007 · ADR-010).
 */

/** Supported platform store providers. */
export enum StoreProvider {
  InMemory = "memory",
  PostgreSQL = "postgres",
  SQLite = "sqlite",
}

/** Runtime configuration for PlatformStore construction. */
export interface StoreConfiguration {
  readonly provider: StoreProvider;
  readonly databaseUrl?: string;
  readonly migrationReady: boolean;
}

const DEFAULT_DATABASE_URL_ENV = "ORION_DATABASE_URL";
const STORE_ADAPTER_ENV = "ORION_STORE_ADAPTER";

function readEnv(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function parseProvider(raw: string | undefined): StoreProvider {
  switch (raw?.toLowerCase()) {
    case StoreProvider.PostgreSQL:
    case "postgresql":
      return StoreProvider.PostgreSQL;
    case StoreProvider.SQLite:
      return StoreProvider.SQLite;
    case StoreProvider.InMemory:
    case "in_memory":
    case "in-memory":
      return StoreProvider.InMemory;
    default:
      return StoreProvider.InMemory;
  }
}

function isProductionRuntime(): boolean {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (nodeEnv !== "production") {
    return false;
  }

  // Next.js sets NODE_ENV=production during `next build` — allow in-memory for build/SSG only.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return false;
  }

  return true;
}

/** Loads store configuration from environment variables. */
export function loadStoreConfiguration(): StoreConfiguration {
  const provider = parseProvider(readEnv(STORE_ADAPTER_ENV));
  const databaseUrl = readEnv(DEFAULT_DATABASE_URL_ENV);

  if (isProductionRuntime() && provider === StoreProvider.InMemory) {
    throw new Error(
      "ORION_STORE_ADAPTER=memory is not permitted in production. Use 'postgres' per ADR-007.",
    );
  }

  if (
    (provider === StoreProvider.PostgreSQL || provider === StoreProvider.SQLite) &&
    !databaseUrl &&
    isProductionRuntime()
  ) {
    throw new Error(
      `${DEFAULT_DATABASE_URL_ENV} is required when ORION_STORE_ADAPTER=${provider} in production.`,
    );
  }

  return {
    provider,
    databaseUrl,
    migrationReady: provider === StoreProvider.InMemory,
  };
}

/** Default development configuration. */
export const DEFAULT_STORE_CONFIGURATION: StoreConfiguration = {
  provider: StoreProvider.InMemory,
  migrationReady: true,
};

/** Returns true when the provider has a production-ready implementation. */
export function isStoreProviderImplemented(provider: StoreProvider): boolean {
  return (
    provider === StoreProvider.InMemory ||
    provider === StoreProvider.PostgreSQL ||
    provider === StoreProvider.SQLite
  );
}
