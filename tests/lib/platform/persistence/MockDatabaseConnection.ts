/**
 * In-memory database connection for persistence unit tests.
 */

import type { PoolClient } from "pg";
import type {
  DatabaseConnection,
  DatabasePoolStats,
  DatabaseQueryResult,
} from "@/lib/platform/persistence/DatabaseConnection";

type Row = Record<string, unknown>;

function mockResult<T extends Row = Row>(rows: Row[]): DatabaseQueryResult<T> {
  return {
    rows,
    rowCount: rows.length,
    command: "MOCK",
    oid: 0,
    fields: [],
  } as unknown as DatabaseQueryResult<T>;
}

class MockPoolClient {
  private released = false;

  constructor(private readonly connection: MockDatabaseConnection) {}

  async query<T extends Row = Row>(
    sql: string,
    params?: unknown[],
  ): Promise<DatabaseQueryResult<T>> {
    return this.connection.query<T>(sql, params);
  }

  release(): void {
    this.released = true;
  }

  isReleased(): boolean {
    return this.released;
  }
}

export class MockDatabaseConnection implements DatabaseConnection {
  readonly queries: Array<{ sql: string; params?: unknown[] }> = [];
  private connected = true;
  private serverVersion = "15.0-mock";
  private readonly tables = new Map<string, Row[]>();

  async query<T extends Row = Row>(
    sql: string,
    params?: unknown[],
  ): Promise<DatabaseQueryResult<T>> {
    this.queries.push({ sql, params: params ? [...params] : undefined });
    const normalized = sql.trim().toLowerCase();

    if (normalized === "select 1 as ok") {
      return mockResult([{ ok: 1 }]);
    }

    if (normalized.startsWith("show server_version")) {
      return mockResult([{ version: this.serverVersion }]);
    }

    if (normalized.startsWith("create table")) {
      return mockResult([]);
    }

    if (normalized.startsWith("insert into platform_schema_version")) {
      const version = Number(params?.[0]);
      const migrationId = String(params?.[1]);
      const rows = this.getTable("platform_schema_version");
      const existing = rows.find((row) => row.version === version);
      if (existing) {
        existing.migration_id = migrationId;
      } else {
        rows.push({ version, migration_id: migrationId, applied_at: new Date().toISOString() });
      }
      return mockResult([]);
    }

    if (normalized.startsWith("delete from platform_schema_version")) {
      const version = Number(params?.[0]);
      const rows = this.getTable("platform_schema_version");
      this.tables.set(
        "platform_schema_version",
        rows.filter((row) => row.version !== version),
      );
      return mockResult([]);
    }

    if (normalized.startsWith("insert into platform_migration_history")) {
      const rows = this.getTable("platform_migration_history");
      rows.push({
        migration_id: params?.[0],
        version: params?.[1],
        direction: params?.[2],
        status: params?.[3],
        executed_at: new Date().toISOString(),
        error_message: params?.[4],
      });
      return mockResult([]);
    }

    if (normalized.startsWith("select max(version) as version from platform_schema_version")) {
      const rows = this.getTable("platform_schema_version");
      const version = rows.reduce<number | null>((max, row) => {
        const current = Number(row.version);
        return max === null || current > max ? current : max;
      }, null);
      return mockResult([{ version }]);
    }

    if (normalized.startsWith("select version, migration_id, applied_at, checksum from platform_schema_version")) {
      const rows = this.getTable("platform_schema_version").map((row) => ({
        version: row.version,
        migration_id: row.migration_id,
        applied_at: row.applied_at,
        checksum: row.checksum ?? null,
      }));
      return mockResult(rows);
    }

    if (normalized.includes("from platform_migration_history")) {
      const rows = this.getTable("platform_migration_history").map((row) => ({
        migration_id: row.migration_id,
        version: row.version,
        direction: row.direction,
        status: row.status,
        executed_at: row.executed_at,
        error_message: row.error_message ?? null,
      }));
      return mockResult(rows);
    }

    if (normalized.startsWith("insert into hcm_entities")) {
      const rows = this.getTable("hcm_entities");
      const collection = String(params?.[0]);
      const entityId = String(params?.[1]);
      const payload = JSON.parse(String(params?.[3]));
      const existing = rows.find(
        (row) => row.collection_name === collection && row.entity_id === entityId,
      );
      if (existing) {
        existing.payload = payload;
        existing.organization_id = params?.[2];
      } else {
        rows.push({
          collection_name: collection,
          entity_id: entityId,
          organization_id: params?.[2],
          payload,
        });
      }
      return mockResult([]);
    }

    if (normalized.startsWith("delete from hcm_entities")) {
      const collection = String(params?.[0]);
      const entityId = String(params?.[1]);
      const rows = this.getTable("hcm_entities");
      this.tables.set(
        "hcm_entities",
        rows.filter(
          (row) => !(row.collection_name === collection && row.entity_id === entityId),
        ),
      );
      return mockResult([]);
    }

    if (normalized.includes("from hcm_entities") && normalized.includes("entity_id <> '__array__'")) {
      const collection = String(params?.[0]);
      const rows = this.getTable("hcm_entities")
        .filter((row) => row.collection_name === collection && row.entity_id !== "__array__")
        .map((row) => ({
          entity_id: row.entity_id,
          payload: row.payload,
        }));
      return mockResult(rows);
    }

    if (normalized.includes("entity_id = '__array__'")) {
      const collection = String(params?.[0]);
      const row = this.getTable("hcm_entities").find(
        (entry) => entry.collection_name === collection && entry.entity_id === "__array__",
      );
      return mockResult(row ? [{ payload: row.payload }] : []);
    }

    if (normalized.startsWith("begin")) {
      return mockResult([]);
    }

    if (normalized.startsWith("commit") || normalized.startsWith("rollback")) {
      return mockResult([]);
    }

    return mockResult([]);
  }

  async acquireClient(): Promise<PoolClient> {
    return new MockPoolClient(this) as unknown as PoolClient;
  }

  releaseClient(): void {
    // no-op for mock
  }

  async ping(): Promise<boolean> {
    return this.connected;
  }

  getPoolStats(): DatabasePoolStats {
    return { totalCount: 1, idleCount: 1, waitingCount: 0 };
  }

  async getServerVersion(): Promise<string | null> {
    return this.connected ? this.serverVersion : null;
  }

  async shutdown(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  setConnected(value: boolean): void {
    this.connected = value;
  }

  private getTable(name: string): Row[] {
    if (!this.tables.has(name)) {
      this.tables.set(name, []);
    }
    return this.tables.get(name)!;
  }
}
