import type {
  Brand,
  CreateBrandInput,
  CreateTenantInput,
  Tenant,
  UpdateBrandInput,
  UpdateTenantInput,
} from "@/types/aurora-admin";
import type { ScheduleEntryRecord } from "@/lib/aurora/persistence/AuroraStoreBacking";

export interface TenantRepository {
  create(tenantId: string, input: CreateTenantInput): Promise<Tenant>;
  getById(tenantId: string): Promise<Tenant | null>;
  getBySlug(slug: string): Promise<Tenant | null>;
  update(tenantId: string, input: UpdateTenantInput): Promise<Tenant>;
  list(): Promise<readonly Tenant[]>;
}

export interface BrandRepository {
  create(brandId: string, input: CreateBrandInput): Promise<Brand>;
  getById(tenantId: string, brandId: string): Promise<Brand | null>;
  update(tenantId: string, brandId: string, input: UpdateBrandInput): Promise<Brand>;
  listByTenant(tenantId: string): Promise<readonly Brand[]>;
}

export interface ScheduleRepository {
  create(entry: ScheduleEntryRecord): Promise<ScheduleEntryRecord>;
  getById(tenantId: string, scheduleId: string): Promise<ScheduleEntryRecord | null>;
  listPending(tenantId: string): Promise<readonly ScheduleEntryRecord[]>;
  update(entry: ScheduleEntryRecord): Promise<ScheduleEntryRecord>;
  delete(tenantId: string, scheduleId: string): Promise<void>;
}

export type AuroraRepositories = {
  readonly tenant: TenantRepository;
  readonly brand: BrandRepository;
  readonly schedule: ScheduleRepository;
};
