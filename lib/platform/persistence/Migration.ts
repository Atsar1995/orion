/**
 * Platform migration contract (Mission P-015.5 · ADR-007).
 */

import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";

/** Execution context passed to migration scripts. */
export interface MigrationContext {
  readonly connection: DatabaseConnection;
  query(sql: string, params?: readonly unknown[]): Promise<void>;
}

/** Versioned schema migration with rollback support. */
export interface Migration {
  readonly id: string;
  readonly version: number;
  readonly description: string;
  up(context: MigrationContext): Promise<void>;
  down(context: MigrationContext): Promise<void>;
}

/** Record of a migration execution attempt. */
export type MigrationExecutionRecord = {
  readonly migrationId: string;
  readonly version: number;
  readonly direction: "up" | "down";
  readonly status: "success" | "failure";
  readonly executedAt: string;
  readonly errorMessage?: string;
};

/** Applied migration version tracked in the database. */
export type AppliedMigrationVersion = {
  readonly version: number;
  readonly migrationId: string;
  readonly appliedAt: string;
  readonly checksum?: string;
};

export function createMigrationContext(connection: DatabaseConnection): MigrationContext {
  return {
    connection,
    query: async (sql, params) => {
      await connection.query(sql, params ? [...params] : undefined);
    },
  };
}
