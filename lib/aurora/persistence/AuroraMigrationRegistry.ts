import type { Migration } from "@/lib/platform/persistence/Migration";
import { loadAuroraMigrationSql } from "@/lib/aurora/persistence/loadAuroraMigrationSql";

function sqlMigration(
  id: string,
  version: number,
  description: string,
  filename: string,
): Migration {
  const sql = loadAuroraMigrationSql(filename);
  return {
    id,
    version,
    description,
    up: async (context) => {
      await context.query(sql);
    },
    down: async () => {
      throw new Error(`Rollback is not supported for ${id}.`);
    },
  };
}

/** Aurora admin DDL migrations (ADR-001 · ES-AURORA-006 §9.1). */
export const AURORA_ADMIN_MIGRATIONS: readonly Migration[] = [
  sqlMigration(
    "001_aurora_admin_tables",
    1,
    "Aurora admin tables (WP-A001)",
    "001_aurora_admin_tables.sql",
  ),
  sqlMigration(
    "002_aurora_business_entity",
    2,
    "Business entity hierarchy and brand business_id backfill",
    "002_aurora_business_entity.sql",
  ),
  sqlMigration(
    "003_aurora_config_tables",
    3,
    "Workspace configuration table (Phase 2B slice)",
    "003_aurora_config_tables.sql",
  ),
  sqlMigration(
    "005_aurora_rls_policies",
    5,
    "Tenant RLS policies (ADR-004)",
    "005_aurora_rls_policies.sql",
  ),
  sqlMigration(
    "007_knowledge_memory",
    7,
    "Knowledge entity and version history tables (ES-AURORA-007 Gate 4C)",
    "007_knowledge_memory.sql",
  ),
  sqlMigration(
    "008_knowledge_relationship",
    8,
    "Knowledge relationship graph table (ES-AURORA-007 Sprint 2)",
    "008_knowledge_relationship.sql",
  ),
  sqlMigration(
    "009_knowledge_embedding",
    9,
    "Knowledge embedding pgvector table and entity FTS (ES-AURORA-007 Sprint 3 Gate 2)",
    "009_knowledge_embedding.sql",
  ),
];

export class AuroraMigrationRegistry {
  constructor(private readonly migrations: readonly Migration[] = AURORA_ADMIN_MIGRATIONS) {}

  getLatestVersion(): number {
    return this.migrations.reduce((max, migration) => Math.max(max, migration.version), 0);
  }

  getPending(currentVersion: number): readonly Migration[] {
    return this.migrations
      .filter((migration) => migration.version > currentVersion)
      .sort((left, right) => left.version - right.version);
  }

  getByVersion(version: number): Migration | undefined {
    return this.migrations.find((migration) => migration.version === version);
  }
}
