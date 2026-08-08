import type { PoolClient } from "pg";
import type { DatabaseConnection } from "@/lib/platform/persistence/DatabaseConnection";

/**
 * Controlled platform/system database scope for catalog operations (ADR-004).
 * Uses transaction-local row_security bypass — must never accept client tenantId.
 */
export class AuroraSystemDbScope {
  constructor(private readonly connection: DatabaseConnection) {}

  async run<T>(operation: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.connection.acquireClient();

    try {
      await client.query("BEGIN");
      await client.query("SET LOCAL row_security = off");
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

export async function runWithAuroraSystemDbScope<T>(
  connection: DatabaseConnection,
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  return new AuroraSystemDbScope(connection).run(operation);
}
