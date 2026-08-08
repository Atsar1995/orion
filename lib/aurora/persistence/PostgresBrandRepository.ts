import type { BrandRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { AuroraTenantDbScope } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import {
  assertRepositoryTenantParam,
  mapNotFound,
  toIsoString,
} from "@/lib/aurora/persistence/postgresRepositoryUtils";
import { AURORA_ERR_0403, AuroraError } from "@/lib/aurora/errors/AuroraError";
import type { Brand, CreateBrandInput, UpdateBrandInput } from "@/types/aurora-admin";

type BrandRow = {
  id: string;
  tenant_id: string;
  business_id: string;
  name: string;
  slug: string;
  locale: string;
  timezone: string;
  status: Brand["status"];
  created_at: Date | string;
  updated_at: Date | string;
};

function mapBrandRow(row: BrandRow): Brand {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    businessId: row.business_id,
    name: row.name,
    slug: row.slug,
    locale: row.locale,
    timezone: row.timezone,
    status: row.status,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

/** PostgreSQL brand repository with business_id and tenant RLS (WP-A002). */
export class PostgresBrandRepository implements BrandRepository {
  constructor(
    private readonly dbScope: AuroraTenantDbScope,
    private readonly scopeTenantId: string,
  ) {}

  async create(brandId: string, input: CreateBrandInput): Promise<Brand> {
    assertRepositoryTenantParam(this.scopeTenantId, input.tenantId);
    return this.dbScope.run(this.scopeTenantId, async (client) => {
      const business = await client.query<{ id: string; status: string }>(
        `SELECT id, status
         FROM aurora_business_entity
         WHERE tenant_id = $1 AND id = $2`,
        [input.tenantId, input.businessId],
      );
      if (!business.rows[0]) {
        throw mapNotFound("Business entity");
      }
      if (business.rows[0].status !== "active") {
        throw new AuroraError(AURORA_ERR_0403, "Business entity is not active.", 403);
      }

      const result = await client.query<BrandRow>(
        `INSERT INTO aurora_brand (
           id, tenant_id, business_id, name, slug, locale, timezone, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
         RETURNING id, tenant_id, business_id, name, slug, locale, timezone, status, created_at, updated_at`,
        [
          brandId,
          input.tenantId,
          input.businessId,
          input.name,
          input.slug,
          input.locale ?? "en-US",
          input.timezone ?? "UTC",
        ],
      );
      return mapBrandRow(result.rows[0]);
    });
  }

  async getById(tenantId: string, brandId: string): Promise<Brand | null> {
    assertRepositoryTenantParam(this.scopeTenantId, tenantId);
    return this.dbScope.run(this.scopeTenantId, async (client) => {
      const result = await client.query<BrandRow>(
        `SELECT id, tenant_id, business_id, name, slug, locale, timezone, status, created_at, updated_at
         FROM aurora_brand
         WHERE tenant_id = $1 AND id = $2`,
        [tenantId, brandId],
      );
      return result.rows[0] ? mapBrandRow(result.rows[0]) : null;
    });
  }

  async update(tenantId: string, brandId: string, input: UpdateBrandInput): Promise<Brand> {
    assertRepositoryTenantParam(this.scopeTenantId, tenantId);
    return this.dbScope.run(this.scopeTenantId, async (client) => {
      const existing = await client.query<{ business_id: string }>(
        `SELECT business_id FROM aurora_brand WHERE tenant_id = $1 AND id = $2`,
        [tenantId, brandId],
      );
      if (!existing.rows[0]) {
        throw mapNotFound("Brand");
      }

      const business = await client.query<{ status: string }>(
        `SELECT status FROM aurora_business_entity WHERE tenant_id = $1 AND id = $2`,
        [tenantId, existing.rows[0].business_id],
      );
      if (!business.rows[0] || business.rows[0].status !== "active") {
        throw new AuroraError(AURORA_ERR_0403, "Business entity is not active.", 403);
      }

      const result = await client.query<BrandRow>(
        `UPDATE aurora_brand
         SET
           name = COALESCE($3, name),
           slug = COALESCE($4, slug),
           locale = COALESCE($5, locale),
           timezone = COALESCE($6, timezone),
           status = COALESCE($7, status),
           updated_at = NOW()
         WHERE tenant_id = $1 AND id = $2
         RETURNING id, tenant_id, business_id, name, slug, locale, timezone, status, created_at, updated_at`,
        [
          tenantId,
          brandId,
          input.name ?? null,
          input.slug ?? null,
          input.locale ?? null,
          input.timezone ?? null,
          input.status ?? null,
        ],
      );
      return mapBrandRow(result.rows[0]);
    });
  }

  async listByTenant(tenantId: string): Promise<readonly Brand[]> {
    assertRepositoryTenantParam(this.scopeTenantId, tenantId);
    return this.dbScope.run(this.scopeTenantId, async (client) => {
      const result = await client.query<BrandRow>(
        `SELECT id, tenant_id, business_id, name, slug, locale, timezone, status, created_at, updated_at
         FROM aurora_brand
         WHERE tenant_id = $1
         ORDER BY created_at ASC`,
        [tenantId],
      );
      return result.rows.map(mapBrandRow);
    });
  }

  async delete(tenantId: string, brandId: string): Promise<void> {
    assertRepositoryTenantParam(this.scopeTenantId, tenantId);
    await this.dbScope.run(this.scopeTenantId, async (client) => {
      await client.query(`DELETE FROM aurora_brand WHERE tenant_id = $1 AND id = $2`, [
        tenantId,
        brandId,
      ]);
    });
  }
}

/** RLS regression helper — intentionally skips app-layer tenant param validation. */
export class PostgresBrandRepositoryUnsafe {
  constructor(private readonly dbScope: AuroraTenantDbScope) {}

  async getByIdWithoutAssert(tenantScopeId: string, brandId: string): Promise<Brand | null> {
    return this.dbScope.run(tenantScopeId, async (client) => {
      const result = await client.query<BrandRow>(
        `SELECT id, tenant_id, business_id, name, slug, locale, timezone, status, created_at, updated_at
         FROM aurora_brand
         WHERE id = $1`,
        [brandId],
      );
      return result.rows[0] ? mapBrandRow(result.rows[0]) : null;
    });
  }

  async updateBusinessIdWithoutAssert(
    tenantScopeId: string,
    brandId: string,
    businessId: string,
  ): Promise<void> {
    await this.dbScope.run(tenantScopeId, async (client) => {
      await client.query(`UPDATE aurora_brand SET business_id = $2, updated_at = NOW() WHERE id = $1`, [
        brandId,
        businessId,
      ]);
    });
  }
}
