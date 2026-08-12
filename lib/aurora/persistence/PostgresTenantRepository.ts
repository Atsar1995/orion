import type { TenantRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type {
  CreateTenantInput,
  Tenant,
  UpdateTenantInput,
} from "@/types/aurora-admin";
import type { AuroraSystemDbScope } from "@/lib/aurora/persistence/AuroraSystemDbScope";
import {
  mapNotFound,
  toIsoString,
} from "@/lib/aurora/persistence/postgresRepositoryUtils";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  tier: Tenant["tier"];
  status: Tenant["status"];
  created_at: Date | string;
  updated_at: Date | string;
};

function mapTenantRow(row: TenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tier: row.tier,
    status: row.status,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

/**
 * PostgreSQL tenant repository using controlled system database scope.
 *
 * Tenant catalog operations are platform-level operations and therefore
 * intentionally do not accept a client-supplied tenant database scope.
 */
export class PostgresTenantRepository implements TenantRepository {
  constructor(private readonly dbScope: AuroraSystemDbScope) {}

  async create(
    tenantId: string,
    input: CreateTenantInput,
  ): Promise<Tenant> {
    return this.dbScope.run(async (client) => {
      const existingSlug = await client.query<{ id: string }>(
        `SELECT id
         FROM aurora_tenant
         WHERE slug = $1`,
        [input.slug],
      );

      if (existingSlug.rows[0]) {
        throw new Error("Tenant slug already exists.");
      }

      const result = await client.query<TenantRow>(
        `INSERT INTO aurora_tenant (
           id, name, slug, tier, status
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, slug, tier, status, created_at, updated_at`,
        [
          tenantId,
          input.name,
          input.slug,
          input.tier ?? "starter",
          input.status ?? "active",
        ],
      );

      return mapTenantRow(result.rows[0]);
    });
  }

  async getById(tenantId: string): Promise<Tenant | null> {
    return this.dbScope.run(async (client) => {
      const result = await client.query<TenantRow>(
        `SELECT id, name, slug, tier, status, created_at, updated_at
         FROM aurora_tenant
         WHERE id = $1`,
        [tenantId],
      );

      return result.rows[0] ? mapTenantRow(result.rows[0]) : null;
    });
  }

  async getBySlug(slug: string): Promise<Tenant | null> {
    return this.dbScope.run(async (client) => {
      const result = await client.query<TenantRow>(
        `SELECT id, name, slug, tier, status, created_at, updated_at
         FROM aurora_tenant
         WHERE slug = $1`,
        [slug],
      );

      return result.rows[0] ? mapTenantRow(result.rows[0]) : null;
    });
  }

  async update(
    tenantId: string,
    input: UpdateTenantInput,
  ): Promise<Tenant> {
    return this.dbScope.run(async (client) => {
      const result = await client.query<TenantRow>(
        `UPDATE aurora_tenant
         SET name = COALESCE($2, name),
             slug = COALESCE($3, slug),
             tier = COALESCE($4, tier),
             status = COALESCE($5, status),
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, name, slug, tier, status, created_at, updated_at`,
        [
          tenantId,
          input.name ?? null,
          input.slug ?? null,
          input.tier ?? null,
          input.status ?? null,
        ],
      );

      if (!result.rows[0]) {
        throw mapNotFound("Tenant");
      }

      return mapTenantRow(result.rows[0]);
    });
  }

  async list(): Promise<readonly Tenant[]> {
    return this.dbScope.run(async (client) => {
      const result = await client.query<TenantRow>(
        `SELECT id, name, slug, tier, status, created_at, updated_at
         FROM aurora_tenant
         ORDER BY created_at ASC`,
      );

      return result.rows.map(mapTenantRow);
    });
  }

  async delete(tenantId: string): Promise<void> {
    await this.dbScope.run(async (client) => {
      const result = await client.query(
        `DELETE FROM aurora_tenant
         WHERE id = $1`,
        [tenantId],
      );

      if (result.rowCount === 0) {
        throw mapNotFound("Tenant");
      }
    });
  }
}
