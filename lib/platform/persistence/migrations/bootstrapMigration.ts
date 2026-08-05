/**
 * Bootstrap platform schema migration (Mission P-015.5 · ADR-007).
 */

import type { Migration } from "@/lib/platform/persistence/Migration";

export const bootstrapMigration: Migration = {
  id: "001_platform_bootstrap",
  version: 1,
  description: "Platform schema version tracking and HCM entity persistence tables.",
  async up({ query }) {
    await query(`
      CREATE TABLE IF NOT EXISTS platform_schema_version (
        version INTEGER PRIMARY KEY,
        migration_id TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        checksum TEXT
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS platform_migration_history (
        id SERIAL PRIMARY KEY,
        migration_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        direction TEXT NOT NULL CHECK (direction IN ('up', 'down')),
        status TEXT NOT NULL CHECK (status IN ('success', 'failure')),
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        error_message TEXT
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS hcm_entities (
        collection_name TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        organization_id TEXT,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (collection_name, entity_id)
      )
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_hcm_entities_org
      ON hcm_entities (organization_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_hcm_entities_collection
      ON hcm_entities (collection_name)
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS finance_entities (
        collection_name TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        organization_id TEXT,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (collection_name, entity_id)
      )
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_finance_entities_org
      ON finance_entities (organization_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_finance_entities_collection
      ON finance_entities (collection_name)
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS crm_entities (
        collection_name TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        organization_id TEXT,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (collection_name, entity_id)
      )
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_crm_entities_org
      ON crm_entities (organization_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_crm_entities_collection
      ON crm_entities (collection_name)
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS procurement_entities (
        collection_name TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        organization_id TEXT,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (collection_name, entity_id)
      )
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_procurement_entities_org
      ON procurement_entities (organization_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_procurement_entities_collection
      ON procurement_entities (collection_name)
    `);
  },
  async down({ query }) {
    await query("DROP TABLE IF EXISTS procurement_entities");
    await query("DROP TABLE IF EXISTS crm_entities");
    await query("DROP TABLE IF EXISTS finance_entities");
    await query("DROP TABLE IF EXISTS hcm_entities");
    await query("DROP TABLE IF EXISTS platform_migration_history");
    await query("DROP TABLE IF EXISTS platform_schema_version");
  },
};
