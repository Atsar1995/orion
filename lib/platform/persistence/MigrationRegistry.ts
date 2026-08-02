/**
 * Platform migration registry (Mission P-015.5 · ADR-007).
 */

import type { Migration } from "@/lib/platform/persistence/Migration";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";

/** Registry of ordered platform migrations. */
export class MigrationRegistry {
  private readonly migrations: Migration[];

  constructor(migrations: readonly Migration[] = DEFAULT_PLATFORM_MIGRATIONS) {
    this.migrations = [...migrations].sort((left, right) => left.version - right.version);
    this.assertUniqueVersions();
  }

  getAll(): readonly Migration[] {
    return this.migrations;
  }

  getLatestVersion(): number {
    if (this.migrations.length === 0) {
      return 0;
    }

    return this.migrations[this.migrations.length - 1].version;
  }

  getByVersion(version: number): Migration | undefined {
    return this.migrations.find((migration) => migration.version === version);
  }

  getPending(appliedVersion: number): readonly Migration[] {
    return this.migrations.filter((migration) => migration.version > appliedVersion);
  }

  getRollbackCandidates(appliedVersion: number): readonly Migration[] {
    return [...this.migrations]
      .filter((migration) => migration.version <= appliedVersion)
      .sort((left, right) => right.version - left.version);
  }

  private assertUniqueVersions(): void {
    const seen = new Set<number>();
    for (const migration of this.migrations) {
      if (seen.has(migration.version)) {
        throw new Error(`Duplicate migration version detected: ${migration.version}`);
      }
      seen.add(migration.version);
    }
  }
}

/** Default platform migration set for ORION GA bootstrap. */
export const DEFAULT_PLATFORM_MIGRATIONS: readonly Migration[] = [bootstrapMigration];
