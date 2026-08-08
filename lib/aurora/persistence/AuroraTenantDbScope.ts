import type { PoolClient } from "pg";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";
import { AURORA_ERR_0403, AuroraError } from "@/lib/aurora/errors/AuroraError";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Validates tenant id before binding PostgreSQL RLS session variable (ADR-004). */
export function assertAuroraTenantDbScopeId(tenantId: string): void {
  if (!tenantId || !UUID_PATTERN.test(tenantId)) {
    throw new AuroraError(
      AURORA_ERR_0403,
      "Aurora tenant database scope requires a UUID tenant id.",
      403,
      { tenantId },
    );
  }
}

/**
 * Binds `app.tenant_id` locally for one transaction (ADR-004).
 * Never reuse pool-global tenant state.
 */
export class AuroraTenantDbScope {
  constructor(private readonly connection: DatabaseConnection) {}

  async run<T>(tenantId: string, operation: (client: PoolClient) => Promise<T>): Promise<T> {
    assertAuroraTenantDbScopeId(tenantId);
    const client = await this.connection.acquireClient();

    try {
      await client.query("BEGIN");
      await client.query(`SELECT set_config('app.tenant_id', $1, true)`, [tenantId]);
      const result = await operation(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      this.connection.releaseClient(client);
    }
  }
}

export async function readAuroraTenantSetting(client: PoolClient): Promise<string | null> {
  const result = await client.query<{ tenant_id: string | null }>(
    "SELECT current_setting('app.tenant_id', true) AS tenant_id",
  );
  const value = result.rows[0]?.tenant_id;
  return value && value.length > 0 ? value : null;
}
