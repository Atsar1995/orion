import { randomUUID } from "node:crypto";
import { AuroraMigrationRunner } from "@/lib/aurora/persistence/AuroraMigrationRunner";
import { AuroraSystemDbScope } from "@/lib/aurora/persistence/AuroraSystemDbScope";
import { AuroraTenantDbScope } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import { PostgresDatabaseConnection } from "@/lib/platform/persistence/PostgresDatabaseConnection";

const LIVE_POSTGRES_FLAG = process.env.AURORA_LIVE_POSTGRES === "1";

export const AURORA_LIVE_POSTGRES =
  LIVE_POSTGRES_FLAG &&
  Boolean(process.env.ORION_DATABASE_URL) &&
  Boolean(process.env.AURORA_APP_DATABASE_URL);

export type PostgresTestHarness = {
  /** Privileged connection (`orion`) for migrations and system scope. */
  readonly privilegedConnection: DatabaseConnection;
  /** Restricted application connection (`aurora_app`) for tenant-scoped RLS tests. */
  readonly appConnection: DatabaseConnection;
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

function buildPostgresDatabaseConnection(databaseUrl: string): PostgresDatabaseConnection {
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

function requireDatabaseUrl(
  envVar: "ORION_DATABASE_URL" | "AURORA_APP_DATABASE_URL",
): string {
  const databaseUrl = process.env[envVar];
  if (!databaseUrl) {
    if (envVar === "AURORA_APP_DATABASE_URL") {
      throw new Error(
        "AURORA_APP_DATABASE_URL is required for live Aurora RLS testing when AURORA_LIVE_POSTGRES=1. " +
          "Create the aurora_app role using docs/AURORA/operator/create-aurora-app-role.sql and set a separate restricted connection URL.",
      );
    }
    throw new Error(`${envVar} is required for PostgreSQL Aurora tests.`);
  }
  return databaseUrl;
}

async function assertRestrictedAppDatabaseRole(connection: DatabaseConnection): Promise<void> {
  const result = await connection.query<{ rolsuper: boolean; rolbypassrls: boolean }>(
    "SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user",
  );
  const role = result.rows[0];
  if (!role || role.rolsuper || role.rolbypassrls) {
    throw new Error(
      "AURORA_APP_DATABASE_URL must connect as aurora_app (NOSUPERUSER, NOBYPASSRLS). " +
        "Privileged roles bypass RLS and invalidate the live certification suite.",
    );
  }
}

export async function createPrivilegedPostgresDatabaseConnection(): Promise<PostgresDatabaseConnection> {
  return buildPostgresDatabaseConnection(requireDatabaseUrl("ORION_DATABASE_URL"));
}

export async function createAppPostgresDatabaseConnection(): Promise<PostgresDatabaseConnection> {
  const connection = buildPostgresDatabaseConnection(requireDatabaseUrl("AURORA_APP_DATABASE_URL"));
  await assertRestrictedAppDatabaseRole(connection);
  return connection;
}

/** @deprecated Use createPrivilegedPostgresDatabaseConnection for explicit privileged access. */
export async function createPostgresDatabaseConnection(): Promise<PostgresDatabaseConnection> {
  return createPrivilegedPostgresDatabaseConnection();
}

export async function setupPostgresTestHarness(): Promise<PostgresTestHarness> {
  const privilegedConnection = await createPrivilegedPostgresDatabaseConnection();
  const privilegedReachable = await privilegedConnection.ping();
  if (!privilegedReachable) {
    await privilegedConnection.shutdown();
    throw new Error("Privileged PostgreSQL connection is unreachable for Aurora integration tests.");
  }

  const appConnection = await createAppPostgresDatabaseConnection();
  const appReachable = await appConnection.ping();
  if (!appReachable) {
    await appConnection.shutdown();
    await privilegedConnection.shutdown();
    throw new Error("Restricted aurora_app PostgreSQL connection is unreachable for Aurora RLS tests.");
  }

  const migrationRunner = new AuroraMigrationRunner(privilegedConnection);
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
  const systemDbScope = new AuroraSystemDbScope(privilegedConnection);

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
    privilegedConnection,
    appConnection,
    tenantDbScope: new AuroraTenantDbScope(appConnection),
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
    shutdown: async () => {
      await appConnection.shutdown();
      await privilegedConnection.shutdown();
    },
  };
}

export async function cleanupPostgresTestHarness(harness: PostgresTestHarness): Promise<void> {
  await harness.systemDbScope.run(async (client) => {
    await client.query(`DELETE FROM aurora_schedule WHERE tenant_id IN ($1, $2)`, [
      harness.tenantAId,
      harness.tenantBId,
    ]);
    await client.query(`DELETE FROM aurora_knowledge_relationship WHERE tenant_id IN ($1, $2)`, [
      harness.tenantAId,
      harness.tenantBId,
    ]);
    await client.query(`DELETE FROM aurora_knowledge_embedding WHERE tenant_id IN ($1, $2)`, [
      harness.tenantAId,
      harness.tenantBId,
    ]);
    await client.query(`DELETE FROM aurora_knowledge_entity_version WHERE tenant_id IN ($1, $2)`, [
      harness.tenantAId,
      harness.tenantBId,
    ]);
    await client.query(`DELETE FROM aurora_knowledge_entity WHERE tenant_id IN ($1, $2)`, [
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
