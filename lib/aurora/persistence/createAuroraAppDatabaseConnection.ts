import "server-only";

import {
  PostgresDatabaseConnection,
} from "@/lib/platform/persistence/PostgresDatabaseConnection";
import {
  DEFAULT_POOL_SETTINGS,
  DEFAULT_RETRY_SETTINGS,
} from "@/lib/platform/persistence/PersistenceConfiguration";
import { DatabaseConnectionError } from "@/lib/platform/persistence/DatabaseConnection";

const AURORA_APP_DATABASE_URL_ENV = "AURORA_APP_DATABASE_URL";

/**
 * Creates the restricted Aurora application database connection.
 *
 * This connection is intentionally separate from the privileged platform
 * connection and is used with AuroraTenantDbScope/RLS.
 */
export function createAuroraAppDatabaseConnection(): PostgresDatabaseConnection {
  const databaseUrl = process.env[AURORA_APP_DATABASE_URL_ENV]?.trim();

  if (!databaseUrl) {
    throw new DatabaseConnectionError(
      "AURORA_APP_DATABASE_URL is required for the Aurora application database connection.",
    );
  }

  return new PostgresDatabaseConnection(
    databaseUrl,
    DEFAULT_POOL_SETTINGS,
    DEFAULT_RETRY_SETTINGS,
  );
}
