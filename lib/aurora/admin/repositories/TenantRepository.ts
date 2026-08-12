import type {
  Brand,
  CreateBrandInput,
  CreateTenantInput,
  Tenant,
  UpdateBrandInput,
  UpdateTenantInput,
} from "@/types/aurora-admin";
import type { BusinessEntityRepository } from "@/lib/aurora/admin/repositories/BusinessEntityRepository";
import type { ScheduleEntryRecord, WorkspaceConfigRecord } from "@/lib/aurora/persistence/AuroraStoreBacking";

export interface TenantRepository {
  create(tenantId: string, input: CreateTenantInput): Promise<Tenant>;
  getById(tenantId: string): Promise<Tenant | null>;
  getBySlug(slug: string): Promise<Tenant | null>;
  update(tenantId: string, input: UpdateTenantInput): Promise<Tenant>;
  list(): Promise<readonly Tenant[]>;
  delete(tenantId: string): Promise<void>;
}

export interface BrandRepository {
  create(brandId: string, input: CreateBrandInput): Promise<Brand>;
  getById(tenantId: string, brandId: string): Promise<Brand | null>;
  update(tenantId: string, brandId: string, input: UpdateBrandInput): Promise<Brand>;
  listByTenant(tenantId: string): Promise<readonly Brand[]>;
  delete(tenantId: string, brandId: string): Promise<void>;
}

export interface ScheduleRepository {
  create(entry: ScheduleEntryRecord): Promise<ScheduleEntryRecord>;
  getById(tenantId: string, scheduleId: string): Promise<ScheduleEntryRecord | null>;
  listPending(tenantId: string): Promise<readonly ScheduleEntryRecord[]>;
  update(entry: ScheduleEntryRecord): Promise<ScheduleEntryRecord>;
  delete(tenantId: string, scheduleId: string): Promise<void>;
}

export interface WorkspaceConfigRepository {
  get(tenantId: string, userId: string): Promise<WorkspaceConfigRecord | null>;
  upsert(input: WorkspaceConfigUpsertInput): Promise<WorkspaceConfigRecord>;
}

export type WorkspaceConfigUpsertInput = {
  readonly tenantId: string;
  readonly userId: string;
  readonly activeBrandId?: string | null;
  readonly dashboardLayout?: Readonly<Record<string, unknown>>;
  readonly notificationPreferences?: Readonly<Record<string, unknown>>;
};

export type AuroraRepositories = {
  readonly tenant: TenantRepository;
  readonly business: BusinessEntityRepository;
  readonly brand: BrandRepository;
  readonly schedule: ScheduleRepository;
  readonly workspaceConfig: WorkspaceConfigRepository;
};
