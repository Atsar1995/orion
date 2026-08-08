import {
  AURORA_ERR_0403,
  AURORA_ERR_0404,
  AuroraError,
} from "@/lib/aurora/errors/AuroraError";
import type {
  BrandRepository,
  ScheduleRepository,
  TenantRepository,
} from "@/lib/aurora/admin/repositories/TenantRepository";
import type { BusinessEntityRepository } from "@/lib/aurora/admin/repositories/BusinessEntityRepository";
import type { AuroraStoreBacking } from "@/lib/aurora/persistence/AuroraStoreBacking";
import type {
  Brand,
  BusinessEntity,
  CreateBrandInput,
  CreateBusinessEntityInput,
  CreateTenantInput,
  Tenant,
  UpdateBrandInput,
  UpdateBusinessEntityInput,
  UpdateTenantInput,
} from "@/types/aurora-admin";
import type { ScheduleEntryRecord } from "@/lib/aurora/persistence/AuroraStoreBacking";

function assertTenantScope(recordTenantId: string, tenantId: string): void {
  if (recordTenantId !== tenantId) {
    throw new AuroraError(AURORA_ERR_0403, "Tenant scope violation.", 403);
  }
}

export class InMemoryTenantRepository implements TenantRepository {
  constructor(private readonly backing: AuroraStoreBacking) {}

  async create(tenantId: string, input: CreateTenantInput): Promise<Tenant> {
    if (this.backing.tenants.has(tenantId)) {
      throw new AuroraError("AURORA_ERR_0409", "Tenant already exists.", 409);
    }

    const existingSlug = await this.getBySlug(input.slug);
    if (existingSlug) {
      throw new AuroraError("AURORA_ERR_0409", "Tenant slug already exists.", 409);
    }

    const now = new Date().toISOString();
    const tenant: Tenant = {
      id: tenantId,
      name: input.name,
      slug: input.slug,
      tier: input.tier ?? "starter",
      status: input.status ?? "active",
      createdAt: now,
      updatedAt: now,
    };

    this.backing.tenants.set(tenantId, tenant);
    return tenant;
  }

  async getById(tenantId: string): Promise<Tenant | null> {
    return this.backing.tenants.get(tenantId) ?? null;
  }

  async getBySlug(slug: string): Promise<Tenant | null> {
    for (const tenant of this.backing.tenants.values()) {
      if (tenant.slug === slug) {
        return tenant;
      }
    }
    return null;
  }

  async update(tenantId: string, input: UpdateTenantInput): Promise<Tenant> {
    const existing = await this.getById(tenantId);
    if (!existing) {
      throw new AuroraError(AURORA_ERR_0404, "Tenant not found.", 404);
    }

    const updated: Tenant = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.backing.tenants.set(tenantId, updated);
    return updated;
  }

  async list(): Promise<readonly Tenant[]> {
    return [...this.backing.tenants.values()];
  }

  async delete(tenantId: string): Promise<void> {
    this.backing.tenants.delete(tenantId);
  }
}

export class InMemoryBusinessEntityRepository implements BusinessEntityRepository {
  constructor(private readonly backing: AuroraStoreBacking) {}

  async create(businessId: string, input: CreateBusinessEntityInput): Promise<BusinessEntity> {
    const tenant = this.backing.tenants.get(input.tenantId);
    if (!tenant) {
      throw new AuroraError(AURORA_ERR_0404, "Tenant not found.", 404);
    }

    const existingSlug = await this.getBySlug(input.tenantId, input.slug);
    if (existingSlug) {
      throw new AuroraError("AURORA_ERR_0409", "Business slug already exists.", 409);
    }

    const now = new Date().toISOString();
    const business: BusinessEntity = {
      id: businessId,
      tenantId: input.tenantId,
      name: input.name,
      slug: input.slug,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    this.backing.businesses.set(businessId, business);
    return business;
  }

  async getById(tenantId: string, businessId: string): Promise<BusinessEntity | null> {
    const business = this.backing.businesses.get(businessId);
    if (!business) {
      return null;
    }
    assertTenantScope(business.tenantId, tenantId);
    return business;
  }

  async getBySlug(tenantId: string, slug: string): Promise<BusinessEntity | null> {
    for (const business of this.backing.businesses.values()) {
      if (business.tenantId === tenantId && business.slug === slug) {
        return business;
      }
    }
    return null;
  }

  async update(
    tenantId: string,
    businessId: string,
    input: UpdateBusinessEntityInput,
  ): Promise<BusinessEntity> {
    const existing = await this.getById(tenantId, businessId);
    if (!existing) {
      throw new AuroraError(AURORA_ERR_0404, "Business entity not found.", 404);
    }

    const updated: BusinessEntity = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.backing.businesses.set(businessId, updated);
    return updated;
  }

  async listByTenant(tenantId: string): Promise<readonly BusinessEntity[]> {
    return [...this.backing.businesses.values()].filter((business) => business.tenantId === tenantId);
  }

  async delete(tenantId: string, businessId: string): Promise<void> {
    const existing = await this.getById(tenantId, businessId);
    if (!existing) {
      return;
    }
    this.backing.businesses.delete(businessId);
  }
}

export class InMemoryBrandRepository implements BrandRepository {
  constructor(private readonly backing: AuroraStoreBacking) {}

