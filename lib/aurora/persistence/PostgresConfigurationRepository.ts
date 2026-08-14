import { assertAuroraTenantDbScopeId, type AuroraTenantDbScope } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import type { ConfigurationRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { TenantConfig } from "@/types/aurora-admin";

export class PostgresConfigurationRepository implements ConfigurationRepository {
  constructor(private readonly dbScope: AuroraTenantDbScope) {}

  async get(tenantId: string): Promise<TenantConfig | null> {
    assertAuroraTenantDbScopeId(tenantId);

    return this.dbScope.run(tenantId, async (client) => {
      const result = await client.query<{
        tenant_id: string;
        tier: string;
        approval_policy: Record<string, unknown>;
        token_budget: number;
        feature_overrides: Record<string, boolean>;
        limits: Record<string, number>;
      }>(
        `SELECT
           tenant_id,
           tier,
           approval_policy,
           token_budget,
           feature_overrides,
           limits
         FROM aurora_tenant_config
         WHERE tenant_id = $1`,
        [tenantId],
      );

      const row = result.rows[0];

      if (!row) {
        return null;
      }

      return {
        tenantId: row.tenant_id,
        tier: row.tier as TenantConfig["tier"],
        approvalPolicy: row.approval_policy,
        tokenBudget: row.token_budget,
        featureOverrides: row.feature_overrides,
        limits: row.limits,
      };
    });
  }

  async upsert(config: TenantConfig): Promise<TenantConfig> {
    assertAuroraTenantDbScopeId(config.tenantId);

    return this.dbScope.run(config.tenantId, async (client) => {
      const result = await client.query<{
        tenant_id: string;
        tier: string;
        approval_policy: Record<string, unknown>;
        token_budget: number;
        feature_overrides: Record<string, boolean>;
        limits: Record<string, number>;
      }>(
        `INSERT INTO aurora_tenant_config (
           tenant_id,
           tier,
           approval_policy,
           token_budget,
           feature_overrides,
           limits
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (tenant_id) DO UPDATE SET
           tier = EXCLUDED.tier,
           approval_policy = EXCLUDED.approval_policy,
           token_budget = EXCLUDED.token_budget,
           feature_overrides = EXCLUDED.feature_overrides,
           limits = EXCLUDED.limits
         RETURNING
           tenant_id,
           tier,
           approval_policy,
           token_budget,
           feature_overrides,
           limits`,
        [
          config.tenantId,
          config.tier,
          config.approvalPolicy,
          config.tokenBudget,
          config.featureOverrides,
          config.limits,
        ],
      );

      const row = result.rows[0];

      return {
        tenantId: row.tenant_id,
        tier: row.tier as TenantConfig["tier"],
        approvalPolicy: row.approval_policy,
        tokenBudget: row.token_budget,
        featureOverrides: row.feature_overrides,
        limits: row.limits,
      };
    });
  }
}
