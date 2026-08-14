import type { BusinessEntityRepository } from "@/lib/aurora/admin/repositories/BusinessEntityRepository";
import { assertAuroraTenantDbScopeId, type AuroraTenantDbScope } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import {mapNotFound,
  toIsoString,
  type SqlClient,
} from "@/lib/aurora/persistence/postgresRepositoryUtils";
import { AuroraError } from "@/lib/aurora/errors/AuroraError";
import type {
  BusinessEntity,
  CreateBusinessEntityInput,
  UpdateBusinessEntityInput,
} from "@/types/aurora-admin";

type BusinessRow = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  status: BusinessEntity["status"];
  created_at: Date | string;
  updated_at: Date | string;
};

function mapBusinessRow(row: BusinessRow): BusinessEntity {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

/** PostgreSQL business repository with tenant scope + RLS (ES-AURORA-006 REP-1–REP-4). */
export class PostgresBusinessEntityRepository implements BusinessEntityRepository {
  constructor(private readonly dbScope: AuroraTenantDbScope) {}

  async create(businessId: string, input: CreateBusinessEntityInput): Promise<BusinessEntity> {
    assertAuroraTenantDbScopeId(input.tenantId);
    return this.dbScope.run(input.tenantId, async (client) => {
      const existingSlug = await this.getBySlugWithClient(client, input.tenantId, input.slug);
      if (existingSlug) {
        throw new AuroraError("AURORA_ERR_0409", "Business slug already exists.", 409);
      }

      const result = await client.query<BusinessRow>(
        `INSERT INTO aurora_business_entity (id, tenant_id, name, slug, status)
         VALUES ($1, $2, $3, $4, 'active')
         RETURNING id, tenant_id, name, slug, status, created_at, updated_at`,
        [businessId, input.tenantId, input.name, input.slug],
      );
      return mapBusinessRow(result.rows[0]);
    });
  }

  async getById(tenantId: string, businessId: string): Promise<BusinessEntity | null> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) => {
      const result = await client.query<BusinessRow>(
        `SELECT id, tenant_id, name, slug, status, created_at, updated_at
         FROM aurora_business_entity
         WHERE tenant_id = $1 AND id = $2`,
        [tenantId, businessId],
      );
      return result.rows[0] ? mapBusinessRow(result.rows[0]) : null;
    });
  }

  async getBySlug(tenantId: string, slug: string): Promise<BusinessEntity | null> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) =>
      this.getBySlugWithClient(client, tenantId, slug),
    );
  }

  async update(
    tenantId: string,
    businessId: string,
    input: UpdateBusinessEntityInput,
  ): Promise<BusinessEntity> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) => {
      const result = await client.query<BusinessRow>(
        `UPDATE aurora_business_entity
         SET
           name = COALESCE($3, name),
           slug = COALESCE($4, slug),
           status = COALESCE($5, status),
           updated_at = NOW()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id, tenant_id, name, slug, status, created_at, updated_at`,
        [tenantId, businessId, input.name ?? null, input.slug ?? null, input.status ?? null],
      );
      if (!result.rows[0]) {
        throw mapNotFound("Business entity");
      }
      return mapBusinessRow(result.rows[0]);
    });
  }

  async listByTenant(tenantId: string): Promise<readonly BusinessEntity[]> {
    assertAuroraTenantDbScopeId(tenantId);
    return this.dbScope.run(tenantId, async (client) => {
      const result = await client.query<BusinessRow>(
        `SELECT id, tenant_id, name, slug, status, created_at, updated_at
         FROM aurora_business_entity
         WHERE tenant_id = $1
         ORDER BY created_at ASC`,
        [tenantId],
      );
      return result.rows.map(mapBusinessRow);
    });
  }

  async delete(tenantId: string, businessId: string): Promise<void> {
    assertAuroraTenantDbScopeId(tenantId);
    await this.dbScope.run(tenantId, async (client) => {
      await client.query(`DELETE FROM aurora_business_entity WHERE tenant_id = $1 AND id = $2`, [
        tenantId,
        businessId,
      ]);
    });
  }

  private async getBySlugWithClient(
    client: SqlClient,
    tenantId: string,
    slug: string,
  ): Promise<BusinessEntity | null> {
    const result = await client.query<BusinessRow>(
      `SELECT id, tenant_id, name, slug, status, created_at, updated_at
       FROM aurora_business_entity
       WHERE tenant_id = $1 AND slug = $2`,
      [tenantId, slug],
    );
    return result.rows[0] ? mapBusinessRow(result.rows[0]) : null;
  }
}

/** RLS regression helper — intentionally skips app-layer tenant param validation. */
export class PostgresBusinessEntityRepositoryUnsafe {
  constructor(private readonly dbScope: AuroraTenantDbScope) {}

  async getByIdWithoutAssert(tenantScopeId: string, businessId: string): Promise<BusinessEntity | null> {
    return this.dbScope.run(tenantScopeId, async (client) => {
      const result = await client.query<BusinessRow>(
        `SELECT id, tenant_id, name, slug, status, created_at, updated_at
         FROM aurora_business_entity
         WHERE id = $1`,
        [businessId],
      );
      return result.rows[0] ? mapBusinessRow(result.rows[0]) : null;
    });
  }
}
