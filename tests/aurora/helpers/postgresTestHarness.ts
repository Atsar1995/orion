import { randomUUID } from "node:crypto";
import { AuroraMigrationRunner } from "@/lib/aurora/persistence/AuroraMigrationRunner";
import { AuroraSystemDbScope } from "@/lib/aurora/persistence/AuroraSystemDbScope";
import { AuroraTenantDbScope } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import { PostgresDatabaseConnection } from "@/lib/platform/persistence/PostgresDatabaseConnection";

export const AURORA_LIVE_POSTGRES =
  process.env.AURORA_LIVE_POSTGRES === "1" && Boolean(process.env.ORION_DATABASE_URL);

export type PostgresTestHarness = {
  readonly connection: DatabaseConnection;
  readonly tenantDbScope: AuroraTenantDbScope;
  readonly systemDbScope: AuroraSystemDbScope;
  readonly tenantAId: string;
  readonly tenantBId: string;
  readonly businessAId: string;
  readonly businessBId: string;
  readonly brandAId: string;
  readonly brandBId: string;
  readonly userAId: string;
  readonly userBId: string;
  readonly scheduleBId: string;
  shutdown(): Promise<void>;
};

export async function createPostgresDatabaseConnection(): Promise<PostgresDatabaseConnection> {
  const databaseUrl = process.env.ORION_DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("ORION_DATABASE_URL is required for PostgreSQL Aurora tests.");
  }

  return new PostgresDatabaseConnection(
    databaseUrl,
    {
      minConnections: 1,
      maxConnections: 5,
      connectTimeoutMs: 5_000,
      idleTimeoutMs: 10_000,
      queryTimeoutMs: 30_000,
    },
    { maxAttempts: 1, delayMs: 100 },
  );
}

export async function setupPostgresTestHarness(): Promise<PostgresTestHarness> {
  const connection = await createPostgresDatabaseConnection();
  const reachable = await connection.ping();
  if (!reachable) {
    await connection.shutdown();
    throw new Error("PostgreSQL is unreachable for Aurora integration tests.");
  }

  const migrationRunner = new AuroraMigrationRunner(connection);
  await migrationRunner.runPending();

  const tenantAId = randomUUID();
  const tenantBId = randomUUID();
  const businessAId = randomUUID();
  const businessBId = randomUUID();
  const brandAId = randomUUID();
  const brandBId = randomUUID();
  const userAId = randomUUID();
  const userBId = randomUUID();
  const scheduleBId = randomUUID();
  const systemDbScope = new AuroraSystemDbScope(connection);

  await systemDbScope.run(async (client) => {
    await client.query(
      `INSERT INTO aurora_tenant (id, name, slug, tier, status)
       VALUES ($1, 'Tenant A', 'tenant-a-rls', 'starter', 'active'),
              ($2, 'Tenant B', 'tenant-b-rls', 'starter', 'active')`,
      [tenantAId, tenantBId],
    );

    await client.query(
      `INSERT INTO aurora_business_entity (id, tenant_id, name, slug, status)
       VALUES ($1, $2, 'Business A', 'business-a', 'active'),
              ($3, $4, 'Business B', 'business-b', 'active')`,
      [businessAId, tenantAId, businessBId, tenantBId],
    );

    await client.query(
      `INSERT INTO aurora_brand (
         id, tenant_id, business_id, name, slug, locale, timezone, status
       ) VALUES
         ($1, $2, $3, 'Brand A', 'brand-a', 'en-US', 'UTC', 'active'),
         ($4, $5, $6, 'Brand B', 'brand-b', 'en-US', 'UTC', 'active')`,
      [brandAId, tenantAId, businessAId, brandBId, tenantBId, businessBId],
    );

    await client.query(
      `INSERT INTO aurora_tenant_config (tenant_id, tier, approval_policy, token_budget, feature_overrides, limits)
       VALUES ($1, 'starter', '{}', 10000, '{}', '{}'),
              ($2, 'starter', '{}', 10000, '{}', '{}')`,
      [tenantAId, tenantBId],
    );

    await client.query(
      `INSERT INTO aurora_workspace_config (tenant_id, user_id, active_brand_id, dashboard_layout, notification_preferences)
       VALUES ($1, $2, $3, '{"layout":"a"}', '{"email":true}'),
              ($4, $5, $6, '{"layout":"b"}', '{"email":false}')`,
      [tenantAId, userAId, brandAId, tenantBId, userBId, brandBId],
    );

    await client.query(
      `INSERT INTO aurora_schedule (id, tenant_id, brand_id, scheduled_at, payload, status)
       VALUES ($1, $2, $3, NOW(), '{"job":"tenant-b"}', 'pending')`,
      [scheduleBId, tenantBId, brandBId],
    );
  });

  return {
    connection,
    tenantDbScope: new AuroraTenantDbScope(connection),
    systemDbScope,
    tenantAId,
    tenantBId,
    businessAId,
    businessBId,
    brandAId,
    brandBId,
    userAId,
    userBId,
    scheduleBId,
    shutdown: () => connection.shutdown(),
  };
}

export async function cleanupPostgresTestHarness(harness: PostgresTestHarness): Promise<void> {
  await harness.systemDbScope.run(async (client) => {
    await client.query(`DELETE FROM aurora_schedule WHERE tenant_id IN ($1, $2)`, [
      harness.tenantAId,
      harness.tenantBId,
    ]);
    await client.query(`DELETE FROM aurora_workspace_config WHERE tenant_id IN ($1, $2)`, [
      harness.tenantAId,
      harness.tenantBId,
    ]);
    await client.query(`DELETE FROM aurora_tenant_config WHERE tenant_id IN ($1, $2)`, [
      harness.tenantAId,
      harness.tenantBId,
    ]);
    await client.query(`DELETE FROM aurora_brand WHERE tenant_id IN ($1, $2)`, [
      harness.tenantAId,
      harness.tenantBId,
    ]);
    await client.query(`DELETE FROM aurora_business_entity WHERE tenant_id IN ($1, $2)`, [
      harness.tenantAId,
      harness.tenantBId,
    ]);
    await client.query(`DELETE FROM aurora_tenant WHERE id IN ($1, $2)`, [
      harness.tenantAId,
      harness.tenantBId,
    ]);
  });
  await harness.shutdown();
}
