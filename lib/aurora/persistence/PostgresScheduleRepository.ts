import type { ScheduleRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { AuroraTenantDbScope } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import {
  assertRepositoryTenantParam,
  toIsoString,
} from "@/lib/aurora/persistence/postgresRepositoryUtils";
import { AURORA_ERR_0404, AuroraError } from "@/lib/aurora/errors/AuroraError";
import type { ScheduleEntryRecord } from "@/lib/aurora/persistence/AuroraStoreBacking";

type ScheduleRow = {
  id: string;
  tenant_id: string;
  brand_id: string | null;
  scheduled_at: Date | string;
  payload: Record<string, unknown>;
  status: ScheduleEntryRecord["status"];
  created_at: Date | string;
};

function mapScheduleRow(row: ScheduleRow): ScheduleEntryRecord {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    brandId: row.brand_id ?? undefined,
    scheduledAt: toIsoString(row.scheduled_at),
    payload: row.payload,
    status: row.status,
    createdAt: toIsoString(row.created_at),
  };
}

/**
 * PostgreSQL schedule repository with tenant scope + RLS (Phase 2C).
 */
export class PostgresScheduleRepository implements ScheduleRepository {
  constructor(
    private readonly dbScope: AuroraTenantDbScope,
    private readonly scopeTenantId: string,
  ) {}

  async create(entry: ScheduleEntryRecord): Promise<ScheduleEntryRecord> {
    assertRepositoryTenantParam(this.scopeTenantId, entry.tenantId);

    return this.dbScope.run(this.scopeTenantId, async (client) => {
      const result = await client.query<ScheduleRow>(
        `INSERT INTO aurora_schedule
          (id, tenant_id, brand_id, scheduled_at, payload, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, tenant_id, brand_id, scheduled_at, payload, status, created_at`,
        [
          entry.id,
          entry.tenantId,
          entry.brandId ?? null,
          entry.scheduledAt,
          entry.payload,
          entry.status,
        ],
      );

      return mapScheduleRow(result.rows[0]);
    });
  }

  async getById(
    tenantId: string,
    scheduleId: string,
  ): Promise<ScheduleEntryRecord | null> {
    assertRepositoryTenantParam(this.scopeTenantId, tenantId);

    return this.dbScope.run(this.scopeTenantId, async (client) => {
      const result = await client.query<ScheduleRow>(
        `SELECT id, tenant_id, brand_id, scheduled_at, payload, status, created_at
         FROM aurora_schedule
         WHERE tenant_id = $1 AND id = $2`,
        [tenantId, scheduleId],
      );

      return result.rows[0] ? mapScheduleRow(result.rows[0]) : null;
    });
  }

  async listPending(
    tenantId: string,
  ): Promise<readonly ScheduleEntryRecord[]> {
    assertRepositoryTenantParam(this.scopeTenantId, tenantId);

    return this.dbScope.run(this.scopeTenantId, async (client) => {
      const result = await client.query<ScheduleRow>(
        `SELECT id, tenant_id, brand_id, scheduled_at, payload, status, created_at
         FROM aurora_schedule
         WHERE tenant_id = $1 AND status = 'pending'
         ORDER BY scheduled_at ASC`,
        [tenantId],
      );

      return result.rows.map(mapScheduleRow);
    });
  }

  async update(
    entry: ScheduleEntryRecord,
  ): Promise<ScheduleEntryRecord> {
    assertRepositoryTenantParam(this.scopeTenantId, entry.tenantId);

    return this.dbScope.run(this.scopeTenantId, async (client) => {
      const result = await client.query<ScheduleRow>(
        `UPDATE aurora_schedule
         SET brand_id = $3,
             scheduled_at = $4,
             payload = $5,
             status = $6
         WHERE tenant_id = $1 AND id = $2
         RETURNING id, tenant_id, brand_id, scheduled_at, payload, status, created_at`,
        [
          entry.tenantId,
          entry.id,
          entry.brandId ?? null,
          entry.scheduledAt,
          entry.payload,
          entry.status,
        ],
      );

      if (!result.rows[0]) {
        throw new AuroraError(AURORA_ERR_0404, "Schedule not found.", 404);
      }

      return mapScheduleRow(result.rows[0]);
    });
  }

  async delete(tenantId: string, scheduleId: string): Promise<void> {
    assertRepositoryTenantParam(this.scopeTenantId, tenantId);

    await this.dbScope.run(this.scopeTenantId, async (client) => {
      const result = await client.query(
        `DELETE FROM aurora_schedule
         WHERE tenant_id = $1 AND id = $2`,
        [tenantId, scheduleId],
      );

      if (result.rowCount === 0) {
        throw new AuroraError(AURORA_ERR_0404, "Schedule not found.", 404);
      }
    });
  }
}