  async create(brandId: string, input: CreateBrandInput): Promise<Brand> {
    const tenant = this.backing.tenants.get(input.tenantId);
    if (!tenant) {
      throw new AuroraError(AURORA_ERR_0404, "Tenant not found.", 404);
    }

    const business = this.backing.businesses.get(input.businessId);
    if (!business) {
      throw new AuroraError(AURORA_ERR_0404, "Business entity not found.", 404);
    }
    assertTenantScope(business.tenantId, input.tenantId);
    if (business.status !== "active") {
      throw new AuroraError(AURORA_ERR_0403, "Business entity is not active.", 403);
    }

    const now = new Date().toISOString();
    const brand: Brand = {
      id: brandId,
      tenantId: input.tenantId,
      businessId: input.businessId,
      name: input.name,
      slug: input.slug,
      locale: input.locale ?? "en-US",
      timezone: input.timezone ?? "UTC",
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    this.backing.brands.set(brandId, brand);
    return brand;
  }

  async getById(tenantId: string, brandId: string): Promise<Brand | null> {
    const brand = this.backing.brands.get(brandId);
    if (!brand) {
      return null;
    }
    assertTenantScope(brand.tenantId, tenantId);
    return brand;
  }

  async update(
    tenantId: string,
    brandId: string,
    input: UpdateBrandInput,
  ): Promise<Brand> {
    const existing = await this.getById(tenantId, brandId);
    if (!existing) {
      throw new AuroraError(AURORA_ERR_0404, "Brand not found.", 404);
    }

    const business = this.backing.businesses.get(existing.businessId);
    if (!business || business.status !== "active") {
      throw new AuroraError(AURORA_ERR_0403, "Business entity is not active.", 403);
    }

    const updated: Brand = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    this.backing.brands.set(brandId, updated);
    return updated;
  }

  async listByTenant(tenantId: string): Promise<readonly Brand[]> {
    return [...this.backing.brands.values()].filter((brand) => brand.tenantId === tenantId);
  }

  async delete(tenantId: string, brandId: string): Promise<void> {
    const existing = await this.getById(tenantId, brandId);
    if (!existing) {
      return;
    }
    this.backing.brands.delete(brandId);
  }
}

export class InMemoryScheduleRepository implements ScheduleRepository {
  constructor(private readonly backing: AuroraStoreBacking) {}

  async create(entry: ScheduleEntryRecord): Promise<ScheduleEntryRecord> {
    this.backing.schedules.set(entry.id, entry);
    return entry;
  }

  async getById(tenantId: string, scheduleId: string): Promise<ScheduleEntryRecord | null> {
    const entry = this.backing.schedules.get(scheduleId);
    if (!entry) {
      return null;
    }
    assertTenantScope(entry.tenantId, tenantId);
    return entry;
  }

  async listPending(tenantId: string): Promise<readonly ScheduleEntryRecord[]> {
    return [...this.backing.schedules.values()].filter(
      (entry) => entry.tenantId === tenantId && entry.status === "pending",
    );
  }

  async update(entry: ScheduleEntryRecord): Promise<ScheduleEntryRecord> {
    this.backing.schedules.set(entry.id, entry);
    return entry;
  }

  async delete(tenantId: string, scheduleId: string): Promise<void> {
    const existing = await this.getById(tenantId, scheduleId);
    if (!existing) {
      throw new AuroraError(AURORA_ERR_0404, "Schedule not found.", 404);
    }
    this.backing.schedules.delete(scheduleId);
  }
}
