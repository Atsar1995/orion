import type { PoolClient } from "pg";
import type { AuroraTenantDbScope } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import { assertRepositoryTenantParam } from "@/lib/aurora/persistence/postgresRepositoryUtils";

export type WorkspaceConfigRecord = {
  readonly tenantId: string;
  readonly userId: string;
  readonly activeBrandId: string | null;
  readonly dashboardLayout: Readonly<Record<string, unknown>>;
  readonly notificationPreferences: Readonly<Record<string, unknown>>;
};

export type UpsertWorkspaceConfigInput = {
  readonly tenantId: string;
  readonly userId: string;
  readonly activeBrandId?: string | null;
  readonly dashboardLayout?: Readonly<Record<string, unknown>>;
  readonly notificationPreferences?: Readonly<Record<string, unknown>>;
};

/** Minimal workspace config persistence for RLS verification (Phase 2B only). */
export class PostgresWorkspaceConfigRepository {
  constructor(
    private readonly dbScope: AuroraTenantDbScope,
    private readonly scopeTenantId: string,
  ) {}

  async get(tenantId: string, userId: string): Promise<WorkspaceConfigRecord | null> {
    assertRepositoryTenantParam(this.scopeTenantId, tenantId);
    return this.dbScope.run(this.scopeTenantId, async (client) => {
      const result = await client.query<{
        tenant_id: string;
        user_id: string;
        active_brand_id: string | null;
        dashboard_layout: Record<string, unknown>;
        notification_preferences: Record<string, unknown>;
      }>(
        `SELECT tenant_id, user_id, active_brand_id, dashboard_layout, notification_preferences
         FROM aurora_workspace_config
         WHERE tenant_id = $1 AND user_id = $2`,
        [tenantId, userId],
      );
      const row = result.rows[0];
      if (!row) {
        return null;
      }
      return {
        tenantId: row.tenant_id,
        userId: row.user_id,
        activeBrandId: row.active_brand_id,
        dashboardLayout: row.dashboard_layout,
        notificationPreferences: row.notification_preferences,
      };
    });
  }

  async upsert(input: UpsertWorkspaceConfigInput): Promise<WorkspaceConfigRecord> {
    assertRepositoryTenantParam(this.scopeTenantId, input.tenantId);
    return this.dbScope.run(this.scopeTenantId, async (client) => {
      const result = await client.query<{
        tenant_id: string;
        user_id: string;
        active_brand_id: string | null;
        dashboard_layout: Record<string, unknown>;
        notification_preferences: Record<string, unknown>;
      }>(
        `INSERT INTO aurora_workspace_config (
           tenant_id, user_id, active_brand_id, dashboard_layout, notification_preferences
         ) VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (tenant_id, user_id) DO UPDATE SET
           active_brand_id = EXCLUDED.active_brand_id,
           dashboard_layout = EXCLUDED.dashboard_layout,
           notification_preferences = EXCLUDED.notification_preferences
         RETURNING tenant_id, user_id, active_brand_id, dashboard_layout, notification_preferences`,
        [
          input.tenantId,
          input.userId,
          input.activeBrandId ?? null,
          input.dashboardLayout ?? {},
          input.notificationPreferences ?? {},
        ],
      );
      const row = result.rows[0];
      return {
        tenantId: row.tenant_id,
        userId: row.user_id,
        activeBrandId: row.active_brand_id,
        dashboardLayout: row.dashboard_layout,
        notificationPreferences: row.notification_preferences,
      };
    });
  }
}

export class PostgresWorkspaceConfigRepositoryUnsafe {
  constructor(private readonly dbScope: AuroraTenantDbScope) {}

  async getWithoutAssert(tenantScopeId: string, tenantId: string, userId: string): Promise<WorkspaceConfigRecord | null> {
    return this.dbScope.run(tenantScopeId, async (client) => {
      const result = await client.query<{
        tenant_id: string;
        user_id: string;
        active_brand_id: string | null;
        dashboard_layout: Record<string, unknown>;
        notification_preferences: Record<string, unknown>;
      }>(
        `SELECT tenant_id, user_id, active_brand_id, dashboard_layout, notification_preferences
         FROM aurora_workspace_config
         WHERE tenant_id = $1 AND user_id = $2`,
        [tenantId, userId],
      );
      const row = result.rows[0];
      if (!row) {
        return null;
      }
      return {
        tenantId: row.tenant_id,
        userId: row.user_id,
        activeBrandId: row.active_brand_id,
        dashboardLayout: row.dashboard_layout,
        notificationPreferences: row.notification_preferences,
      };
    });
  }
}

export class PostgresScheduleRepositoryUnsafe {
  constructor(private readonly dbScope: AuroraTenantDbScope) {}

  async insertWithoutAssert(
    tenantScopeId: string,
    entry: {
      id: string;
      tenantId: string;
      brandId?: string;
      scheduledAt: string;
      payload: Readonly<Record<string, unknown>>;
      status: "pending" | "dispatched" | "cancelled";
    },
  ): Promise<void> {
    await this.dbScope.run(tenantScopeId, async (client: PoolClient) => {
      await client.query(
        `INSERT INTO aurora_schedule (id, tenant_id, brand_id, scheduled_at, payload, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          entry.id,
          entry.tenantId,
          entry.brandId ?? null,
          entry.scheduledAt,
          entry.payload,
          entry.status,
        ],
      );
    });
  }

  async countForTenantWithoutAssert(tenantScopeId: string, tenantId: string): Promise<number> {
    return this.dbScope.run(tenantScopeId, async (client) => {
      const result = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM aurora_schedule WHERE tenant_id = $1`,
        [tenantId],
      );
      return Number(result.rows[0]?.count ?? 0);
    });
  }
}
